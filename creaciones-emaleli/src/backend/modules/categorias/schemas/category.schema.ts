import { z } from "zod";
import { SLUG_REGEX } from "@/src/shared/lib/slug";

export const CategorySchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100),

  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .max(100)
    .regex(
      SLUG_REGEX,
      "El slug solo puede tener minúsculas, números y guiones (ej. mi-categoria).",
    ),

  descripcion: z
    .string()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),

  imagen: z.string().url().optional().or(z.literal("")),

  activo: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

/** Para edición: mismos campos + id de la categoría a actualizar. */
export const CategoryUpdateSchema = CategorySchema.extend({
  id: z.string().min(1, "Falta el id de la categoría."),
});

export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;
