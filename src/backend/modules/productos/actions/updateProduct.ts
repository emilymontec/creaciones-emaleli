"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { ProductUpdateSchema } from "../schemas/product.schema";
import { updateProduct } from "../services/product.service";
import { ensurePrincipalFromSeo, addImagen } from "../services/gallery.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import {
  getOptionalFile,
  uploadCatalogImage,
} from "@/src/backend/shared/uploadEntityImage";
import type { ProductFormState } from "./createProduct";
import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";

export async function updateProductAction(
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin(PERMISOS.CATALOGO_GESTIONAR);

  const id = formData.get("id") as string;
  const seoImagenFile = getOptionalFile(formData, "seoImagenArchivo");
  const seoImagenActual =
    (formData.get("seoImagenActual") as string) || undefined;

  const result = ProductUpdateSchema.safeParse({
    id,
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
    seoImagen: seoImagenActual,
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const seoImagen = seoImagenFile
      ? await uploadCatalogImage(result.data.id, seoImagenFile)
      : result.data.seoImagen;

    await updateProduct({ ...result.data, seoImagen });

    if (seoImagen) {
      await ensurePrincipalFromSeo(result.data.id, seoImagen);
    }

    const galeriaFiles = formData
      .getAll("galeriaArchivos")
      .filter((f): f is File => f instanceof File && f.size > 0);

    for (const file of galeriaFiles) {
      const url = await uploadCatalogImage(
        `producto-${result.data.id}-${randomUUID()}`,
        file,
      );
      await addImagen(result.data.id, url);
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
