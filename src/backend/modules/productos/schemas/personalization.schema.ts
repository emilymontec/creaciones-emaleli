import { z } from "zod";

export const TIPOS_PERSONALIZACION = [
  "TEXTO",
  "TEXTAREA",
  "NUMERO",
  "COLOR",
  "ARCHIVO",
  "LISTA",
  "CHECKBOX",
] as const;

/** Configuración flexible por tipo de campo (se guarda en la columna JSON `opciones`). */
export const PersonalizationConfigSchema = z.object({
  // TEXTO / TEXTAREA
  maxLength: z.coerce.number().int().positive().optional(),
  // NUMERO
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  // ARCHIVO
  maxSizeMB: z.coerce.number().positive().optional(),
  allowedTypes: z.array(z.string()).optional(),
  // LISTA (cada opción puede tener su propio precio adicional)
  opciones: z
    .array(
      z.object({
        label: z.string().min(1),
        precioExtra: z.coerce.number().default(0),
      }),
    )
    .optional(),
});

export type PersonalizationConfig = z.infer<typeof PersonalizationConfigSchema>;

export const PersonalizationSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(80),
  tipo: z.enum(TIPOS_PERSONALIZACION),
  obligatorio: z.boolean().default(false),
  precioExtra: z.coerce.number().optional().or(z.literal("")),
  config: PersonalizationConfigSchema.optional(),
});

export type PersonalizationInput = z.infer<typeof PersonalizationSchema>;
