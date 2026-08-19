"use server";

import { revalidatePath } from "next/cache";
import {
  deleteCategory,
  reorderCategorias,
  toggleCategoryActivo,
} from "../services/category.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";
import { registrarAuditoria } from "@/src/backend/shared/audit-log";

export type ActionResult = { success: boolean; message?: string };

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const user = await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await deleteCategory(id);
    await registrarAuditoria({
      usuarioId: user.sub,
      usuarioNombre: user.nombre,
      accion: "CATEGORIA_ELIMINADA",
      entidad: "Categoria",
      entidadId: id,
    });
    revalidatePath("/admin/categorias");
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function toggleCategoryActivoAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await toggleCategoryActivo(id);
    revalidatePath("/admin/categorias");
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function reorderCategoriasAction(
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await reorderCategorias(orderedIds);
    revalidatePath("/admin/categorias");
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}
