import { z } from "zod";

export const LoginSchema = z.object({
  usuario: z.string().min(1, "Ingresa tu usuario o correo.").trim(),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export type LoginInput = z.infer<typeof LoginSchema>;
