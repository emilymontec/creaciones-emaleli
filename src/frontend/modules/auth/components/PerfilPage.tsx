"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import {
  getPerfilAction,
  actualizarPerfilAction,
  type PerfilFormState,
} from "@/src/backend/modules/auth/actions/updatePerfil";
import {
  cambiarPasswordAction,
  type PasswordFormState,
} from "@/src/backend/modules/auth/actions/cambiarPassword";
import { Card, CardHeader } from "@/src/frontend/components/ui/Card";
import { Input } from "@/src/frontend/components/ui/Input";
import { Button } from "@/src/frontend/components/ui/Button";
import { Loader } from "@/src/frontend/components/ui/Loader";
import { useToast } from "@/src/frontend/providers/ToastProvider";
import { KeyRound, User as UserIcon } from "lucide-react";

const initialPerfil: PerfilFormState = { success: false };
const initialPassword: PasswordFormState = { success: false };

export function PerfilPage() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [perfilState, setPerfilState] =
    useState<PerfilFormState>(initialPerfil);
  const { toast } = useToast();
  const [updateState, updateAction, updatePending] = useActionState(
    actualizarPerfilAction,
    initialPerfil,
  );
  const [passState, passAction, passPending] = useActionState(
    cambiarPasswordAction,
    initialPassword,
  );

  useEffect(() => {
    let cancelled = false;
    getPerfilAction().then((res) => {
      if (!cancelled) {
        setPerfilState(res);
        setDataLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (updateState.success && updateState.message) {
      toast({ title: "Perfil actualizado", variant: "success" });
      // Actualiza el estado local con los datos devueltos por la Server Action.
      if (updateState.data) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPerfilState({ success: true, data: updateState.data });
      }
    } else if (updateState.error) {
      toast({
        title: "No se pudo guardar el perfil",
        description: updateState.error,
        variant: "error",
      });
    }
  }, [updateState, toast]);

  useEffect(() => {
    if (passState.success && passState.message) {
      toast({ title: passState.message, variant: "success" });
    } else if (passState.error) {
      toast({
        title: "No se pudo cambiar la contraseña",
        description: passState.error,
        variant: "error",
      });
    }
  }, [passState, toast]);

  const d = perfilState.data;

  if (!dataLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!d) {
    return (
      <Card>
        <p className="text-sm text-error">
          {perfilState.error ?? "No se pudo cargar el perfil."}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader
          title={
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 text-primary-700 ring-1 ring-primary-100">
                <UserIcon className="size-5" />
              </div>
              <span>Información del perfil</span>
            </div>
          }
          description="Actualiza tus datos de acceso y contacto."
        />
        <form action={updateAction} className="space-y-4">
          {updateState.error && (
            <p className="rounded-input bg-red-50 p-3 text-sm text-red-700">
              {updateState.error}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="username"
              label="Usuario"
              defaultValue={d.username}
              autoComplete="username"
              helperText="Se usa para iniciar sesión."
              error={updateState.errors?.username?.[0]}
            />
            <Input
              name="nombre"
              label="Nombre completo"
              defaultValue={d.nombre}
              autoComplete="name"
              error={updateState.errors?.nombre?.[0]}
            />
            <Input
              name="email"
              label="Correo electrónico"
              type="email"
              defaultValue={d.email}
              autoComplete="email"
              error={updateState.errors?.email?.[0]}
            />
            <Input
              name="telefono"
              label="Teléfono / WhatsApp"
              defaultValue={d.telefono ?? ""}
              autoComplete="tel"
              error={updateState.errors?.telefono?.[0]}
            />
            <Input
              name="empresa"
              label="Empresa"
              defaultValue={d.empresa ?? ""}
              error={updateState.errors?.empresa?.[0]}
            />
            <Input
              name="cargo"
              label="Cargo"
              defaultValue={d.cargo ?? ""}
              error={updateState.errors?.cargo?.[0]}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-500">
              Rol: <span className="font-semibold text-gray-700">{d.rol}</span>
            </p>
            <Button type="submit" loading={updatePending}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-primary-100 text-violet-600 ring-1 ring-violet-100">
                <KeyRound className="size-5" />
              </div>
              <span>Cambiar contraseña</span>
            </div>
          }
          description="Para proteger tu cuenta, solicita la contraseña actual."
        />
        <form action={passAction} className="space-y-4">
          {passState.error && (
            <p className="rounded-input bg-red-50 p-3 text-sm text-red-700">
              {passState.error}
            </p>
          )}
          <Input
            name="passwordActual"
            label="Contraseña actual"
            type="password"
            autoComplete="current-password"
            error={passState.errors?.passwordActual?.[0]}
          />
          <Input
            name="passwordNueva"
            label="Contraseña nueva"
            type="password"
            autoComplete="new-password"
            helperText="Mínimo 6 caracteres."
            error={passState.errors?.passwordNueva?.[0]}
          />
          <Input
            name="passwordConfirmar"
            label="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            error={passState.errors?.passwordConfirmar?.[0]}
          />
          <Button type="submit" loading={passPending} fullWidth>
            Actualizar contraseña
          </Button>
        </form>
      </Card>
    </div>
  );
}
