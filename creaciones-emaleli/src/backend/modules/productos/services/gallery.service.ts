import * as repository from "../repositories/gallery.repository";
import { AppError } from "@/src/shared/lib/errors";
import { deleteCatalogImageByUrl } from "@/src/backend/shared/uploadEntityImage";

const MAX_IMAGENES_POR_PRODUCTO = 10;

export async function getGaleria(productoId: string) {
  return repository.findByProducto(productoId);
}

/** Agrega una imagen ya subida a storage. La primera imagen del producto
 * queda como principal automáticamente. */
export async function addImagen(productoId: string, url: string) {
  const total = await repository.count(productoId);

  if (total >= MAX_IMAGENES_POR_PRODUCTO) {
    throw new AppError(
      `Un producto puede tener máximo ${MAX_IMAGENES_POR_PRODUCTO} imágenes.`,
      { statusCode: 400, code: "GALLERY_LIMIT_REACHED" },
    );
  }

  const orden = await repository.nextOrden(productoId);

  return repository.create({
    productoId,
    url,
    principal: total === 0,
    orden,
  });
}

export async function removeImagen(id: string) {
  const imagen = await repository.findById(id);

  if (!imagen) {
    throw new AppError("La imagen no existe.", {
      statusCode: 404,
      code: "IMAGE_NOT_FOUND",
    });
  }

  await repository.remove(id);
  await deleteCatalogImageByUrl(imagen.url);

  // Si era la principal, promueve la primera imagen restante (si hay).
  if (imagen.principal) {
    const restantes = await repository.findByProducto(imagen.productoId);
    if (restantes[0]) {
      await repository.setPrincipal(imagen.productoId, restantes[0].id);
    }
  }
}

export async function setImagenPrincipal(productoId: string, imagenId: string) {
  const imagen = await repository.findById(imagenId);

  if (!imagen || imagen.productoId !== productoId) {
    throw new AppError("La imagen no existe para este producto.", {
      statusCode: 404,
      code: "IMAGE_NOT_FOUND",
    });
  }

  return repository.setPrincipal(productoId, imagenId);
}

export async function reorderGaleria(orderedIds: string[]) {
  const items = orderedIds.map((id, index) => ({ id, orden: index + 1 }));
  return repository.reorder(items);
}
