import { z } from "zod";
import type { EstadoFactura, TipoPago } from "@/generated/prisma/client";

export const TIPO_PAGO_LABEL: Record<TipoPago, string> = {
  ANTICIPO: "Anticipo",
  ABONO: "Abono parcial",
  PAGO_FINAL: "Pago final",
};

export const TIPO_PAGO_ORDER: TipoPago[] = ["ANTICIPO", "ABONO", "PAGO_FINAL"];

export const METODOS_PAGO_PREDETERMINADOS = [
  "Transferencia Bancaria",
  "Efectivo",
  "Tarjeta Débito/Crédito",
  "Nequi",
  "Daviplata",
  "Cheque",
] as const;

export const ESTADO_FACTURA_LABEL: Record<EstadoFactura, string> = {
  PENDIENTE: "Pendiente",
  EMITIDA: "Emitida",
  ANULADA: "Anulada",
};

export const ESTADO_FACTURA_COLOR: Record<
  EstadoFactura,
  string
> = {
  PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
  EMITIDA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ANULADA: "bg-gray-100 text-gray-600 border-gray-200",
};

export const RegistrarPagoSchema = z.object({
  pedidoId: z.string().min(1, "El pedido es obligatorio."),
  tipo: z.enum(["ANTICIPO", "ABONO", "PAGO_FINAL"], {
    error: "Selecciona un tipo de pago.",
  }),
  monto: z.coerce
    .number({ error: "Ingresa un monto válido." })
    .positive("El monto debe ser mayor a 0."),
  metodo: z
    .string()
    .trim()
    .min(1, "El método de pago es obligatorio.")
    .max(100),
  fecha: z.coerce.date().optional(),
  notas: z.string().trim().max(500).optional(),
});

export type RegistrarPagoInput = z.infer<typeof RegistrarPagoSchema>;

export const GestionarFacturaSchema = z.object({
  pedidoId: z.string().min(1, "El pedido es obligatorio."),
  numero: z
    .string()
    .trim()
    .max(50, "El número de factura no puede superar 50 caracteres.")
    .optional()
    .or(z.literal("")),
  estado: z.enum(["PENDIENTE", "EMITIDA", "ANULADA"]),
  notas: z.string().trim().max(500).optional(),
});

export type GestionarFacturaInput = z.infer<typeof GestionarFacturaSchema>;
