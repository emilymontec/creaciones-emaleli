"use server";

import { revalidatePath } from "next/cache";
import * as personalizationService from "../services/personalization.service";
import { PersonalizationSchema } from "../schemas/personalization.schema";
import { toErrorMessage } from "@/src/shared/lib/errors";
import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";

export type ActionResult = { success: boolean; message?: string };

function revalidate(productoId: string) {
  revalidatePath(`/admin/productos/${productoId}`);
}

export async function createFieldAction(
  productoId: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  const result = PersonalizationSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await personalizationService.createField({
      productoId,
      nombre: result.data.nombre,
      tipo: result.data.tipo,
      obligatorio: result.data.obligatorio,
      precioExtra:
        result.data.precioExtra === "" ? undefined : result.data.precioExtra,
      config: result.data.config,
    });
    revalidate(productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function updateFieldAction(
  productoId: string,
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  const result = PersonalizationSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await personalizationService.updateField(id, {
      nombre: result.data.nombre,
      obligatorio: result.data.obligatorio,
      precioExtra:
        result.data.precioExtra === "" ? undefined : result.data.precioExtra,
      config: result.data.config,
    });
    revalidate(productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function toggleFieldActivoAction(
  productoId: string,
  id: string,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await personalizationService.toggleActivo(id);
    revalidate(productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function deleteFieldAction(
  productoId: string,
  id: string,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await personalizationService.deleteField(id);
    revalidate(productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function reorderFieldsAction(
  productoId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await personalizationService.reorderFields(orderedIds);
    revalidate(productoId);
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}
