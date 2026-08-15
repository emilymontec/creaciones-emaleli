import { z } from "zod";

export const EmpresaConfigSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio.").max(150),
  email: z.string().email("Correo electrónico inválido.").optional().or(z.literal("")),
  direccion: z.string().max(300).optional().or(z.literal("")),
  horario: z.string().max(300).optional().or(z.literal("")),
});

export type EmpresaConfigInput = z.infer<typeof EmpresaConfigSchema>;

export const ContactoConfigSchema = z.object({
  whatsapp: z
    .string()
    .regex(/^\d{10,15}$/, "Usa formato internacional sin + ni espacios (ej. 573001234567).")
    .optional()
    .or(z.literal("")),
  instagram: z.string().url("URL de Instagram inválida.").optional().or(z.literal("")),
  facebook: z.string().url("URL de Facebook inválida.").optional().or(z.literal("")),
  mensajeCheckout: z.string().max(500).optional().or(z.literal("")),
});

export type ContactoConfigInput = z.infer<typeof ContactoConfigSchema>;

export const CONFIG_KEYS = {
  EMPRESA: "empresa",
  CONTACTO: "contacto",
} as const;
