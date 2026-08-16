"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "../../auth/lib/session";
import {
  RegistrarPagoSchema,
  GestionarFacturaSchema,
} from "../schemas/pago.schema";
import {
  registrarPagoConComprobante,
  obtenerFacturaPedido,
  gestionarFactura,
  obtenerResumenFinanciero,
  listarHistorialPagos,
} from "../services/pago.service";
import { AppError, toErrorMessage } from "@/src/shared/lib/errors";
import { getOptionalFile } from "@/src/backend/shared/uploadEntityImage";

export type PagoActionState = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[] | undefined>;
  pago?: Awaited<ReturnType<typeof registrarPagoConComprobante>>;
};

export type FacturaActionState = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[] | undefined>;
  factura?: Awaited<ReturnType<typeof gestionarFactura>>;
};

export type PagosGeneralState = {
  success: boolean;
  error?: string;
  resumen?: Awaited<ReturnType<typeof obtenerResumenFinanciero>>;
  pagos?: Awaited<ReturnType<typeof listarHistorialPagos>>;
};

const initialPago: PagoActionState = { success: false };
const initialFactura: FacturaActionState = { success: false };

export async function registrarPagoConComprobanteAction(
  prevState: PagoActionState = initialPago,
  formData: FormData,
): Promise<PagoActionState> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const comprobanteFile = getOptionalFile(formData, "comprobante");

  const parsed = RegistrarPagoSchema.safeParse({
    pedidoId: formData.get("pedidoId"),
    tipo: formData.get("tipo"),
    monto: formData.get("monto"),
    metodo: formData.get("metodo"),
    fecha: formData.get("fecha") || undefined,
    notas: formData.get("notas") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const pago = await registrarPagoConComprobante({
      ...parsed.data,
      usuarioId: user.sub,
      comprobanteFile,
    });
    return {
      success: true,
      message: `Pago de $${Number(pago.monto).toLocaleString("es-CO")} registrado correctamente.`,
      pago,
    };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function obtenerFacturaPedidoAction(
  pedidoId: string,
): Promise<FacturaActionState & { success: boolean }> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  try {
    const factura = await obtenerFacturaPedido(pedidoId);
    return { success: true, factura };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function gestionarFacturaAction(
  prevState: FacturaActionState = initialFactura,
  formData: FormData,
): Promise<FacturaActionState> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const facturaFile = getOptionalFile(formData, "facturaPdf");

  const parsed = GestionarFacturaSchema.safeParse({
    pedidoId: formData.get("pedidoId"),
    numero: formData.get("numero") ?? "",
    estado: formData.get("estado"),
    notas: formData.get("notas") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const factura = await gestionarFactura({
      ...parsed.data,
      usuarioId: user.sub,
      facturaFile,
    });
    return {
      success: true,
      message: `Factura ${factura.estado === "EMITIDA" ? "emitida" : factura.estado === "ANULADA" ? "anulada" : "actualizada"} correctamente.`,
      factura,
    };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function obtenerPanelPagosAction(): Promise<PagosGeneralState> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  try {
    const [resumen, pagos] = await Promise.all([
      obtenerResumenFinanciero(),
      listarHistorialPagos({ take: 100 }),
    ]);
    return { success: true, resumen, pagos };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}
