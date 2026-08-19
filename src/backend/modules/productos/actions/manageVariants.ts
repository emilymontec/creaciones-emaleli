"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import * as variantService from "../services/variant.service";
import {
  VariantOpcionSchema,
  CombinacionUpdateSchema,
} from "../schemas/variant.schema";
import { toErrorMessage } from "@/src/shared/lib/errors";
import { uploadCatalogImage } from "@/src/backend/shared/uploadEntityImage";
import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";

export type ActionResult = { success: boolean; message?: string };

function revalidate(productoId: string) {
  revalidatePath(`/admin/productos/${productoId}`);
}

export async function createOpcionAction(input: {
  productoId: string;
  nombre: string;
  tipo: string;
  precioExtra: number;
  imagen?: File;
}): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  const result = VariantOpcionSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    const imagen =
      input.imagen && input.imagen.size > 0
        ? await uploadCatalogImage(
            `variante-${input.productoId}-${randomUUID()}`,
            input.imagen,
          )
        : undefined;

    await variantService.createOpcion({
      productoId: input.productoId,
      ...result.data,
      imagen,
    });

    revalidate(input.productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function updateOpcionAction(
  productoId: string,
  id: string,
  input: { nombre: string; precioExtra: number; imagen?: File },
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    const imagen =
      input.imagen && input.imagen.size > 0
        ? await uploadCatalogImage(`variante-${productoId}-${id}`, input.imagen)
        : undefined;

    await variantService.updateOpcion(id, {
      nombre: input.nombre,
      precioExtra: input.precioExtra,
      imagen,
    });

    revalidate(productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function toggleOpcionActivoAction(
  productoId: string,
  id: string,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await variantService.toggleOpcionActivo(id);
    revalidate(productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function deleteOpcionAction(
  productoId: string,
  id: string,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await variantService.deleteOpcion(id);
    revalidate(productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function generateCombinacionesAction(
  productoId: string,
  gruposOpcionIds: string[][],
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await variantService.generateCombinaciones(productoId, gruposOpcionIds);
    revalidate(productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function updateCombinacionAction(
  productoId: string,
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  const result = CombinacionUpdateSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await variantService.updateCombinacion(id, {
      sku: result.data.sku || undefined,
      precio: result.data.precio === "" ? null : result.data.precio,
      stock: result.data.stock === "" ? null : result.data.stock,
      activo: result.data.activo,
    });
    revalidate(productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function deleteCombinacionAction(
  productoId: string,
  id: string,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await variantService.deleteCombinacion(id);
    revalidate(productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}
