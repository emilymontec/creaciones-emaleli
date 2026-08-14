"use server";

import { redirect } from "next/navigation";
import { LoginSchema } from "../schemas/login.schema";
import { authenticate } from "../services/auth.service";
import { createSession } from "../lib/session";

export type LoginFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

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
