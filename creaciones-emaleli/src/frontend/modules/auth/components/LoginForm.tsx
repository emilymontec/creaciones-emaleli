"use client";

import { useActionState } from "react";
import {
  loginAction,
  type LoginFormState,
} from "@/src/backend/modules/auth/actions/login";
import { Input } from "@/src/frontend/components/ui/Input";
import { Button } from "@/src/frontend/components/ui/Button";

const initialState: LoginFormState = { success: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <p className="rounded-input bg-error-light p-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <Input
        id="usuario"
        name="usuario"
        type="text"
        label="Usuario o correo"
        autoComplete="username"
        placeholder="admin"
        error={state.errors?.usuario?.[0]}
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="current-password"
        placeholder="••••••••"
        error={state.errors?.password?.[0]}
      />

      <Button type="submit" loading={pending} fullWidth>
        Ingresar
      </Button>
    </form>
  );
}
