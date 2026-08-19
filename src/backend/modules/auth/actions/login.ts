"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { LoginSchema } from "../schemas/login.schema";
import { authenticate } from "../services/auth.service";
import { createSession } from "../lib/session";
import { checkRateLimit } from "@/src/backend/shared/rate-limit";

export type LoginFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

const LOGIN_MAX_INTENTOS = 5;
const LOGIN_VENTANA_MS = 5 * 60 * 1000; // 5 minutos

async function obtenerIpCliente(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "desconocida"
  );
}

export async function loginAction(
  prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const result = LoginSchema.safeParse({
    usuario: formData.get("usuario"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const ip = await obtenerIpCliente();
  // Se limita por IP + usuario para no bloquear a todos los usuarios si un
  // solo IP (p. ej. una red compartida) intenta contra una cuenta distinta.
  const rateLimitKey = `login:${ip}:${result.data.usuario.toLowerCase()}`;
  const rate = checkRateLimit(
    rateLimitKey,
    LOGIN_MAX_INTENTOS,
    LOGIN_VENTANA_MS,
  );

  if (!rate.allowed) {
    return {
      success: false,
      message: `Demasiados intentos. Inténtalo de nuevo en ${Math.ceil(
        rate.retryAfterSeconds / 60,
      )} minuto(s).`,
    };
  }

  const user = await authenticate(result.data.usuario, result.data.password);

  if (!user) {
    return {
      success: false,
      message: "Usuario o contraseña incorrectos.",
    };
  }

  await createSession(user);

  redirect("/admin");
}
