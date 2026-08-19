import { uploadFile, deleteFile, getPublicUrl } from "@/src/shared/lib/storage";
import { STORAGE_BUCKETS } from "@/src/shared/constants/storage";
import { logger } from "@/src/shared/lib/logger";

/**
 * Sube una imagen de catálogo (categoría o producto) al bucket público
 * `productos` y devuelve su URL pública. Antepone un timestamp al nombre
 * de archivo para evitar colisiones al reemplazar la imagen de una entidad
 * ya existente (el bucket se sube con `upsert: false`).
 */
export async function uploadCatalogImage(
  entityId: string,
  file: File,
): Promise<string> {
  const renamed = new File([file], `${Date.now()}-${file.name}`, {
    type: file.type,
  });

  const ref = await uploadFile({
    bucket: STORAGE_BUCKETS.PRODUCTOS,
    entityId,
    file: renamed,
  });

  return getPublicUrl(ref);
}

/**
 * Sube una imagen de configuración (logo, banner del inicio) al bucket
 * público `configuracion` y devuelve su URL pública.
 */
export async function uploadConfigImage(
  entityId: string,
  file: File,
): Promise<string> {
  const renamed = new File([file], `${Date.now()}-${file.name}`, {
    type: file.type,
  });

  const ref = await uploadFile({
    bucket: STORAGE_BUCKETS.CONFIGURACION,
    entityId,
    file: renamed,
  });

  return getPublicUrl(ref);
}

/** Borra del bucket `configuracion` la imagen cuya URL pública se guardó. */
export async function deleteConfigImageByUrl(url: string | null | undefined) {
  if (!url) return;

  const marker = `/storage/v1/object/public/${STORAGE_BUCKETS.CONFIGURACION}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;

  const path = decodeURIComponent(url.slice(index + marker.length));

  try {
    await deleteFile({ bucket: STORAGE_BUCKETS.CONFIGURACION, path });
  } catch (error) {
    logger.warn("No se pudo eliminar la imagen del storage", { path, error });
  }
}
/** Extrae un File válido de FormData, o `null` si el campo está vacío. */
export function getOptionalFile(
  formData: FormData,
  field: string,
): File | null {
  const value = formData.get(field);
  if (value instanceof File && value.size > 0) {
    return value;
  }
  return null;
}

/**
 * Borra del bucket `productos` la imagen cuya URL pública se guardó en la
 * base de datos. No lanza si la URL no coincide con el bucket esperado o si
 * el archivo ya no existe: perder un archivo huérfano en storage no debe
 * bloquear la operación (borrar el registro en la base de datos) que lo
 * originó.
 */
export async function deleteCatalogImageByUrl(url: string | null | undefined) {
  if (!url) return;

  const marker = `/storage/v1/object/public/${STORAGE_BUCKETS.PRODUCTOS}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;

  const path = decodeURIComponent(url.slice(index + marker.length));

  try {
    await deleteFile({ bucket: STORAGE_BUCKETS.PRODUCTOS, path });
  } catch (error) {
    logger.warn("No se pudo eliminar la imagen del storage", { path, error });
  }
}
