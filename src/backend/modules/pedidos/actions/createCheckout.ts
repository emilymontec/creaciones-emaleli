"use server";

import { headers } from "next/headers";
import { CheckoutSchema } from "../schemas/checkout.schema";
import {
  crearPedido,
  construirMensajeWhatsapp,
} from "../services/pedido.service";
import { obtenerConfigContacto } from "@/src/backend/modules/configuracion/services/configuracion.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import { checkRateLimit } from "@/src/backend/shared/rate-limit";

const CHECKOUT_MAX_INTENTOS = 10;
const CHECKOUT_VENTANA_MS = 10 * 60 * 1000; // 10 minutos
const DEFAULT_WHATSAPP =
  process.env.NEXT_PUBLIC_EMPRESA_WHATSAPP ?? "573001234567";

async function obtenerIpCliente(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "desconocida"
  );
}

export type CheckoutActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  pedidoCodigo?: string;
  pedidoToken?: string;
  whatsappMessage?: string;
  whatsappNumber?: string;
  clienteNombre?: string;
  clienteWhatsapp?: string;
};

function parseArchivos(formData: FormData): File[] {
  const archivos: File[] = [];
  const entries = formData.getAll("archivos");
  for (const entry of entries) {
    if (entry instanceof File && entry.size > 0) {
      archivos.push(entry);
    }
  }
  return archivos;
}

function parseCheckout(formData: FormData) {
  const clienteJson = formData.get("cliente");
  const envioJson = formData.get("envio");
  const itemsJson = formData.get("items");
  const observaciones = formData.get("observaciones") || "";
  const costoEnvio = formData.get("costoEnvio") || "0";

  if (!clienteJson || !envioJson || !itemsJson) {
    throw new Error("Faltan datos del formulario.");
  }

  return {
    cliente: JSON.parse(String(clienteJson)),
    envio: JSON.parse(String(envioJson)),
    items: JSON.parse(String(itemsJson)),
    observaciones: String(observaciones),
    costoEnvio: Number(costoEnvio),
  };
}

export async function createCheckoutAction(
  _prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  try {
    const ip = await obtenerIpCliente();
    const rate = checkRateLimit(
      `checkout:${ip}`,
      CHECKOUT_MAX_INTENTOS,
      CHECKOUT_VENTANA_MS,
    );
    if (!rate.allowed) {
      return {
        success: false,
        message: `Demasiados pedidos creados en poco tiempo. Inténtalo de nuevo en ${Math.ceil(
          rate.retryAfterSeconds / 60,
        )} minuto(s).`,
      };
    }

    const parsed = parseCheckout(formData);
    const validated = CheckoutSchema.safeParse(parsed);

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const archivos = parseArchivos(formData);

    const pedido = await crearPedido({
      checkout: validated.data,
      archivosAdjuntos: archivos,
    });

    const contacto = await obtenerConfigContacto();
    const whatsappDestino = contacto.whatsapp || DEFAULT_WHATSAPP;

    const mensaje = construirMensajeWhatsapp({
      codigo: pedido.codigo,
      nombreCliente: pedido.cliente.nombre,
      items: pedido.items.map((i) => ({
        nombre: i.nombreProducto,
        cantidad: i.cantidad,
        precioUnitario: Number(i.precioUnitario),
      })),
      total: Number(pedido.total),
      metodoEnvio: pedido.metodoEnvio,
      notaPersonalizada: contacto.mensajeCheckout,
    });

    return {
      success: true,
      pedidoCodigo: pedido.codigo,
      pedidoToken: pedido.tokenSeguimiento,
      whatsappMessage: mensaje,
      whatsappNumber: whatsappDestino,
      clienteNombre: pedido.cliente.nombre,
      clienteWhatsapp: pedido.cliente.whatsapp,
    };
  } catch (error) {
    return {
      success: false,
      message: toErrorMessage(error),
    };
  }
}
