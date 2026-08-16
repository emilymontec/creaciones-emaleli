"use client";

import { useActionState, useEffect } from "react";
import { Save, Store, MessageCircle } from "lucide-react";
import { Card, CardHeader } from "@/src/frontend/components/ui/Card";
import { Input } from "@/src/frontend/components/ui/Input";
import { Textarea } from "@/src/frontend/components/ui/Textarea";
import { Button } from "@/src/frontend/components/ui/Button";
import {
  guardarEmpresaAction,
  guardarContactoAction,
  type ConfiguracionFormState,
} from "@/src/backend/modules/configuracion/actions/manageConfiguracion";
import type {
  EmpresaConfigInput,
  ContactoConfigInput,
} from "@/src/backend/modules/configuracion/schemas/configuracion.schema";
import { useToast } from "@/src/frontend/providers/ToastProvider";

const initialState: ConfiguracionFormState = { success: false };

export function ConfiguracionForms({
  empresa,
  contacto,
}: {
  empresa: EmpresaConfigInput;
  contacto: ContactoConfigInput;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <EmpresaForm empresa={empresa} />
      <ContactoForm contacto={contacto} />
    </div>
  );
}

function EmpresaForm({ empresa }: { empresa: EmpresaConfigInput }) {
  const [state, formAction, pending] = useActionState(
    guardarEmpresaAction,
    initialState,
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: state.message ?? "Configuración aplicada",
        variant: "success",
      });
    } else if (state.message) {
      toast({
        title: "No se pudo guardar",
        description: state.message,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 text-primary-700 ring-1 ring-primary-100">
              <Store className="size-5" />
            </div>
            <span>Datos de la Empresa</span>
          </div>
        }
        description="Nombre, correo, dirección y horario del negocio."
      />
      <form action={formAction} className="space-y-4">
        <Input
          label="Nombre comercial"
          name="nombre"
          defaultValue={empresa.nombre}
          error={state.errors?.nombre?.[0]}
          required
        />
        <Input
          label="Correo electrónico principal"
          name="email"
          type="email"
          defaultValue={empresa.email}
          error={state.errors?.email?.[0]}
        />
        <Input
          label="Dirección de la tienda / taller"
          name="direccion"
          defaultValue={empresa.direccion}
          error={state.errors?.direccion?.[0]}
        />
        <Input
          label="Horario de atención"
          name="horario"
          defaultValue={empresa.horario}
          error={state.errors?.horario?.[0]}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={pending}>
            <Save className="size-4" />{" "}
            {pending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ContactoForm({ contacto }: { contacto: ContactoConfigInput }) {
  const [state, formAction, pending] = useActionState(
    guardarContactoAction,
    initialState,
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: state.message ?? "Configuración aplicada",
        variant: "success",
      });
    } else if (state.message) {
      toast({
        title: "No se pudo guardar",
        description: state.message,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-secondary-100 text-emerald-600 ring-1 ring-emerald-100">
              <MessageCircle className="size-5" />
            </div>
            <span>WhatsApp y Redes Sociales</span>
          </div>
        }
        description="Números de contacto y enlaces de redes del negocio."
      />
      <form action={formAction} className="space-y-4">
        <Input
          label="Número de WhatsApp (57...)"
          name="whatsapp"
          defaultValue={contacto.whatsapp}
          helperText="Formato internacional sin espacio ni signo +"
          error={state.errors?.whatsapp?.[0]}
        />
        <Input
          label="Instagram URL"
          name="instagram"
          defaultValue={contacto.instagram}
          error={state.errors?.instagram?.[0]}
        />
        <Input
          label="Facebook URL"
          name="facebook"
          defaultValue={contacto.facebook}
          error={state.errors?.facebook?.[0]}
        />
        <Textarea
          label="Mensaje predeterminado de checkout"
          name="mensajeCheckout"
          defaultValue={contacto.mensajeCheckout}
          rows={3}
          error={state.errors?.mensajeCheckout?.[0]}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={pending}>
            <Save className="size-4" />{" "}
            {pending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
