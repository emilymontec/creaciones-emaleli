"use server";

import { revalidatePath } from "next/cache";
import {
  deleteCategory,
  reorderCategorias,
  toggleCategoryActivo,
} from "../services/category.service";
import { toErrorMessage } from "@/src/shared/lib/errors";

export type ActionResult = { success: boolean; message?: string };

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await deleteCategory(id);
    revalidatePath("/admin/categorias");
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function toggleCategoryActivoAction(
  id: string,
): Promise<ActionResult> {
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
  try {
    await reorderCategorias(orderedIds);
    revalidatePath("/admin/categorias");
    return { success: true };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}
