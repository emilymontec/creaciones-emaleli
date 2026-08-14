"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "../../auth/lib/session";
import {
  registrarAvanceProduccion,
  obtenerAvancesProduccion,
  eliminarAvanceProduccion,
  cambiarVisibilidadAvance,
  registrarComentarioProduccion,
  obtenerComentariosProduccion,
  crearSolicitudCambio,
  obtenerSolicitudesCambio,
  responderSolicitudCambio,
  cambiarEstadoSolicitudCambio,
  agregarComentarioASolicitud,
} from "../services/produccion.service";
import { AppError, toErrorMessage } from "@/src/shared/lib/errors";
import type {
  VisibilidadComentario,
  OrigenSolicitudCambio,
  EstadoSolicitudCambio,
} from "@/generated/prisma/client";

export type ProduccionActionState = {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
  errors?: Record<string, string[] | undefined>;
};

const initialState: ProduccionActionState = { success: false };

async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function subirAvanceProduccionAction(
  prevState: ProduccionActionState = initialState,
  formData: FormData,
): Promise<ProduccionActionState> {
  const user = await requireUser();
  const pedidoId = String(formData.get("pedidoId") ?? "");
  const archivo = formData.get("archivo") as File | null;
  const titulo = String(formData.get("titulo") ?? "");
  const descripcion = String(formData.get("descripcion") ?? "");
  const visibleCliente = formData.get("visibleCliente") === "on";

  if (!pedidoId) return { success: false, error: "Pedido inválido." };
  if (!archivo || archivo.size === 0) {
    return { success: false, error: "Debes seleccionar un archivo." };
  }

  try {
    const data = await registrarAvanceProduccion({
      pedidoId,
      archivo,
      titulo,
      descripcion,
      visibleCliente,
      usuarioId: user.sub,
    });
    return {
      success: true,
      message:
        data.tipo === "VIDEO"
          ? "Video de avance cargado."
          : "Foto de avance cargada.",
      data,
    };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function eliminarAvanceProduccionAction(
  pedidoId: string,
  avanceId: string,
): Promise<ProduccionActionState> {
  await requireUser();
  try {
    await eliminarAvanceProduccion(avanceId, pedidoId);
    return { success: true, message: "Avance eliminado." };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function toggleVisibilidadAvanceAction(
  pedidoId: string,
  avanceId: string,
  visibleCliente: boolean,
): Promise<ProduccionActionState> {
  await requireUser();
  try {
    await cambiarVisibilidadAvance(avanceId, pedidoId, visibleCliente);
    return {
      success: true,
      message: visibleCliente
        ? "Visible para el cliente."
        : "Oculto del cliente.",
    };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function agregarComentarioProduccionAction(
  prevState: ProduccionActionState = initialState,
  formData: FormData,
): Promise<ProduccionActionState> {
  const user = await requireUser();
  const pedidoId = String(formData.get("pedidoId") ?? "");
  const contenido = String(formData.get("contenido") ?? "");
  const visibilidad = String(
    formData.get("visibilidad") ?? "INTERNO",
  ) as VisibilidadComentario;

  if (!pedidoId) return { success: false, error: "Pedido inválido." };
  if (!contenido.trim()) {
    return { success: false, error: "El comentario no puede estar vacío." };
  }

  try {
    const data = await registrarComentarioProduccion({
      pedidoId,
      contenido,
      visibilidad,
      usuarioId: user.sub,
      autorNombre: user.nombre,
    });
    return {
      success: true,
      message:
        visibilidad === "CLIENTE"
          ? "Comentario visible para el cliente."
          : "Comentario interno agregado.",
      data,
    };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function obtenerProduccionCompletaAction(pedidoId: string) {
  try {
    const [avances, comentarios, solicitudes] = await Promise.all([
      obtenerAvancesProduccion(pedidoId),
      obtenerComentariosProduccion(pedidoId),
      obtenerSolicitudesCambio(pedidoId),
    ]);
    return {
      success: true,
      data: { avances, comentarios, solicitudes },
    } as const;
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function crearSolicitudCambioAction(
  prevState: ProduccionActionState = initialState,
  formData: FormData,
): Promise<ProduccionActionState> {
  const user = await requireUser();
  const pedidoId = String(formData.get("pedidoId") ?? "");
  const descripcion = String(formData.get("descripcion") ?? "");
  const origen = String(
    formData.get("origen") ?? "ADMIN",
  ) as OrigenSolicitudCambio;
  const comentarioInicial = String(formData.get("comentarioInicial") ?? "");

  if (!pedidoId) return { success: false, error: "Pedido inválido." };
  if (!descripcion.trim()) {
    return { success: false, error: "La descripción es obligatoria." };
  }

  try {
    const data = await crearSolicitudCambio({
      pedidoId,
      descripcion,
      origen,
      creadorPor: user.nombre,
      comentarioInicial,
    });
    return {
      success: true,
      message: "Solicitud de cambio creada.",
      data,
    };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function responderSolicitudCambioAction(
  prevState: ProduccionActionState = initialState,
  formData: FormData,
): Promise<ProduccionActionState> {
  await requireUser();
  const id = String(formData.get("solicitudId") ?? "");
  const respuesta = String(formData.get("respuesta") ?? "");
  const estado =
    (formData.get("estado") as EstadoSolicitudCambio | null) ?? undefined;

  if (!id) return { success: false, error: "Solicitud inválida." };
  if (!respuesta.trim()) {
    return { success: false, error: "La respuesta es obligatoria." };
  }

  try {
    const data = await responderSolicitudCambio({
      id,
      respuestaCliente: respuesta,
      estado,
    });
    return {
      success: true,
      message: "Respuesta registrada correctamente.",
      data,
    };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function cambiarEstadoSolicitudAction(
  id: string,
  estado: EstadoSolicitudCambio,
): Promise<ProduccionActionState> {
  await requireUser();
  try {
    const data = await cambiarEstadoSolicitudCambio({ id, estado });
    return {
      success: true,
      message: `Estado de solicitud: ${estado}.`,
      data,
    };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}

export async function agregarComentarioSolicitudAction(
  prevState: ProduccionActionState = initialState,
  formData: FormData,
): Promise<ProduccionActionState> {
  const user = await requireUser();
  const solicitudId = String(formData.get("solicitudId") ?? "");
  const contenido = String(formData.get("contenido") ?? "");
  const origen = String(
    formData.get("origen") ?? "ADMIN",
  ) as OrigenSolicitudCambio;
  const visibleCliente = formData.get("visibleCliente") === "on";

  if (!solicitudId) return { success: false, error: "Solicitud inválida." };
  if (!contenido.trim()) {
    return { success: false, error: "El comentario está vacío." };
  }

  try {
    const data = await agregarComentarioASolicitud({
      solicitudId,
      contenido,
      autor: user.nombre,
      origen,
      visibleCliente,
    });
    return { success: true, message: "Comentario agregado.", data };
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: toErrorMessage(e) };
  }
}
