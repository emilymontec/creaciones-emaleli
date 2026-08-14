"use server";

import { revalidatePath } from "next/cache";
import { CategoryUpdateSchema } from "../schemas/category.schema";
import { updateCategory } from "../services/category.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import {
  getOptionalFile,
  uploadCatalogImage,
} from "@/src/backend/shared/uploadEntityImage";
import type { CategoryFormState } from "./createCategory";

export async function updateCategoryAction(
  prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const id = formData.get("id");
  const imagenFile = getOptionalFile(formData, "imagenArchivo");
  const imagenActual = (formData.get("imagenActual") as string) || undefined;

  const result = CategoryUpdateSchema.safeParse({
    id,
    nombre: formData.get("nombre"),
    slug: formData.get("slug"),
    descripcion: formData.get("descripcion") || undefined,
    imagen: imagenActual,
    activo: formData.get("activo") === "true",
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const imagen = imagenFile
      ? await uploadCatalogImage(result.data.id, imagenFile)
      : result.data.imagen;

    await updateCategory({ ...result.data, imagen });

    revalidatePath("/admin/categorias");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: toErrorMessage(error),
    };
  }
}
