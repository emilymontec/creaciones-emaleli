"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import * as gallery from "../services/gallery.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import { uploadCatalogImage } from "@/src/backend/shared/uploadEntityImage";
import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";

export type ActionResult = { success: boolean; message?: string };

export async function uploadGalleryImagesAction(
  productoId: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  const files = formData
    .getAll("archivos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return { success: false, message: "Selecciona al menos una imagen." };
  }

  try {
    // Secuencial (no Promise.all) para no saturar el bucket ni perder el
    // orden en que el usuario seleccionó los archivos.
    for (const file of files) {
      const url = await uploadCatalogImage(
        `producto-${productoId}-${randomUUID()}`,
        file,
      );
      await gallery.addImagen(productoId, url);
    }

    revalidatePath(`/admin/productos/${productoId}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function deleteGalleryImageAction(
  productoId: string,
  imagenId: string,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await gallery.removeImagen(imagenId);
    revalidatePath(`/admin/productos/${productoId}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function setGalleryPrincipalAction(
  productoId: string,
  imagenId: string,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await gallery.setImagenPrincipal(productoId, imagenId);
    revalidatePath(`/admin/productos/${productoId}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function reorderGalleryAction(
  productoId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await gallery.reorderGaleria(orderedIds);
    revalidatePath(`/admin/productos/${productoId}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}
