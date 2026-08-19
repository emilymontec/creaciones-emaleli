import { z } from "zod";
import { safeHttpUrlOptional, safeLinkPath } from "@/src/shared/lib/safe-url";

export const EmpresaConfigSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio.").max(150),
  email: z
    .string()
    .email("Correo electrónico inválido.")
    .optional()
    .or(z.literal("")),
  direccion: z.string().max(300).optional().or(z.literal("")),
  horario: z.string().max(300).optional().or(z.literal("")),
  logoUrl: safeHttpUrlOptional,
});

export type EmpresaConfigInput = z.infer<typeof EmpresaConfigSchema>;

export const ContactoConfigSchema = z.object({
  whatsapp: z
    .string()
    .regex(
      /^\d{10,15}$/,
      "Usa formato internacional sin + ni espacios (ej. 573001234567).",
    )
    .optional()
    .or(z.literal("")),
  instagram: safeHttpUrlOptional,
  facebook: safeHttpUrlOptional,
  tiktok: safeHttpUrlOptional,
  mensajeConsultaGeneral: z.string().max(500).optional().or(z.literal("")),
  mensajeSeguimiento: z.string().max(500).optional().or(z.literal("")),
  mensajeCheckout: z.string().max(500).optional().or(z.literal("")),
});

export type ContactoConfigInput = z.infer<typeof ContactoConfigSchema>;

export const FaqItemSchema = z.object({
  id: z.string(),
  pregunta: z.string().min(3, "La pregunta es obligatoria.").max(200),
  respuesta: z.string().min(3, "La respuesta es obligatoria.").max(1000),
});

export const FaqConfigSchema = z.object({
  items: z.array(FaqItemSchema).max(30),
});

export type FaqConfigInput = z.infer<typeof FaqConfigSchema>;
export type FaqItem = z.infer<typeof FaqItemSchema>;

export const BannerConfigSchema = z.object({
  activo: z.boolean().default(false),
  titulo: z.string().max(150).optional().or(z.literal("")),
  subtitulo: z.string().max(300).optional().or(z.literal("")),
  imagenUrl: safeHttpUrlOptional,
  textoBoton: z.string().max(60).optional().or(z.literal("")),
  linkBoton: safeLinkPath,
});

export type BannerConfigInput = z.infer<typeof BannerConfigSchema>;

export const CONFIG_KEYS = {
  EMPRESA: "empresa",
  CONTACTO: "contacto",
  FAQ: "faq",
  BANNER: "banner",
} as const;
