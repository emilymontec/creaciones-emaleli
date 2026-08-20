"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { ProductSchema } from "../schemas/product.schema";
import { createProduct } from "../services/product.service";
import { ensurePrincipalFromSeo, addImagen } from "../services/gallery.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import {
  getOptionalFile,
  uploadCatalogImage,
} from "@/src/backend/shared/uploadEntityImage";
import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";

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
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

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

    const producto = await createProduct({ ...result.data, seoImagen });

    if (seoImagen) {
      await ensurePrincipalFromSeo(producto.id, seoImagen);
    }

    const galeriaFiles = formData
      .getAll("galeriaArchivos")
      .filter((f): f is File => f instanceof File && f.size > 0);

    for (const file of galeriaFiles) {
      const url = await uploadCatalogImage(
        `producto-${producto.id}-${randomUUID()}`,
        file,
      );
      await addImagen(producto.id, url);
    }

    revalidatePath("/admin/productos");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: toErrorMessage(error),
    };
  }
}
