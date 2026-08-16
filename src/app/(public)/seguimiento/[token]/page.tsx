import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Package,
  PackageCheck,
  Sparkles,
  Truck,
  ArrowLeft,
  MessageCircle,
  Image as ImageIcon,
  Video,
  MessageSquare,
  Repeat,
  Check,
  X,
} from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { obtenerSeguimientoPublicoAction } from "@/src/backend/modules/pedidos/actions/managePedidos";
import { EstadoPedidoBadge } from "@/src/frontend/modules/pedidos/components/EstadoPedidoBadge";

export const metadata: Metadata = {
  title: "Seguimiento de Pedido | Creaciones Emaleli",
};

const ETAPAS = [
  { estado: "NUEVO", label: "Pedido Recibido", icon: Sparkles },
  { estado: "EN_REVISION", label: "En Revisión", icon: Clock },
  { estado: "EN_PRODUCCION", label: "En Producción", icon: Package },
  { estado: "EMPACADO", label: "Empacado", icon: PackageCheck },
  { estado: "ENVIADO", label: "En Camino", icon: Truck },
  { estado: "ENTREGADO", label: "Entregado", icon: CheckCircle2 },
];

const SOLICITUD_ESTADO_COLOR: Record<string, string> = {
  ABIERTA: "bg-amber-100 text-amber-800 border-amber-200",
  EN_REVISION: "bg-blue-100 text-blue-800 border-blue-200",
  APROBADA: "bg-emerald-100 text-emerald-800 border-emerald-200",
  RECHAZADA: "bg-red-100 text-red-800 border-red-200",
  CERRADA: "bg-gray-100 text-gray-800 border-gray-200",
};

const SOLICITUD_ESTADO_LABEL: Record<string, string> = {
  ABIERTA: "Abierta",
  EN_REVISION: "En revisión",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CERRADA: "Cerrada",
};

export default async function SeguimientoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const res = await obtenerSeguimientoPublicoAction(token);

  if (!res.success || !res.data) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <Card className="p-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Pedido no encontrado
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            El enlace de seguimiento no es válido o el pedido ya no está disponible.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-button bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Ir al inicio
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const p = res.data;

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="container mx-auto max-w-3xl px-4 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-primary-600"
          >
            <ArrowLeft className="size-4" />
            Volver a la tienda
          </Link>
          <Badge variant="neutral">Consulta Pública</Badge>
        </div>

        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Código de pedido
              </p>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                {p.codigo}
              </h1>
            </div>
            <EstadoPedidoBadge estado={p.estado} size="md" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">Cliente</p>
              <p className="font-semibold text-gray-900">{p.cliente.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ciudad de entrega</p>
              <p className="font-semibold text-gray-900">{p.ciudad}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total pedido</p>
              <p className="font-semibold text-gray-900">
                ${Number(p.total).toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Saldo pendiente</p>
              <p
                className={`font-semibold ${
                  Number(p.saldoPendiente) > 0 ? "text-amber-700" : "text-emerald-700"
                }`}
              >
                ${Number(p.saldoPendiente).toLocaleString("es-CO")}
              </p>
            </div>
          </div>
        </Card>

        {/* Línea de tiempo de etapas */}
        <Card className="p-6">
          <h2 className="mb-4 font-display text-base font-semibold text-gray-900">
            Estado de tu pedido
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            {ETAPAS.map((e, index) => {
              const Icon = e.icon;
              const alcanzado = ETAPAS.findIndex((i) => i.estado === p.estado) >= index;
              return (
                <div
                  key={e.estado}
                  className={`flex flex-col items-center rounded-xl p-3 text-center border ${
                    alcanzado
                      ? "border-primary-200 bg-primary-50/50 text-primary-700"
                      : "border-gray-100 bg-gray-50 text-gray-400"
                  }`}
                >
                  <Icon className="size-6 mb-1" />
                  <span className="text-xs font-semibold leading-tight">{e.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Envíos */}
        {p.envios?.[0]?.numeroGuia && (
          <Card className="p-6">
            <h2 className="mb-2 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="size-5 text-primary-600" /> Información de Envío
            </h2>
            <p className="text-sm text-gray-600">
              Número de guía: <strong className="font-mono text-gray-900">{p.envios[0].numeroGuia}</strong>
            </p>
            {p.envios[0].enlaceRastreo && (
              <a
                href={p.envios[0].enlaceRastreo}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline"
              >
                Rastrear envío en transportadora →
              </a>
            )}
          </Card>
        )}

        {/* Avances de producción */}
        {p.avancesProduccion && p.avancesProduccion.length > 0 && (
          <Card className="p-6">
            <h2 className="mb-4 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="size-5 text-primary-600" /> Avances de producción
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {p.avancesProduccion.map((a) => (
                <div key={a.id} className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  {a.tipo === "IMAGEN" ? (
                    <div className="relative aspect-square w-full bg-gray-100">
                      <img
                        src={a.url}
                        alt={a.titulo || a.nombre || "Avance de producción"}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video w-full bg-black">
                      <video
                        src={a.url}
                        controls
                        playsInline
                        className="size-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1 p-3">
                    {(a.titulo || a.nombre) && (
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {a.titulo || a.nombre}
                      </p>
                    )}
                    {a.descripcion && (
                      <p className="text-xs text-gray-600 line-clamp-3">{a.descripcion}</p>
                    )}
                    <time className="block text-[11px] text-gray-400 pt-1">
                      {new Date(a.createdAt).toLocaleString("es-CO")}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Solicitudes de cambio */}
        {p.solicitudes && p.solicitudes.length > 0 && (
          <Card className="p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-gray-900 flex items-center gap-2">
              <Repeat className="size-5 text-primary-600" /> Solicitudes de cambio
            </h2>
            {p.solicitudes.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${SOLICITUD_ESTADO_COLOR[s.estado] || SOLICITUD_ESTADO_COLOR.ABIERTA}`}
                    >
                      {s.estado === "APROBADA" && <Check className="size-3" />}
                      {s.estado === "RECHAZADA" && <X className="size-3" />}
                      {SOLICITUD_ESTADO_LABEL[s.estado] || s.estado}
                    </span>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{s.descripcion}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {s.origen === "CLIENTE" ? "Solicitada por ti" : "Solicitud del equipo Emaleli"} ·{" "}
                      {new Date(s.createdAt).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>

                {s.respuestaCliente && (
                  <div className="rounded-lg bg-white border border-gray-100 p-3">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Respuesta
                      {s.respuestaAt && (
                        <span className="normal-case text-gray-400 font-normal"> · {new Date(s.respuestaAt).toLocaleString("es-CO")}</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-800">{s.respuestaCliente}</p>
                  </div>
                )}

                {s.comentarios && s.comentarios.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {s.comentarios.map((c) => (
                      <div
                        key={c.id}
                        className={`rounded-lg p-3 text-sm ${
                          c.origen === "CLIENTE"
                            ? "bg-primary-50 border border-primary-100"
                            : "bg-white border border-gray-100"
                        }`}
                      >
                        <p className="text-[11px] font-semibold text-gray-500 mb-1">
                          {c.autor}
                          <span className="font-normal text-gray-400"> · {new Date(c.createdAt).toLocaleString("es-CO")}</span>
                        </p>
                        <p className="text-gray-800">{c.contenido}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}

        {/* Comentarios al cliente */}
        {p.comentariosProduccion && p.comentariosProduccion.length > 0 && (
          <Card className="p-6 space-y-3">
            <h2 className="font-display text-base font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="size-5 text-primary-600" /> Comentarios del equipo
            </h2>
            {p.comentariosProduccion.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-primary-100 bg-primary-50/50 p-4"
              >
                <p className="text-[11px] font-semibold text-gray-500 mb-1">
                  {c.autorNombre || "Equipo Emaleli"}
                  <span className="font-normal text-gray-400"> · {new Date(c.createdAt).toLocaleString("es-CO")}</span>
                </p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.contenido}</p>
              </div>
            ))}
          </Card>
        )}

        {/* Timeline público */}
        <Card className="p-6">
          <h2 className="mb-4 font-display text-base font-semibold text-gray-900">
            Historial de eventos
          </h2>
          <ol className="relative border-l border-gray-200 ml-3 space-y-4">
            {p.timeline.map((ev) => (
              <li key={ev.id} className="mb-4 ml-6">
                <span className="absolute -left-3 flex size-6 items-center justify-center rounded-full bg-primary-100 text-primary-600 ring-8 ring-white">
                  <Clock className="size-3" />
                </span>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                  {ev.tipo.replace("_", " ")}
                </p>
                {ev.descripcion && (
                  <p className="text-sm text-gray-600 mt-0.5">{ev.descripcion}</p>
                )}
                <time className="text-[11px] text-gray-400">
                  {new Date(ev.createdAt).toLocaleString("es-CO")}
                </time>
              </li>
            ))}
          </ol>
        </Card>

        <div className="text-center pt-2">
          <a
            href={`https://wa.me/573001234567?text=${encodeURIComponent(
              `Hola, quisiera consultar sobre mi pedido ${p.codigo}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-button bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <MessageCircle className="size-4" />
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
