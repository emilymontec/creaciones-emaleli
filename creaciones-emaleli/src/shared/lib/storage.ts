import { AppError } from "@/src/shared/lib/errors";
import { getServerSupabase } from "@/src/shared/lib/supabase";
import {
  STORAGE_LIMITS,
  type StorageBucket,
} from "@/src/shared/constants/storage";

export interface StorageUploadInput {
  bucket: StorageBucket;
  entityId: string;
  file: File;
}

export interface StorageFileRef {
  bucket: StorageBucket;
  path: string;
}

function safeFilename(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? filename;
  const sanitized = base.replace(/[^\w.-]/g, "_");
  return sanitized || "archivo";
}

export function buildStoragePath(
  bucket: StorageBucket,
  entityId: string,
  filename: string,
): string {
  return `${bucket}/${entityId}/${safeFilename(filename)}`;
}

export async function uploadFile({
  bucket,
  entityId,
  file,
}: StorageUploadInput): Promise<StorageFileRef> {
  const limits = STORAGE_LIMITS[bucket];

  if (!limits.allowedTypes.includes(file.type)) {
    throw new AppError(
      `Tipo de archivo no permitido (${file.type || "desconocido"}). Tipos válidos: ${limits.allowedTypes.join(", ")}.`,
      { statusCode: 400, code: "STORAGE_INVALID_TYPE" },
    );
  }

  if (file.size > limits.maxBytes) {
    throw new AppError(
      `El archivo excede el tamaño máximo de ${limits.maxBytes / (1024 * 1024)} MB.`,
      { statusCode: 400, code: "STORAGE_TOO_LARGE" },
    );
  }

  const path = buildStoragePath(bucket, entityId, file.name);
  const { error } = await getServerSupabase()
    .storage.from(bucket)
    .upload(path, file, { upsert: false });

  if (error) {
    throw new AppError(`Error al subir el archivo: ${error.message}`, {
      statusCode: 500,
      code: "STORAGE_UPLOAD_FAILED",
    });
  }

  return { bucket, path };
}

export async function deleteFile({
  bucket,
  path,
}: StorageFileRef): Promise<void> {
  const { error } = await getServerSupabase()
    .storage.from(bucket)
    .remove([path]);

  if (error) {
    throw new AppError(`Error al eliminar el archivo: ${error.message}`, {
      statusCode: 500,
      code: "STORAGE_DELETE_FAILED",
    });
  }
}

export function getPublicUrl({ bucket, path }: StorageFileRef): string {
  const { data } = getServerSupabase().storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
