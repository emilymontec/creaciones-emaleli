"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "../lib/session";
import { PasswordChangeSchema } from "../schemas/perfil.schema";
import { cambiarPasswordUsuario } from "../services/auth.service";
import { AppError, toErrorMessage } from "@/src/shared/lib/errors";
import { registrarAuditoria } from "@/src/backend/shared/audit-log";

export type PasswordFormState = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[] | undefined>;
};

const initial: PasswordFormState = { success: false };

export async function cambiarPasswordAction(
  prevState: PasswordFormState = initial,
  formData: FormData,
): Promise<PasswordFormState> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  const result = PasswordChangeSchema.safeParse({
    passwordActual: formData.get("passwordActual"),
    passwordNueva: formData.get("passwordNueva"),
    passwordConfirmar: formData.get("passwordConfirmar"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await cambiarPasswordUsuario(user.sub, result.data);
    await registrarAuditoria({
      usuarioId: user.sub,
      usuarioNombre: user.nombre,
      accion: "CONTRASENA_CAMBIADA",
      entidad: "Usuario",
      entidadId: user.sub,
    });
    return {
      success: true,
      message: "Contraseña actualizada correctamente.",
    };
  } catch (e) {
    if (e instanceof AppError) {
      return { success: false, error: e.message };
    }
    return { success: false, error: toErrorMessage(e) };
  }
}
