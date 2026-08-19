"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFormState } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileUp,
  MapPin,
  MessageCircle,
  Package,
  ShoppingBag,
  Store,
  Truck,
  User,
  X,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/src/frontend/components/ui/Button";
import { Card, CardHeader } from "@/src/frontend/components/ui/Card";
import { Input } from "@/src/frontend/components/ui/Input";
import { Textarea } from "@/src/frontend/components/ui/Textarea";
import { Checkbox } from "@/src/frontend/components/ui/Checkbox";
import { EmptyState } from "@/src/frontend/components/ui/EmptyState";
import { formatCOP } from "@/src/shared/lib/pricing";
import { useCart } from "@/src/frontend/cart/CartContext";
import type { CartItem } from "@/src/frontend/cart/types";
import {
  createCheckoutAction,
  type CheckoutActionState,
} from "@/src/backend/modules/pedidos/actions/createCheckout";
import {
  isColombianPhone,
  calcularCostoEnvio,
  buildWhatsappLink,
  type MetodoEnvioValue,
} from "@/src/shared/lib/checkout";

const ClienteSchemaCliente = z.object({
  nombreCompleto: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(150, "El nombre no puede superar los 150 caracteres")
    .regex(/^[^\d]+$/, "El nombre no puede contener números"),

  whatsapp: z
    .string()
    .min(1, "El número de WhatsApp es obligatorio")
    .refine(isColombianPhone, "Formato inválido. Ej: 300 123 4567"),

  ciudad: z
    .string()
    .min(2, "La ciudad es obligatoria")
    .max(100, "La ciudad no puede superar los 100 caracteres"),

  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Correo electrónico inválido")
    .max(254),

  empresa: z
    .string()
    .max(150, "El nombre de empresa no puede superar los 150 caracteres")
    .optional()
    .or(z.literal("")),
});

type StepId = 1 | 2 | 3 | 4;

const STEPS: { id: StepId; label: string; icon: typeof User }[] = [
  { id: 1, label: "Tus datos", icon: User },
  { id: 2, label: "Pedido", icon: Package },
  { id: 3, label: "Envío", icon: Truck },
  { id: 4, label: "Confirmar", icon: CheckCircle2 },
];

const METODOS_ENVIO_OPTIONS = [
  { value: "RECOGER", label: "Recoger en tienda" },
  { value: "DOMICILIO", label: "Entrega a domicilio" },
  { value: "TRANSPORTADORA", label: "Envío por transportadora" },
];

type EnvioMetodo = MetodoEnvioValue;

interface FormCliente {
  nombreCompleto: string;
  whatsapp: string;
  ciudad: string;
  email: string;
  empresa?: string;
}

interface FormEnvio {
  metodo: EnvioMetodo;
  direccion: string;
  destinatario: string;
  telefono: string;
  documento: string;
}

const EMPRESA_WHATSAPP =
  process.env.NEXT_PUBLIC_EMPRESA_WHATSAPP ?? "573001234567";

export default function CheckoutPage() {
  const { items, isReady, subtotal, tiempoProduccionMax, clear } = useCart();

  const [step, setStep] = useState<StepId>(1);
  const [envioMetodo, setEnvioMetodo] = useState<EnvioMetodo>("RECOGER");
  const [cliente, setCliente] = useState<FormCliente>({
    nombreCompleto: "",
    whatsapp: "",
    ciudad: "",
    email: "",
    empresa: "",
  });
  const [observaciones, setObservaciones] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [confirmacionesPers, setConfirmacionesPers] = useState<
    Record<string, boolean>
  >({});
  const [envio, setEnvio] = useState<FormEnvio>({
    metodo: "RECOGER",
    direccion: "",
    destinatario: "",
    telefono: "",
    documento: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [actionState, formAction, isPending] = useFormState<
    CheckoutActionState,
    FormData
  >(createCheckoutAction as never, { success: false });

  const costoEnvio = useMemo(
    () => calcularCostoEnvio(envioMetodo, cliente.ciudad || ""),
    [envioMetodo, cliente.ciudad],
  );

  const total = useMemo(() => subtotal + costoEnvio, [subtotal, costoEnvio]);

  useEffect(() => {
    if (actionState.success && actionState.pedidoCodigo) {
      clear();
    }
  }, [actionState.success, actionState.pedidoCodigo, clear]);

  if (!isReady) return null;

  if (items.length === 0 && !actionState.success) {
    return (
      <div className="mx-auto w-full max-w-page px-4 py-16 sm:px-6">
        <EmptyState
          icon={<ShoppingBag className="size-8 text-gray-300" />}
          title="No hay productos para comprar"
          description="Agrega productos al carrito antes de iniciar el checkout."
          action={
            <Link href="/catalogo">
              <Button>Ir al catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const clienteSchemaValido = ClienteSchemaCliente.safeParse(cliente).success;
  const todasPersConfirmadas = items.every((i) => {
    if (i.personalizaciones.length === 0 && i.opciones.length === 0)
      return true;
    return confirmacionesPers[i.id] === true;
  });
  const envioValido =
    envioMetodo === "RECOGER"
      ? true
      : envio.direccion.trim().length >= 5 &&
        envio.destinatario.trim().length >= 3 &&
        isColombianPhone(envio.telefono) &&
        (envioMetodo !== "TRANSPORTADORA" ||
          envio.documento.trim().length >= 5);

  function canGoNext(s: StepId): boolean {
    switch (s) {
      case 1:
        return clienteSchemaValido;
      case 2:
        return todasPersConfirmadas;
      case 3:
        return envioValido;
      default:
        return false;
    }
  }

  function addArchivo(files: FileList | null) {
    if (!files) return;
    const nuevos = Array.from(files).slice(0, 5 - archivos.length);
    setArchivos((prev) => [...prev, ...nuevos]);
  }

  function removeArchivo(idx: number) {
    setArchivos((prev) => prev.filter((_, i) => i !== idx));
  }

  function submitFormulario() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    fd.set("cliente", JSON.stringify(cliente));
    fd.set(
      "envio",
      JSON.stringify({
        metodo: envioMetodo,
        ...(envioMetodo !== "RECOGER" ? envio : {}),
      }),
    );
    fd.set("items", JSON.stringify(items));
    fd.set("observaciones", observaciones);
    fd.set("costoEnvio", String(costoEnvio));
    archivos.forEach((f) => fd.append("archivos", f));
    formAction(fd);
  }

  if (actionState.success && actionState.pedidoCodigo) {
    const waLink = buildWhatsappLink(
      actionState.whatsappNumber || EMPRESA_WHATSAPP,
      actionState.whatsappMessage ?? "",
    );

    return (
      <div className="mx-auto w-full max-w-page px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="size-9 text-green-600" />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold text-gray-900">
            ¡Pedido confirmado!
          </h1>
          <p className="mb-6 text-gray-600">
            Gracias, {actionState.clienteNombre}. Hemos recibido tu pedido.
          </p>

          <Card className="mb-6 text-left">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="font-medium text-gray-500">
                  Código del pedido
                </span>
                <span className="font-display text-lg font-bold text-primary-600">
                  {actionState.pedidoCodigo}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Total</span>
                <span className="font-semibold text-gray-900">
                  {formatCOP(total)}
                </span>
              </div>
              {tiempoProduccionMax !== null && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="size-3.5" />
                  Tiempo estimado de producción: {tiempoProduccionMax} día(s)
                </div>
              )}
            </div>
          </Card>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button
              size="lg"
              variant="secondary"
              className="!bg-green-600 hover:!bg-green-700"
            >
              <MessageCircle className="size-5" />
              Contactar por WhatsApp
            </Button>
          </a>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/catalogo">
              <Button variant="ghost">Seguir comprando</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-page px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <Link
          href="/carrito"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="size-4" />
          Volver al carrito
        </Link>
      </div>

      <h1 className="mb-6 font-display text-2xl font-bold text-gray-900">
        Finalizar compra
      </h1>

      {/* Indicador de progreso compacto para móvil — el stepper completo de
          abajo se oculta en pantallas pequeñas (`hidden sm:grid`), así que
          sin esto un usuario móvil no sabe en qué paso va ni cuántos faltan. */}
      <div className="mb-6 sm:hidden">
        <p className="mb-2 text-sm font-medium text-gray-700">
          Paso {step} de {STEPS.length}: {STEPS[step - 1].label}
        </p>
        <div
          className="flex gap-1.5"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
        >
          {STEPS.map((s) => (
            <span
              key={s.id}
              className={`h-1.5 flex-1 rounded-full ${
                s.id <= step ? "bg-primary-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <ol className="mb-8 hidden grid-cols-4 gap-3 sm:grid">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <li
              key={s.id}
              className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                isActive
                  ? "border-primary-200 bg-primary-50 text-primary-700"
                  : isDone
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-100 bg-gray-50 text-gray-500"
              }`}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-current/10 font-semibold">
                {isDone ? <CheckCircle2 className="size-4" /> : s.id}
              </span>
              <div className="flex items-center gap-1.5">
                <Icon className="size-4" />
                <span className="font-medium">{s.label}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {step === 1 && (
            <PasoCliente cliente={cliente} setCliente={setCliente} />
          )}

          {step === 2 && (
            <PasoPedido
              items={items}
              observaciones={observaciones}
              setObservaciones={setObservaciones}
              archivos={archivos}
              addArchivo={addArchivo}
              removeArchivo={removeArchivo}
              fileInputRef={fileInputRef}
              confirmacionesPers={confirmacionesPers}
              setConfirmacionesPers={setConfirmacionesPers}
            />
          )}

          {step === 3 && (
            <PasoEnvio
              envioMetodo={envioMetodo}
              setEnvioMetodo={(m) => {
                setEnvioMetodo(m);
                setEnvio((e) => ({ ...e, metodo: m }));
              }}
              envio={envio}
              setEnvio={setEnvio}
              costoEnvio={costoEnvio}
            />
          )}

          {step === 4 && (
            <PasoConfirmacion
              cliente={cliente}
              items={items}
              envioMetodo={envioMetodo}
              envio={envio}
              costoEnvio={costoEnvio}
              subtotal={subtotal}
              total={total}
              observaciones={observaciones}
              archivos={archivos}
              actionState={actionState}
              onSubmit={submitFormulario}
              formRef={formRef}
              isPending={isPending}
            />
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep((s) => (s - 1) as StepId)}
              >
                <ArrowLeft className="size-4" />
                Atrás
              </Button>
            ) : (
              <span />
            )}

            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => (s + 1) as StepId)}
                disabled={!canGoNext(step)}
              >
                Continuar
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={() => formRef.current?.requestSubmit()}
                loading={isPending}
              >
                Confirmar pedido
              </Button>
            )}
          </div>
        </div>

        <ResumenLateral
          items={items}
          subtotal={subtotal}
          costoEnvio={costoEnvio}
          total={total}
          tiempoProduccionMax={tiempoProduccionMax}
        />
      </div>
    </div>
  );
}

function PasoCliente({
  cliente,
  setCliente,
}: {
  cliente: FormCliente;
  setCliente: (c: FormCliente) => void;
}) {
  const { register, formState } = useForm<FormCliente>({
    resolver: zodResolver(ClienteSchemaCliente),
    defaultValues: cliente,
    mode: "onChange",
  });

  return (
    <Card>
      <CardHeader
        title="Datos del cliente"
        description="Información para contactarte y entregar tu pedido."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nombre completo *"
          placeholder="Ej: Ana María Gómez"
          {...register("nombreCompleto")}
          defaultValue={cliente.nombreCompleto}
          onChange={(e) =>
            setCliente({ ...cliente, nombreCompleto: e.target.value })
          }
          error={formState.errors.nombreCompleto?.message}
        />
        <Input
          label="WhatsApp *"
          placeholder="Ej: 300 123 4567"
          {...register("whatsapp")}
          defaultValue={cliente.whatsapp}
          onChange={(e) => setCliente({ ...cliente, whatsapp: e.target.value })}
          error={formState.errors.whatsapp?.message}
          helperText="Número de 10 dígitos (Colombia)."
        />
        <Input
          label="Ciudad *"
          placeholder="Ej: Medellín"
          {...register("ciudad")}
          defaultValue={cliente.ciudad}
          onChange={(e) => setCliente({ ...cliente, ciudad: e.target.value })}
          error={formState.errors.ciudad?.message}
        />
        <Input
          label="Correo electrónico *"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          {...register("email")}
          defaultValue={cliente.email}
          onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
          error={formState.errors.email?.message}
        />
        <div className="sm:col-span-2">
          <Input
            label="Empresa (opcional)"
            placeholder="Si es un pedido corporativo"
            {...register("empresa")}
            defaultValue={cliente.empresa}
            onChange={(e) =>
              setCliente({ ...cliente, empresa: e.target.value })
            }
            error={formState.errors.empresa?.message}
          />
        </div>
      </div>
    </Card>
  );
}

function PasoPedido({
  items,
  observaciones,
  setObservaciones,
  archivos,
  addArchivo,
  removeArchivo,
  fileInputRef,
  confirmacionesPers,
  setConfirmacionesPers,
}: {
  items: CartItem[];
  observaciones: string;
  setObservaciones: (v: string) => void;
  archivos: File[];
  addArchivo: (f: FileList | null) => void;
  removeArchivo: (i: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  confirmacionesPers: Record<string, boolean>;
  setConfirmacionesPers: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Confirmación de personalizaciones"
          description="Revisa y confirma cada ítem."
        />
        <div className="space-y-4">
          {items.map((item) => {
            const tienePers =
              item.personalizaciones.length > 0 || item.opciones.length > 0;
            return (
              <div
                key={item.id}
                className="rounded-lg border border-gray-100 p-4"
              >
                <div className="flex items-start gap-3">
                  {item.imagenUrl && (
                    <Image
                      src={item.imagenUrl}
                      alt={item.nombre}
                      width={64}
                      height={64}
                      className="size-16 shrink-0 rounded-md object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{item.nombre}</p>
                    <p className="text-sm text-gray-500">
                      Cantidad: {item.cantidad} ·{" "}
                      {formatCOP(item.precioUnitario)} c/u
                    </p>
                    {item.opciones.length > 0 && (
                      <ul className="mt-1.5 text-xs text-gray-600">
                        {item.opciones.map((o) => (
                          <li key={o.opcionId}>· {o.nombre}</li>
                        ))}
                      </ul>
                    )}
                    {item.personalizaciones.length > 0 && (
                      <ul className="mt-1.5 text-xs text-gray-600">
                        {item.personalizaciones.map((p) => (
                          <li key={p.personalizacionId}>
                            · {p.nombre}:{" "}
                            <span className="font-medium">{p.valor}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {tienePers && (
                      <div className="mt-3">
                        <Checkbox
                          checked={confirmacionesPers[item.id] === true}
                          onChange={(e) =>
                            setConfirmacionesPers((p) => ({
                              ...p,
                              [item.id]: e.target.checked,
                            }))
                          }
                          label="Confirmo que la personalización es correcta"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Observaciones y archivos"
          description="Instrucciones especiales o referencias visuales."
        />
        <div className="space-y-4">
          <Textarea
            label="Observaciones generales"
            placeholder="Notas, instrucciones especiales, fechas límite, etc."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={4}
            maxLength={2000}
            helperText={`${observaciones.length}/2000 caracteres`}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Archivos de referencia (logos, diseños, ejemplos)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => addArchivo(e.target.files)}
            />
            <Button
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={archivos.length >= 5}
            >
              <FileUp className="size-4" />
              Adjuntar archivos (máx. 5)
            </Button>
            {archivos.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {archivos.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
                  >
                    <span className="truncate text-gray-700">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeArchivo(i)}
                      className="text-gray-400 hover:text-error"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1.5 text-xs text-gray-500">
              PDF, JPG, PNG, WEBP · Hasta 10 MB por archivo.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PasoEnvio({
  envioMetodo,
  setEnvioMetodo,
  envio,
  setEnvio,
  costoEnvio,
}: {
  envioMetodo: EnvioMetodo;
  setEnvioMetodo: (m: EnvioMetodo) => void;
  envio: FormEnvio;
  setEnvio: (e: FormEnvio) => void;
  costoEnvio: number;
}) {
  return (
    <Card>
      <CardHeader
        title="Método de envío"
        description="Selecciona cómo quieres recibir tu pedido."
      />

      <div className="space-y-3">
        {METODOS_ENVIO_OPTIONS.map((opt) => {
          const Icon =
            opt.value === "RECOGER"
              ? Store
              : opt.value === "DOMICILIO"
                ? MapPin
                : Truck;
          const selected = envioMetodo === opt.value;
          const costo =
            opt.value === "RECOGER"
              ? 0
              : opt.value === "DOMICILIO"
                ? costoEnvio
                : 10000;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setEnvioMetodo(opt.value as EnvioMetodo)}
              className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition ${
                selected
                  ? "border-primary-300 bg-primary-50 ring-2 ring-primary-100"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-md ${
                  selected
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{opt.label}</p>
                <p className="text-sm text-gray-500">
                  {opt.value === "RECOGER" &&
                    "Retira gratis en nuestra tienda."}
                  {opt.value === "DOMICILIO" &&
                    "Entregamos en la dirección que indiques."}
                  {opt.value === "TRANSPORTADORA" &&
                    "Envío nacional a cualquier ciudad (requiere documento)."}
                </p>
              </div>
              <span className="shrink-0 font-semibold text-gray-900">
                {costo === 0 ? "Gratis" : formatCOP(costo)}
              </span>
            </button>
          );
        })}
      </div>

      {envioMetodo !== "RECOGER" && (
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Dirección completa *"
              placeholder="Calle, carrera, número, barrio, edificio/apt"
              value={envio.direccion}
              onChange={(e) =>
                setEnvio({ ...envio, direccion: e.target.value })
              }
            />
          </div>
          <Input
            label="Nombre del destinatario *"
            placeholder="Quién recibe el pedido"
            value={envio.destinatario}
            onChange={(e) =>
              setEnvio({ ...envio, destinatario: e.target.value })
            }
          />
          <Input
            label="Teléfono de contacto *"
            placeholder="300 123 4567"
            value={envio.telefono}
            onChange={(e) => setEnvio({ ...envio, telefono: e.target.value })}
          />
          {envioMetodo === "TRANSPORTADORA" && (
            <div className="sm:col-span-2">
              <Input
                label="Número de documento (CC / NIT) *"
                placeholder="Requerido por transportadora"
                value={envio.documento}
                onChange={(e) =>
                  setEnvio({ ...envio, documento: e.target.value })
                }
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function PasoConfirmacion({
  cliente,
  items,
  envioMetodo,
  envio,
  costoEnvio,
  subtotal,
  total,
  observaciones,
  archivos,
  actionState,
  onSubmit,
  formRef,
  isPending,
}: {
  cliente: FormCliente;
  items: CartItem[];
  envioMetodo: EnvioMetodo;
  envio: FormEnvio;
  costoEnvio: number;
  subtotal: number;
  total: number;
  observaciones: string;
  archivos: File[];
  actionState: CheckoutActionState;
  onSubmit: () => void;
  formRef: React.RefObject<HTMLFormElement | null>;
  isPending: boolean;
}) {
  const metodoLabel =
    envioMetodo === "RECOGER"
      ? "Recoger en tienda"
      : envioMetodo === "DOMICILIO"
        ? "Entrega a domicilio"
        : "Envío por transportadora";

  return (
    <form ref={formRef} action={onSubmit as never} className="space-y-6">
      <Card>
        <CardHeader
          title="Resumen del pedido"
          description="Verifica que todo esté correcto antes de confirmar."
        />

        <div className="space-y-5 text-sm">
          <SeccionResumen title="Cliente" icon={<User className="size-4" />}>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <dt className="text-gray-500">Nombre</dt>
              <dd className="font-medium text-gray-900">
                {cliente.nombreCompleto}
              </dd>
              <dt className="text-gray-500">WhatsApp</dt>
              <dd className="font-medium text-gray-900">{cliente.whatsapp}</dd>
              <dt className="text-gray-500">Ciudad</dt>
              <dd className="font-medium text-gray-900">{cliente.ciudad}</dd>
              <dt className="text-gray-500">Correo</dt>
              <dd className="font-medium text-gray-900">{cliente.email}</dd>
              {cliente.empresa && (
                <>
                  <dt className="text-gray-500">Empresa</dt>
                  <dd className="font-medium text-gray-900">
                    {cliente.empresa}
                  </dd>
                </>
              )}
            </dl>
          </SeccionResumen>

          <SeccionResumen
            title="Productos"
            icon={<ShoppingBag className="size-4" />}
          >
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-md bg-gray-50 p-3"
                >
                  {item.imagenUrl && (
                    <Image
                      src={item.imagenUrl}
                      alt={item.nombre}
                      width={56}
                      height={56}
                      className="size-14 shrink-0 rounded object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{item.nombre}</p>
                    {item.opciones.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {item.opciones.map((o) => o.nombre).join(", ")}
                      </p>
                    )}
                    {item.personalizaciones.length > 0 && (
                      <p className="mt-0.5 text-xs text-gray-600">
                        {item.personalizaciones
                          .map((p) => `${p.nombre}: ${p.valor}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-gray-500">x{item.cantidad}</p>
                    <p className="font-semibold text-gray-900">
                      {formatCOP(item.precioUnitario * item.cantidad)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </SeccionResumen>

          <SeccionResumen title="Envío" icon={<Truck className="size-4" />}>
            <p className="font-medium text-gray-900">{metodoLabel}</p>
            {envioMetodo !== "RECOGER" && (
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <dt className="text-gray-500">Dirección</dt>
                <dd className="text-gray-700">{envio.direccion}</dd>
                <dt className="text-gray-500">Destinatario</dt>
                <dd className="text-gray-700">{envio.destinatario}</dd>
                <dt className="text-gray-500">Teléfono</dt>
                <dd className="text-gray-700">{envio.telefono}</dd>
                {envioMetodo === "TRANSPORTADORA" && (
                  <>
                    <dt className="text-gray-500">Documento</dt>
                    <dd className="text-gray-700">{envio.documento}</dd>
                  </>
                )}
              </dl>
            )}
            <p className="mt-2 text-sm font-semibold text-primary-600">
              Costo envío: {costoEnvio === 0 ? "Gratis" : formatCOP(costoEnvio)}
            </p>
          </SeccionResumen>

          {(observaciones || archivos.length > 0) && (
            <SeccionResumen
              title="Notas y archivos"
              icon={<FileUp className="size-4" />}
            >
              {observaciones && (
                <p className="whitespace-pre-wrap text-gray-700">
                  {observaciones}
                </p>
              )}
              {archivos.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-gray-600">
                  {archivos.map((f, i) => (
                    <li key={i}>· {f.name}</li>
                  ))}
                </ul>
              )}
            </SeccionResumen>
          )}

          <div className="rounded-lg border border-primary-100 bg-primary-50/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">
                {formatCOP(subtotal)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-gray-600">Envío</span>
              <span className="font-medium text-gray-900">
                {costoEnvio === 0 ? "Gratis" : formatCOP(costoEnvio)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-primary-100 pt-3">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-display text-xl font-bold text-primary-700">
                {formatCOP(total)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {actionState.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionState.message}
        </div>
      )}

      <Button fullWidth size="lg" loading={isPending} type="submit">
        Confirmar y generar pedido
      </Button>
      <p className="text-center text-xs text-gray-400">
        Al confirmar aceptas nuestra política de pedidos.
      </p>
    </form>
  );
}

function SeccionResumen({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function ResumenLateral({
  items,
  subtotal,
  costoEnvio,
  total,
  tiempoProduccionMax,
}: {
  items: CartItem[];
  subtotal: number;
  costoEnvio: number;
  total: number;
  tiempoProduccionMax: number | null;
}) {
  return (
    <div className="lg:sticky lg:top-4 lg:self-start">
      <Card className="h-fit space-y-4">
        <h2 className="font-display text-base font-semibold text-gray-900">
          Resumen
        </h2>

        <div className="max-h-64 space-y-3 overflow-auto pr-1">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-2.5 text-xs">
              {i.imagenUrl && (
                <Image
                  src={i.imagenUrl}
                  alt={i.nombre}
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-800">{i.nombre}</p>
                <p className="text-gray-500">x{i.cantidad}</p>
              </div>
              <span className="font-semibold text-gray-900">
                {formatCOP(i.precioUnitario * i.cantidad)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-gray-100 pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatCOP(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Envío</span>
            <span className="font-medium text-gray-900">
              {costoEnvio === 0 ? "Gratis" : formatCOP(costoEnvio)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 text-base">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-gray-900">{formatCOP(total)}</span>
          </div>
        </div>

        {tiempoProduccionMax !== null && (
          <p className="flex items-center gap-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <Clock className="size-3.5" />
            Producción: {tiempoProduccionMax} día(s) estimados
          </p>
        )}
      </Card>
    </div>
  );
}
