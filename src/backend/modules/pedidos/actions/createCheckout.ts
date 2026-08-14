"use server";

import { CheckoutSchema } from "../schemas/checkout.schema";
import {
  crearPedido,
  construirMensajeWhatsapp,
} from "../services/pedido.service";
import { toErrorMessage } from "@/src/shared/lib/errors";

export type CheckoutActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  pedidoCodigo?: string;
  pedidoToken?: string;
  whatsappMessage?: string;
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
    });

    return {
      success: true,
      pedidoCodigo: pedido.codigo,
      pedidoToken: pedido.tokenSeguimiento,
      whatsappMessage: mensaje,
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
