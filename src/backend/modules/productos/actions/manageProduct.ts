"use server";

import { revalidatePath } from "next/cache";
import { deleteProduct, setProductEstado } from "../services/product.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";
import type { ESTADOS_PRODUCTO } from "../schemas/product.schema";
import { registrarAuditoria } from "@/src/backend/shared/audit-log";

export type ActionResult = { success: boolean; message?: string };

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const user = await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await deleteProduct(id);
    await registrarAuditoria({
      usuarioId: user.sub,
      usuarioNombre: user.nombre,
      accion: "PRODUCTO_ELIMINADO",
      entidad: "Producto",
      entidadId: id,
    });
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function setProductEstadoAction(
  id: string,
  estado: (typeof ESTADOS_PRODUCTO)[number],
): Promise<ActionResult> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  try {
    await setProductEstado(id, estado);
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}
