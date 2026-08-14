import { z } from "zod";

export const TIPOS_VARIANTE_SUGERIDOS = ["TALLA", "COLOR", "MATERIAL"] as const;

export const VariantOpcionSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(60),
  tipo: z
    .string()
    .min(2, "El tipo es obligatorio (ej. TALLA, COLOR, MATERIAL)")
    .max(30)
    .transform((v) => v.toUpperCase().trim()),
  precioExtra: z.coerce.number().default(0),
});

export type VariantOpcionInput = z.infer<typeof VariantOpcionSchema>;

export const CombinacionUpdateSchema = z.object({
  sku: z.string().max(60).optional().or(z.literal("")),
  precio: z.coerce.number().positive().optional().or(z.literal("")),
  stock: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  activo: z.boolean().default(true),
});

export type CombinacionUpdateInput = z.infer<typeof CombinacionUpdateSchema>;
