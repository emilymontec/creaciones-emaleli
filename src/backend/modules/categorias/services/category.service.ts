import * as repository from "../repositories/category.repository";
import { CategoryInput, CategoryUpdateInput } from "../schemas/category.schema";
import { AppError } from "@/src/shared/lib/errors";
import { unstable_cache, updateTag } from "next/cache";

const CATEGORIAS_PUBLICAS_TAG = "categorias-publicas";

/** Normaliza campos opcionales que llegan como string vacío desde el form. */
function normalize<T extends { descripcion?: string; imagen?: string }>(
  data: T,
) {
  return {
    ...data,
    descripcion: data.descripcion || undefined,
    imagen: data.imagen || undefined,
  };
}

export async function createCategory(data: CategoryInput) {
  const exists = await repository.findBySlug(data.slug);

  if (exists) {
    throw new AppError("Ya existe una categoría con ese slug.", {
      statusCode: 409,
      code: "CATEGORY_SLUG_CONFLICT",
    });
  }

  const orden = await repository.nextOrden();

  const creada = await repository.create({ ...normalize(data), orden });
  updateTag(CATEGORIAS_PUBLICAS_TAG);
  return creada;
}

export async function updateCategory(data: CategoryUpdateInput) {
  const current = await repository.findById(data.id);

  if (!current) {
    throw new AppError("La categoría no existe.", {
      statusCode: 404,
      code: "CATEGORY_NOT_FOUND",
    });
  }

  if (data.slug !== current.slug) {
    const exists = await repository.findBySlug(data.slug);
    if (exists) {
      throw new AppError("Ya existe una categoría con ese slug.", {
        statusCode: 409,
        code: "CATEGORY_SLUG_CONFLICT",
      });
    }
  }

  const { id, ...rest } = normalize(data);

  const actualizada = await repository.update(id, rest);
  updateTag(CATEGORIAS_PUBLICAS_TAG);
  return actualizada;
}

export async function deleteCategory(id: string) {
  const categoria = await repository.findWithProductCount(id);

  if (!categoria) {
    throw new AppError("La categoría no existe.", {
      statusCode: 404,
      code: "CATEGORY_NOT_FOUND",
    });
  }

  if (categoria._count.productos > 0) {
    throw new AppError(
      `No puedes eliminar "${categoria.nombre}" porque tiene ${categoria._count.productos} producto(s) asociado(s). Desactívala o reasigna sus productos primero.`,
      { statusCode: 409, code: "CATEGORY_HAS_PRODUCTS" },
    );
  }

  const eliminada = await repository.remove(id);
  updateTag(CATEGORIAS_PUBLICAS_TAG);
  return eliminada;
}

export async function toggleCategoryActivo(id: string) {
  const categoria = await repository.findById(id);

  if (!categoria) {
    throw new AppError("La categoría no existe.", {
      statusCode: 404,
      code: "CATEGORY_NOT_FOUND",
    });
  }

  const actualizada = await repository.update(id, {
    activo: !categoria.activo,
  });
  updateTag(CATEGORIAS_PUBLICAS_TAG);
  return actualizada;
}

export async function reorderCategorias(orderedIds: string[]) {
  const items = orderedIds.map((id, index) => ({ id, orden: index + 1 }));
  const resultado = await repository.reorder(items);
  updateTag(CATEGORIAS_PUBLICAS_TAG);
  return resultado;
}

export async function getCategories() {
  return repository.findAll();
}

export const getPublicCategories = unstable_cache(
  async () => {
    const categorias = await repository.findAll();
    return categorias.filter(
      (c: Awaited<ReturnType<typeof repository.findAll>>[number]) => c.activo,
    );
  },
  ["categorias-publicas"],
  // 5 minutos de caché: las categorías cambian con muy poca frecuencia,
  // pero cualquier mutación (crear/editar/borrar/reordenar) invalida el
  // tag de inmediato — la caché no retrasa los cambios del admin.
  { tags: [CATEGORIAS_PUBLICAS_TAG], revalidate: 300 },
);

export async function getCategoryById(id: string) {
  return repository.findById(id);
}
