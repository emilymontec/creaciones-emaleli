"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { CategorySchema } from "../schemas/category.schema";
import { createCategory } from "../services/category.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import {
  getOptionalFile,
  uploadCatalogImage,
} from "@/src/backend/shared/uploadEntityImage";

export type CategoryFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

export async function createCategoryAction(
  prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const imagenFile = getOptionalFile(formData, "imagenArchivo");

  const result = CategorySchema.safeParse({
    nombre: formData.get("nombre"),
    slug: formData.get("slug"),
    descripcion: formData.get("descripcion") || undefined,
    imagen: undefined,
    activo: formData.get("activo") === "true",
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    // La imagen se sube usando un id temporal como carpeta: como Supabase
    // Storage no depende de que la fila ya exista en la base de datos, no
    // hace falta crear la categoría primero para tener su id definitivo.
    const imagen = imagenFile
      ? await uploadCatalogImage(`categoria-${randomUUID()}`, imagenFile)
      : undefined;

    await createCategory({ ...result.data, imagen });

    revalidatePath("/admin/categorias");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: toErrorMessage(error),
    };
  }
}
