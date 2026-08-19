"use server";

import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";
import {
  ListarPedidosSchema,
  CambiarEstadoSchema,
  ComentarioInternoSchema,
} from "../schemas/pedido-admin.schema";
import {
  listarPedidos,
  obtenerDetallePedido,
  cambiarEstadoPedido,
  agregarComentario,
  obtenerListadoCiudades,
  registrarPago,
  actualizarGuiaEnvio,
  obtenerDetalleSeguimientoPublico,
  listarEnvios,
} from "../services/pedido.service";
import { AppError, toErrorMessage } from "@/src/shared/lib/errors";
import { safeHttpUrl } from "@/src/shared/lib/safe-url";

export type ListadoPedidosState = {
  success: boolean;
  error?: string;
  data?: Awaited<ReturnType<typeof listarPedidos>>;
  ciudades?: string[];
};

export type DetallePedidoState = {
  success: boolean;
  error?: string;
  data?: Awaited<ReturnType<typeof obtenerDetallePedido>>;
};

export type ActionState = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[] | undefined>;
};

const initialAction: ActionState = { success: false };

export async function listarPedidosAction(
  filtros: Record<string, FormDataEntryValue | null> = {},
): Promise<ListadoPedidosState> {
  await requireAdmin(PERMISOS.PEDIDOS_GESTIONAR);
  const fd = new FormData();
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== null && v !== undefined) fd.append(k, String(v));
  });
  const parsed = ListarPedidosSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { success: false, error: "Filtros inválidos." };
  }
  try {
    const [data, ciudades] = await Promise.all([
      listarPedidos(parsed.data),
      obtenerListadoCiudades(),
    ]);
    return { success: true, data, ciudades };
  } catch (e) {
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function obtenerDetallePedidoAction(
  id: string,
): Promise<DetallePedidoState> {
  await requireAdmin(PERMISOS.PEDIDOS_GESTIONAR);
  try {
    const data = await obtenerDetallePedido(id);
    return { success: true, data };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function cambiarEstadoPedidoAction(
  prevState: ActionState = initialAction,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin(PERMISOS.PEDIDOS_GESTIONAR);
  const parsed = CambiarEstadoSchema.safeParse({
    pedidoId: formData.get("pedidoId"),
    estado: formData.get("estado"),
    descripcion: formData.get("descripcion") || undefined,
  });
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    const res = await cambiarEstadoPedido({
      ...parsed.data,
      usuarioId: user.sub,
    });
    return {
      success: true,
      message: res.cambiado
        ? "Estado actualizado correctamente."
        : "El estado no cambió.",
    };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function agregarComentarioAction(
  prevState: ActionState = initialAction,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin(PERMISOS.PEDIDOS_GESTIONAR);
  const parsed = ComentarioInternoSchema.safeParse({
    pedidoId: formData.get("pedidoId"),
    descripcion: formData.get("descripcion"),
  });
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    await agregarComentario({
      pedidoId: parsed.data.pedidoId,
      usuarioId: user.sub,
      descripcion: parsed.data.descripcion,
    });
    return { success: true, message: "Comentario agregado." };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function registrarPagoAction(
  prevState: ActionState = initialAction,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin(PERMISOS.PAGOS_GESTIONAR);
  const pedidoId = String(formData.get("pedidoId") ?? "");
  const tipo = String(formData.get("tipo") ?? "ABONO") as
    "ANTICIPO" | "ABONO" | "PAGO_FINAL";
  const monto = Number(formData.get("monto") ?? 0);
  const metodo = String(formData.get("metodo") ?? "Transferencia");

  if (!pedidoId || !monto || monto <= 0) {
    return { success: false, error: "Ingresa un monto de pago válido." };
  }

  try {
    await registrarPago({
      pedidoId,
      tipo,
      monto,
      metodo,
      usuarioId: user.sub,
    });
    return {
      success: true,
      message: `Pago de $${monto.toLocaleString("es-CO")} registrado exitosamente.`,
    };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function actualizarEnvioAction(
  prevState: ActionState = initialAction,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin(PERMISOS.ENVIOS_GESTIONAR);
  const pedidoId = String(formData.get("pedidoId") ?? "");
  const numeroGuia = String(formData.get("numeroGuia") ?? "");
  const estadoGuia =
    (formData.get("estadoGuia") as
      "GENERADA" | "EN_TRANSITO" | "ENTREGADA" | "DEVUELTA" | null) ||
    "GENERADA";
  const enlaceRastreo = String(formData.get("enlaceRastreo") ?? "").trim();

  if (!pedidoId || !numeroGuia.trim()) {
    return { success: false, error: "El número de guía es obligatorio." };
  }

  if (enlaceRastreo) {
    const validacion = safeHttpUrl.safeParse(enlaceRastreo);
    if (!validacion.success) {
      return {
        success: false,
        error:
          "El enlace de rastreo debe ser una URL http:// o https:// válida.",
      };
    }
  }

  try {
    await actualizarGuiaEnvio({
      pedidoId,
      numeroGuia,
      estadoGuia,
      enlaceRastreo: enlaceRastreo || undefined,
      usuarioId: user.sub,
    });
    return {
      success: true,
      message: `Guía ${numeroGuia} guardada correctamente.`,
    };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function obtenerSeguimientoPublicoAction(token: string) {
  try {
    const data = await obtenerDetalleSeguimientoPublico(token);
    return { success: true, data };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function listarEnviosAction(limit = 50) {
  await requireAdmin(PERMISOS.ENVIOS_GESTIONAR);
  return listarEnvios(limit);
}
