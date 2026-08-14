"use server";

import { revalidatePath } from "next/cache";
import { deleteProduct, setProductEstado } from "../services/product.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import type { ESTADOS_PRODUCTO } from "../schemas/product.schema";

export type ActionResult = { success: boolean; message?: string };

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await deleteProduct(id);
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
  try {
    await setProductEstado(id, estado);
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}
