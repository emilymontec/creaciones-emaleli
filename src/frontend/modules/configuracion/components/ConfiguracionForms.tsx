"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  Save,
  Store,
  MessageCircle,
  ImagePlus,
  X,
  HelpCircle,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardHeader } from "@/src/frontend/components/ui/Card";
import { Input } from "@/src/frontend/components/ui/Input";
import { Textarea } from "@/src/frontend/components/ui/Textarea";
import { Checkbox } from "@/src/frontend/components/ui/Checkbox";
import { Button } from "@/src/frontend/components/ui/Button";
import {
  guardarEmpresaAction,
  guardarContactoAction,
  guardarFaqAction,
  guardarBannerAction,
  type ConfiguracionFormState,
} from "@/src/backend/modules/configuracion/actions/manageConfiguracion";
import type {
  EmpresaConfigInput,
  ContactoConfigInput,
  FaqConfigInput,
  BannerConfigInput,
} from "@/src/backend/modules/configuracion/schemas/configuracion.schema";
import { useToast } from "@/src/frontend/providers/ToastProvider";

const initialState: ConfiguracionFormState = { success: false };

export function ConfiguracionForms({
  empresa,
  contacto,
  faq,
  banner,
}: {
  empresa: EmpresaConfigInput;
  contacto: ContactoConfigInput;
  faq: FaqConfigInput;
  banner: BannerConfigInput;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EmpresaForm empresa={empresa} />
        <ContactoForm contacto={contacto} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BannerForm banner={banner} />
        <FaqForm faq={faq} />
      </div>
    </div>
  );
}

function useToastOnState(state: ConfiguracionFormState) {
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
}

function EmpresaForm({ empresa }: { empresa: EmpresaConfigInput }) {
  const [state, formAction, pending] = useActionState(
    guardarEmpresaAction,
    initialState,
  );
  useToastOnState(state);

  const [preview, setPreview] = useState<string | null>(
    empresa.logoUrl || null,
  );
  const [eliminarLogo, setEliminarLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setEliminarLogo(false);
    }
  }

  function quitarLogo() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreview(null);
    setEliminarLogo(true);
  }

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
        description="Logo, nombre, correo, dirección y horario del negocio."
      />
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="eliminarLogo" value={String(eliminarLogo)} />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">
            Logo
          </span>
          <div className="flex items-center gap-4">
            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-card border border-dashed border-gray-200 bg-gray-50">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Vista previa del logo"
                  className="size-full object-contain"
                />
              ) : (
                <ImagePlus className="size-5 text-gray-300" aria-hidden />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-button border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <ImagePlus className="size-3.5" />
                {preview ? "Cambiar logo" : "Subir logo"}
                <input
                  ref={fileInputRef}
                  type="file"
                  name="logoArchivo"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {preview && (
                <button
                  type="button"
                  onClick={quitarLogo}
                  className="inline-flex w-fit items-center gap-1 text-xs text-gray-400 hover:text-error"
                >
                  <X className="size-3" /> Quitar
                </button>
              )}
              <p className="text-xs text-gray-400">
                Se muestra en el pie de página de la tienda. JPG, PNG o WebP.
              </p>
            </div>
          </div>
        </div>

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
  useToastOnState(state);

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
        description="Números de contacto, redes y mensajes predeterminados por contexto."
      />
      <form action={formAction} className="space-y-4">
        <Input
          label="Número de WhatsApp (57...)"
          name="whatsapp"
          defaultValue={contacto.whatsapp}
          helperText="Formato internacional sin espacio ni signo +"
          error={state.errors?.whatsapp?.[0]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          <Input
            label="TikTok URL"
            name="tiktok"
            defaultValue={contacto.tiktok}
            error={state.errors?.tiktok?.[0]}
          />
        </div>

        <Textarea
          label="Mensaje predeterminado — consulta general"
          name="mensajeConsultaGeneral"
          defaultValue={contacto.mensajeConsultaGeneral}
          rows={2}
          helperText="Se usa en el botón de asesoría del encabezado de la tienda."
          error={state.errors?.mensajeConsultaGeneral?.[0]}
        />
        <Textarea
          label="Mensaje predeterminado — seguimiento de pedido"
          name="mensajeSeguimiento"
          defaultValue={contacto.mensajeSeguimiento}
          rows={2}
          helperText="Se usa cuando el cliente escribe desde la página de seguimiento."
          error={state.errors?.mensajeSeguimiento?.[0]}
        />
        <Textarea
          label="Mensaje predeterminado — confirmación de checkout"
          name="mensajeCheckout"
          defaultValue={contacto.mensajeCheckout}
          rows={2}
          helperText="Reemplaza el mensaje de cierre que ve el negocio al confirmar un pedido (si lo dejas vacío, se usa uno por defecto)."
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

function BannerForm({ banner }: { banner: BannerConfigInput }) {
  const [state, formAction, pending] = useActionState(
    guardarBannerAction,
    initialState,
  );
  useToastOnState(state);

  const [preview, setPreview] = useState<string | null>(
    banner.imagenUrl || null,
  );
  const [eliminarImagen, setEliminarImagen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setEliminarImagen(false);
    }
  }

  function quitarImagen() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreview(null);
    setEliminarImagen(true);
  }

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-coral-100 to-amber-100 text-coral-600 ring-1 ring-coral-100">
              <ImageIcon className="size-5" />
            </div>
            <span>Banner destacado del inicio</span>
          </div>
        }
        description="Reemplaza opcionalmente el mensaje principal de la portada. Si está desactivado, se muestra el banner por defecto."
      />
      <form action={formAction} className="space-y-4">
        <input
          type="hidden"
          name="eliminarImagen"
          value={String(eliminarImagen)}
        />

        <Checkbox
          name="activo"
          label="Mostrar este banner en el inicio"
          description="Si lo desactivas, la tienda vuelve al banner por defecto sin perder lo que escribas aquí."
          defaultChecked={banner.activo}
        />

        <Input
          label="Título"
          name="titulo"
          defaultValue={banner.titulo}
          placeholder="Ej: 20% OFF en camisetas esta semana"
          error={state.errors?.titulo?.[0]}
        />
        <Textarea
          label="Subtítulo"
          name="subtitulo"
          defaultValue={banner.subtitulo}
          rows={2}
          error={state.errors?.subtitulo?.[0]}
        />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">
            Imagen de fondo (opcional)
          </span>
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-card border border-dashed border-gray-200 bg-gray-50">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Vista previa del banner"
                  className="size-full object-cover"
                />
              ) : (
                <ImagePlus className="size-5 text-gray-300" aria-hidden />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-button border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <ImagePlus className="size-3.5" />
                {preview ? "Cambiar imagen" : "Subir imagen"}
                <input
                  ref={fileInputRef}
                  type="file"
                  name="imagenArchivo"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {preview && (
                <button
                  type="button"
                  onClick={quitarImagen}
                  className="inline-flex w-fit items-center gap-1 text-xs text-gray-400 hover:text-error"
                >
                  <X className="size-3" /> Quitar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Texto del botón"
            name="textoBoton"
            defaultValue={banner.textoBoton}
            placeholder="Ver catálogo"
            error={state.errors?.textoBoton?.[0]}
          />
          <Input
            label="Enlace del botón"
            name="linkBoton"
            defaultValue={banner.linkBoton}
            placeholder="/catalogo"
            error={state.errors?.linkBoton?.[0]}
          />
        </div>

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

function FaqForm({ faq }: { faq: FaqConfigInput }) {
  const [state, formAction, pending] = useActionState(
    guardarFaqAction,
    initialState,
  );
  useToastOnState(state);

  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");

  useEffect(() => {
    if (state.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia el formulario tras una Server Action exitosa
      setPregunta("");
      setRespuesta("");
    }
  }, [state.success]);

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-primary-100 text-sky-600 ring-1 ring-sky-100">
              <HelpCircle className="size-5" />
            </div>
            <span>Preguntas frecuentes</span>
          </div>
        }
        description="Se muestran en la página de inicio de la tienda pública."
      />

      <div className="space-y-2">
        {faq.items.length === 0 && (
          <p className="text-sm text-gray-500">
            Todavía no hay preguntas frecuentes configuradas.
          </p>
        )}
        {faq.items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-input border border-gray-100 bg-gray-50/60 p-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {item.pregunta}
              </p>
              <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">
                {item.respuesta}
              </p>
            </div>
            <form action={formAction}>
              <input type="hidden" name="accion" value="eliminar" />
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                aria-label={`Eliminar pregunta: ${item.pregunta}`}
                className="shrink-0 rounded-button p-1.5 text-gray-400 hover:bg-red-50 hover:text-error"
              >
                <Trash2 className="size-3.5" />
              </button>
            </form>
          </div>
        ))}
      </div>

      <form
        action={formAction}
        className="space-y-3 pt-4 border-t border-gray-100 mt-4"
      >
        <input type="hidden" name="accion" value="agregar" />
        <Input
          label="Nueva pregunta"
          name="pregunta"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="¿Hacen envíos a todo el país?"
          error={state.errors?.items?.[0]}
        />
        <Textarea
          label="Respuesta"
          name="respuesta"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          rows={2}
          placeholder="Sí, despachamos con transportadora a todas las ciudades de Colombia."
        />
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="secondary"
            disabled={pending || !pregunta.trim() || !respuesta.trim()}
          >
            <Save className="size-4" />{" "}
            {pending ? "Guardando..." : "Agregar pregunta"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
