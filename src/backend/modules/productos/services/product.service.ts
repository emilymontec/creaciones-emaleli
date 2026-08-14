import * as repository from "../repositories/product.repository";
import { ProductInput, ProductUpdateInput } from "../schemas/product.schema";
import { AppError } from "@/src/shared/lib/errors";
import { Prisma } from "@/generated/prisma/client";

/** Convierte campos numéricos/texto opcionales que llegan como "" en undefined. */
function normalize(data: ProductInput) {
  return {
    nombre: data.nombre,
    slug: data.slug,
    descripcionCorta: data.descripcionCorta || undefined,
    descripcionLarga: data.descripcionLarga || undefined,
    precioBase: data.precioBase,
    precioDescuento:
      data.precioDescuento === "" || data.precioDescuento === undefined
        ? undefined
        : data.precioDescuento,
    tiempoProduccion:
      data.tiempoProduccion === "" || data.tiempoProduccion === undefined
        ? undefined
        : data.tiempoProduccion,
    estado: data.estado,
    destacado: data.destacado,
    seoTitulo: data.seoTitulo || undefined,
    seoDescripcion: data.seoDescripcion || undefined,
    seoImagen: data.seoImagen || undefined,
  };
}

export async function createProduct(data: ProductInput) {
  const exists = await repository.findBySlug(data.slug);

  if (exists) {
    throw new AppError("Ya existe un producto con ese slug.", {
      statusCode: 409,
      code: "PRODUCT_SLUG_CONFLICT",
    });
  }

  const payload: Prisma.ProductoCreateInput = {
    ...normalize(data),
    categorias: { connect: data.categoriaIds.map((id) => ({ id })) },
  };

  return repository.create(payload);
}

export async function updateProduct(data: ProductUpdateInput) {
  const current = await repository.findById(data.id);

  if (!current) {
    throw new AppError("El producto no existe.", {
      statusCode: 404,
      code: "PRODUCT_NOT_FOUND",
    });
  }

  if (data.slug !== current.slug) {
    const exists = await repository.findBySlug(data.slug);
    if (exists) {
      throw new AppError("Ya existe un producto con ese slug.", {
        statusCode: 409,
        code: "PRODUCT_SLUG_CONFLICT",
      });
    }
  }

  const payload: Prisma.ProductoUpdateInput = {
    ...normalize(data),
    categorias: { set: data.categoriaIds.map((id) => ({ id })) },
  };

  return repository.update(data.id, payload);
}

export async function deleteProduct(id: string) {
  const producto = await repository.findById(id);

  if (!producto) {
    throw new AppError("El producto no existe.", {
      statusCode: 404,
      code: "PRODUCT_NOT_FOUND",
    });
  }

  try {
    return await repository.remove(id);
  } catch {
    // Falla la FK (el producto ya tiene pedidos/variantes asociados): se
    // protege el historial de pedidos y se sugiere desactivar en su lugar.
    throw new AppError(
      `No puedes eliminar "${producto.nombre}" porque ya tiene pedidos u otros datos asociados. Desactívalo en su lugar.`,
      { statusCode: 409, code: "PRODUCT_HAS_DEPENDENCIES" },
    );
  }
}

export async function setProductEstado(
  id: string,
  estado: "ACTIVO" | "INACTIVO" | "AGOTADO",
) {
  const producto = await repository.findById(id);

  if (!producto) {
    throw new AppError("El producto no existe.", {
      statusCode: 404,
      code: "PRODUCT_NOT_FOUND",
    });
  }

  return repository.setEstado(id, estado);
}

export async function getProducts() {
  return repository.findAll();
}

export async function getProductById(id: string) {
  return repository.findById(id);
}
