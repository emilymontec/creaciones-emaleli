"use server";

import { revalidatePath } from "next/cache";
import {
  EmpresaConfigSchema,
  ContactoConfigSchema,
} from "../schemas/configuracion.schema";
import {
  guardarConfigEmpresa,
  guardarConfigContacto,
} from "../services/configuracion.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import { getSessionUser } from "@/src/backend/modules/auth/lib/session";

export type ConfiguracionFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

const initialState: ConfiguracionFormState = { success: false };

export async function guardarEmpresaAction(
  _prevState: ConfiguracionFormState,
  formData: FormData,
): Promise<ConfiguracionFormState> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: "Sesión inválida. Vuelve a iniciar sesión." };
  }

  const result = EmpresaConfigSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email") || "",
    direccion: formData.get("direccion") || "",
    horario: formData.get("horario") || "",
  });

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await guardarConfigEmpresa(result.data);
    revalidatePath("/admin/configuracion");
    return { success: true, message: "Datos de la empresa actualizados." };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function guardarContactoAction(
  _prevState: ConfiguracionFormState,
  formData: FormData,
): Promise<ConfiguracionFormState> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: "Sesión inválida. Vuelve a iniciar sesión." };
  }

  const result = ContactoConfigSchema.safeParse({
    whatsapp: formData.get("whatsapp") || "",
    instagram: formData.get("instagram") || "",
    facebook: formData.get("facebook") || "",
    mensajeCheckout: formData.get("mensajeCheckout") || "",
  });

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await guardarConfigContacto(result.data);
    revalidatePath("/admin/configuracion");
    return { success: true, message: "WhatsApp y redes sociales actualizados." };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export { initialState as configuracionInitialState };
