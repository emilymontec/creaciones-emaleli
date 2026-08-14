import * as repository from "../repositories/produccion.repository";
import * as pedidoRepository from "../repositories/pedido.repository";
import { AppError } from "@/src/shared/lib/errors";
import { uploadFile, getPublicUrl, deleteFile } from "@/src/shared/lib/storage";
import { STORAGE_BUCKETS } from "@/src/shared/constants/storage";
import type {
  EstadoSolicitudCambio,
  OrigenSolicitudCambio,
  VisibilidadComentario,
} from "@/generated/prisma/client";

export async function registrarAvanceProduccion(params: {
  pedidoId: string;
  archivo: File;
  titulo?: string;
  descripcion?: string;
  visibleCliente?: boolean;
  usuarioId?: string;
  orden?: number;
}) {
  const pedido = await pedidoRepository.obtenerPedidoDetalleAdmin(params.pedidoId);
  if (!pedido) {
    throw new AppError("Pedido no encontrado.", {
      statusCode: 404,
      code: "PEDIDO_NOT_FOUND",
    });
  }

  const tipo = repository.detectarTipoMedioProduccion(params.archivo.type);
  const ref = await uploadFile({
    bucket: STORAGE_BUCKETS.PRODUCCION_AVANCES,
    entityId: pedido.codigo,
    file: params.archivo,
  });

  return repository.agregarAvanceProduccion({
    pedidoId: params.pedidoId,
    tipo,
    url: getPublicUrl(ref),
    nombre: params.archivo.name,
    titulo: params.titulo?.trim() || undefined,
    descripcion: params.descripcion?.trim() || undefined,
    usuarioId: params.usuarioId ?? undefined,
    orden: params.orden ?? 0,
    visibleCliente: params.visibleCliente ?? true,
  });
}

export async function obtenerAvancesProduccion(pedidoId: string) {
  return repository.listarAvancesProduccion(pedidoId);
}

export async function eliminarAvanceProduccion(
  id: string,
  pedidoId: string,
) {
  const avance = await repository.eliminarAvanceProduccion(id, pedidoId);
  return avance;
}

export async function cambiarVisibilidadAvance(
  id: string,
  pedidoId: string,
  visibleCliente: boolean,
) {
  return repository.toggleAvanceVisibilidad(id, pedidoId, visibleCliente);
}

export async function registrarComentarioProduccion(params: {
  pedidoId: string;
  contenido: string;
  visibilidad: VisibilidadComentario;
  usuarioId?: string;
  autorNombre?: string;
}) {
  const pedido = await pedidoRepository.obtenerPedidoDetalleAdmin(params.pedidoId);
  if (!pedido) {
    throw new AppError("Pedido no encontrado.", {
      statusCode: 404,
      code: "PEDIDO_NOT_FOUND",
    });
  }

  if (!params.contenido.trim()) {
    throw new AppError("El comentario no puede estar vacío.", {
      statusCode: 400,
      code: "EMPTY_COMMENT",
    });
  }

  return repository.agregarComentarioProduccion({
    pedidoId: params.pedidoId,
    contenido: params.contenido.trim(),
    visibilidad: params.visibilidad,
    usuarioId: params.usuarioId ?? undefined,
    autorNombre: params.autorNombre?.trim() || undefined,
  });
}

export async function obtenerComentariosProduccion(pedidoId: string) {
  return repository.listarComentariosProduccion(pedidoId);
}

export async function crearSolicitudCambio(params: {
  pedidoId: string;
  descripcion: string;
  origen: OrigenSolicitudCambio;
  creadorPor?: string;
  comentarioInicial?: string;
}) {
  const pedido = await pedidoRepository.obtenerPedidoDetalleAdmin(params.pedidoId);
  if (!pedido) {
    throw new AppError("Pedido no encontrado.", {
      statusCode: 404,
      code: "PEDIDO_NOT_FOUND",
    });
  }

  if (!params.descripcion.trim()) {
    throw new AppError("La descripción de la solicitud es obligatoria.", {
      statusCode: 400,
      code: "EMPTY_DESCRIPTION",
    });
  }

  return repository.crearSolicitudCambio({
    pedidoId: params.pedidoId,
    descripcion: params.descripcion.trim(),
    origen: params.origen,
    creadorPor: params.creadorPor?.trim() || undefined,
    comentarioInicial: params.comentarioInicial,
    autor: params.creadorPor,
  });
}

export async function obtenerSolicitudesCambio(pedidoId: string) {
  return repository.listarSolicitudesCambio(pedidoId);
}

export async function responderSolicitudCambio(params: {
  id: string;
  respuestaCliente: string;
  estado?: EstadoSolicitudCambio;
}) {
  const solicitud = await repository.obtenerSolicitudCambio(params.id);
  if (!solicitud) {
    throw new AppError("Solicitud de cambio no encontrada.", {
      statusCode: 404,
      code: "SOLICITUD_NOT_FOUND",
    });
  }

  if (!params.respuestaCliente.trim()) {
    throw new AppError("La respuesta es obligatoria.", {
      statusCode: 400,
      code: "EMPTY_RESPONSE",
    });
  }

  const estado: EstadoSolicitudCambio = params.estado ?? solicitud.estado;
  const esCierre =
    estado === "APROBADA" || estado === "RECHAZADA" || estado === "CERRADA";

  return repository.actualizarEstadoSolicitudCambio({
    id: params.id,
    estado,
    respuestaCliente: params.respuestaCliente.trim(),
    respuestaAt: new Date(),
    resueltoAt: esCierre ? new Date() : undefined,
  });
}

export async function cambiarEstadoSolicitudCambio(params: {
  id: string;
  estado: EstadoSolicitudCambio;
}) {
  const solicitud = await repository.obtenerSolicitudCambio(params.id);
  if (!solicitud) {
    throw new AppError("Solicitud de cambio no encontrada.", {
      statusCode: 404,
      code: "SOLICITUD_NOT_FOUND",
    });
  }

  const esCierre =
    params.estado === "APROBADA" ||
    params.estado === "RECHAZADA" ||
    params.estado === "CERRADA";

  return repository.actualizarEstadoSolicitudCambio({
    id: params.id,
    estado: params.estado,
    resueltoAt: esCierre ? new Date() : undefined,
  });
}

export async function agregarComentarioASolicitud(params: {
  solicitudId: string;
  contenido: string;
  autor: string;
  origen: OrigenSolicitudCambio;
  visibleCliente?: boolean;
}) {
  if (!params.contenido.trim()) {
    throw new AppError("El comentario no puede estar vacío.", {
      statusCode: 400,
      code: "EMPTY_COMMENT",
    });
  }

  return repository.agregarComentarioSolicitud({
    solicitudId: params.solicitudId,
    contenido: params.contenido.trim(),
    autor: params.autor.trim(),
    origen: params.origen,
    visibleCliente: params.visibleCliente ?? true,
  });
}
