import { z } from "zod";
import type { EstadoPedido, TipoEventoTimeline } from "@/generated/prisma/client";

export const ESTADOS_PEDIDO_ORDEN: EstadoPedido[] = [
  "NUEVO",
  "EN_REVISION",
  "ESPERANDO_CLIENTE",
  "DISENO_APROBADO",
  "EN_PRODUCCION",
  "EMPACADO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
];

export const TRANSICIONES_PERMITIDAS: Record<EstadoPedido, EstadoPedido[]> = {
  NUEVO: ["EN_REVISION", "CANCELADO"],
  EN_REVISION: ["ESPERANDO_CLIENTE", "DISENO_APROBADO", "NUEVO", "CANCELADO"],
  ESPERANDO_CLIENTE: ["DISENO_APROBADO", "EN_REVISION", "CANCELADO"],
  DISENO_APROBADO: ["EN_PRODUCCION", "ESPERANDO_CLIENTE", "CANCELADO"],
  EN_PRODUCCION: ["EMPACADO", "DISENO_APROBADO", "CANCELADO"],
  EMPACADO: ["ENVIADO", "EN_PRODUCCION", "CANCELADO"],
  ENVIADO: ["ENTREGADO", "EMPACADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

export const ESTADO_PEDIDO_LABEL: Record<EstadoPedido, string> = {
  NUEVO: "Nuevo",
  EN_REVISION: "En revisión",
  ESPERANDO_CLIENTE: "Esperando cliente",
  DISENO_APROBADO: "Diseño aprobado",
  EN_PRODUCCION: "En producción",
  EMPACADO: "Empacado",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ESTADO_PEDIDO_COLOR: Record<
  EstadoPedido,
  "bg-gray-100 text-gray-700 border-gray-200" |
  "bg-blue-50 text-blue-700 border-blue-200" |
  "bg-amber-50 text-amber-700 border-amber-200" |
  "bg-violet-50 text-violet-700 border-violet-200" |
  "bg-indigo-50 text-indigo-700 border-indigo-200" |
  "bg-purple-50 text-purple-700 border-purple-200" |
  "bg-sky-50 text-sky-700 border-sky-200" |
  "bg-emerald-50 text-emerald-700 border-emerald-200" |
  "bg-red-50 text-red-700 border-red-200"
> = {
  NUEVO: "bg-gray-100 text-gray-700 border-gray-200",
  EN_REVISION: "bg-blue-50 text-blue-700 border-blue-200",
  ESPERANDO_CLIENTE: "bg-amber-50 text-amber-700 border-amber-200",
  DISENO_APROBADO: "bg-violet-50 text-violet-700 border-violet-200",
  EN_PRODUCCION: "bg-indigo-50 text-indigo-700 border-indigo-200",
  EMPACADO: "bg-purple-50 text-purple-700 border-purple-200",
  ENVIADO: "bg-sky-50 text-sky-700 border-sky-200",
  ENTREGADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELADO: "bg-red-50 text-red-700 border-red-200",
};

export const TIPO_EVENTO_LABEL: Record<TipoEventoTimeline, string> = {
  CREACION_PEDIDO: "Pedido creado",
  CAMBIO_ESTADO: "Cambio de estado",
  PAGO_REGISTRADO: "Pago registrado",
  ARCHIVO_ADJUNTO: "Archivo adjunto",
  ENVIO_GENERADO: "Envío generado",
  COMENTARIO_INTERNO: "Comentario interno",
  PRODUCCION_AVANCE: "Avance de producción",
  COMENTARIO_CLIENTE: "Comentario del cliente",
  SOLICITUD_CAMBIO: "Solicitud de cambio",
};

export const ListarPedidosSchema = z.object({
  estado: z.string().optional(),
  ciudad: z.string().trim().optional(),
  cliente: z.string().trim().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().max(100).optional(),
});

export type ListarPedidosInput = z.infer<typeof ListarPedidosSchema>;

export const CambiarEstadoSchema = z.object({
  pedidoId: z.string().min(1),
  estado: z.string().min(1),
  descripcion: z.string().trim().max(500).optional(),
});

export type CambiarEstadoInput = z.infer<typeof CambiarEstadoSchema>;

export const ComentarioInternoSchema = z.object({
  pedidoId: z.string().min(1),
  descripcion: z.string().trim().min(1, "Ingresa un comentario.").max(500),
});

export type ComentarioInternoInput = z.infer<typeof ComentarioInternoSchema>;
