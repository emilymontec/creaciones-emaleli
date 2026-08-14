"use server";

import { redirect } from "next/navigation";
import { getSessionUser, createSession } from "../lib/session";
import { PerfilUpdateSchema } from "../schemas/perfil.schema";
import {
  actualizarPerfilUsuario,
  obtenerPerfilCompleto,
} from "../services/auth.service";
import { AppError, toErrorMessage } from "@/src/shared/lib/errors";

export type PerfilFormState = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[] | undefined>;
  data?: Awaited<ReturnType<typeof obtenerPerfilCompleto>>;
};

export async function getPerfilAction(): Promise<PerfilFormState> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }
  try {
    const data = await obtenerPerfilCompleto(user.sub);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function actualizarPerfilAction(
  prevState: PerfilFormState,
  formData: FormData,
): Promise<PerfilFormState> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  const result = PerfilUpdateSchema.safeParse({
    username: formData.get("username"),
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    telefono: formData.get("telefono") || null,
    empresa: formData.get("empresa") || null,
    cargo: formData.get("cargo") || null,
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const actualizado = await actualizarPerfilUsuario(user.sub, result.data);
    await createSession({
      sub: actualizado.id,
      nombre: actualizado.nombre,
      email: actualizado.email,
      rol: actualizado.rol,
    });
    return {
      success: true,
      message: "Perfil actualizado correctamente.",
      data: actualizado as Awaited<ReturnType<typeof obtenerPerfilCompleto>>,
    };
  } catch (e) {
    if (e instanceof AppError) {
      return { success: false, error: e.message };
    }
    return { success: false, error: toErrorMessage(e) };
  }
}
