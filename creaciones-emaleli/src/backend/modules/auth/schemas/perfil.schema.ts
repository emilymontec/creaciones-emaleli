import { z } from "zod";

export const PerfilUpdateSchema = z.object({
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres.")
    .max(50, "Máximo 50 caracteres.")
    .regex(/^[a-zA-Z0-9_.]+$/, "Solo letras, números, punto y guion bajo.")
    .trim(),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "Máximo 120 caracteres.")
    .trim(),
  email: z.string().email("Ingresa un correo válido.").trim(),
  telefono: z
    .string()
    .max(30, "Máximo 30 caracteres.")
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  empresa: z
    .string()
    .max(120, "Máximo 120 caracteres.")
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  cargo: z
    .string()
    .max(80, "Máximo 80 caracteres.")
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
});

export type PerfilUpdateInput = z.infer<typeof PerfilUpdateSchema>;

export const PasswordChangeSchema = z
  .object({
    passwordActual: z.string().min(1, "Ingresa tu contraseña actual."),
    passwordNueva: z
      .string()
      .min(6, "La contraseña nueva debe tener al menos 6 caracteres."),
    passwordConfirmar: z.string().min(1, "Confirma la contraseña nueva."),
  })
  .refine((data) => data.passwordNueva === data.passwordConfirmar, {
    message: "Las contraseñas nuevas no coinciden.",
    path: ["passwordConfirmar"],
  });

export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;
