import * as repository from "../repositories/category.repository";
import { CategoryInput, CategoryUpdateInput } from "../schemas/category.schema";
import { AppError } from "@/src/shared/lib/errors";

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

  return repository.create({ ...normalize(data), orden });
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

  return repository.update(id, rest);
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

  return repository.remove(id);
}

export async function toggleCategoryActivo(id: string) {
  const categoria = await repository.findById(id);

  if (!categoria) {
    throw new AppError("La categoría no existe.", {
      statusCode: 404,
      code: "CATEGORY_NOT_FOUND",
    });
  }

  return repository.update(id, { activo: !categoria.activo });
}

export async function reorderCategorias(orderedIds: string[]) {
  const items = orderedIds.map((id, index) => ({ id, orden: index + 1 }));
  return repository.reorder(items);
}

export async function getCategories() {
  return repository.findAll();
}

export async function getPublicCategories() {
  const categorias = await repository.findAll();
  return categorias.filter((c: Awaited<ReturnType<typeof repository.findAll>>[number]) => c.activo);
}

export async function getCategoryById(id: string) {
  return repository.findById(id);
}
