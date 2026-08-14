import { z } from "zod";
import { SLUG_REGEX } from "@/src/shared/lib/slug";

export const ESTADOS_PRODUCTO = ["ACTIVO", "INACTIVO", "AGOTADO"] as const;

const ProductBaseSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(150),

  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .max(150)
    .regex(
      SLUG_REGEX,
      "El slug solo puede tener minúsculas, números y guiones (ej. mi-producto).",
    ),

  descripcionCorta: z
    .string()
    .max(200, "La descripción corta no puede superar los 200 caracteres")
    .optional()
    .or(z.literal("")),

  descripcionLarga: z.string().optional().or(z.literal("")),

  precioBase: z.coerce
    .number({ error: "El precio base es obligatorio" })
    .positive("El precio base debe ser mayor a 0"),

  precioDescuento: z.coerce
    .number()
    .positive("El precio con descuento debe ser mayor a 0")
    .optional()
    .or(z.literal("")),

  tiempoProduccion: z.coerce
    .number()
    .int("Debe ser un número entero de días")
    .nonnegative("No puede ser negativo")
    .optional()
    .or(z.literal("")),

  estado: z.enum(ESTADOS_PRODUCTO).default("ACTIVO"),

  destacado: z.boolean().default(false),

  categoriaIds: z
    .array(z.string().min(1))
    .min(1, "Selecciona al menos una categoría"),

  seoTitulo: z
    .string()
    .max(70, "El título SEO no debería superar los 70 caracteres")
    .optional()
    .or(z.literal("")),

  seoDescripcion: z
    .string()
    .max(160, "La meta descripción no debería superar los 160 caracteres")
    .optional()
    .or(z.literal("")),

  seoImagen: z.string().url().optional().or(z.literal("")),
});

export const ProductSchema = ProductBaseSchema.refine(
  (data) => !data.precioDescuento || data.precioDescuento < data.precioBase,
  {
    message: "El precio con descuento debe ser menor al precio base",
    path: ["precioDescuento"],
  },
);

export type ProductInput = z.infer<typeof ProductSchema>;

export const ProductUpdateSchema = ProductBaseSchema.extend({
  id: z.string().min(1, "Falta el id del producto."),
}).refine(
  (data) => !data.precioDescuento || data.precioDescuento < data.precioBase,
  {
    message: "El precio con descuento debe ser menor al precio base",
    path: ["precioDescuento"],
  },
);

export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
