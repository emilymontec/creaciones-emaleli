"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { ProductSchema } from "../schemas/product.schema";
import { createProduct } from "../services/product.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import {
  getOptionalFile,
  uploadCatalogImage,
} from "@/src/backend/shared/uploadEntityImage";

export type ProductFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

function parseFormData(formData: FormData) {
  return {
    nombre: formData.get("nombre"),
    slug: formData.get("slug"),
    descripcionCorta: formData.get("descripcionCorta") || undefined,
    descripcionLarga: formData.get("descripcionLarga") || undefined,
    precioBase: formData.get("precioBase"),
    precioDescuento: formData.get("precioDescuento") || undefined,
    tiempoProduccion: formData.get("tiempoProduccion") || undefined,
    estado: formData.get("estado") || "ACTIVO",
    destacado: formData.get("destacado") === "true",
    categoriaIds: formData.getAll("categoriaIds").map(String),
    seoTitulo: formData.get("seoTitulo") || undefined,
    seoDescripcion: formData.get("seoDescripcion") || undefined,
    seoImagen: undefined as string | undefined,
  };
}

export async function createProductAction(
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const seoImagenFile = getOptionalFile(formData, "seoImagenArchivo");

  const result = ProductSchema.safeParse(parseFormData(formData));

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const seoImagen = seoImagenFile
      ? await uploadCatalogImage(`producto-${randomUUID()}`, seoImagenFile)
      : undefined;

    await createProduct({ ...result.data, seoImagen });

    revalidatePath("/admin/productos");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: toErrorMessage(error),
    };
  }
}
