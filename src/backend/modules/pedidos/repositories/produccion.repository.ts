import { prisma } from "@/src/backend/shared/prisma";
import type {
  Prisma,
  TipoMedioProduccion,
  VisibilidadComentario,
  OrigenSolicitudCambio,
  EstadoSolicitudCambio,
} from "@/generated/prisma/client";

export async function agregarAvanceProduccion(
  data: Prisma.ProduccionAvanceUncheckedCreateInput,
) {
  return prisma.$transaction(async (tx) => {
    const avance = await tx.produccionAvance.create({
      data,
      include: { usuario: { select: { id: true, nombre: true } } },
    });

    await tx.eventoTimeline.create({
      data: {
        pedidoId: avance.pedidoId,
        tipo: "PRODUCCION_AVANCE",
        usuarioId: avance.usuarioId ?? undefined,
        descripcion: avance.titulo
          ? `Nuevo avance de producción: ${avance.titulo}`
          : "Nuevo avance de producción registrado.",
        metadata: {
          avanceId: avance.id,
          tipo: avance.tipo,
          url: avance.url,
          visibleCliente: avance.visibleCliente,
        },
      },
    });

    return avance;
  });
}

export async function listarAvancesProduccion(pedidoId: string) {
  return prisma.produccionAvance.findMany({
    where: { pedidoId },
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
    include: { usuario: { select: { id: true, nombre: true } } },
  });
}

export async function eliminarAvanceProduccion(id: string, pedidoId: string) {
  return prisma.produccionAvance.delete({
    where: { id, pedidoId },
  });
}

export async function toggleAvanceVisibilidad(
  id: string,
  pedidoId: string,
  visibleCliente: boolean,
) {
  return prisma.produccionAvance.update({
    where: { id, pedidoId },
    data: { visibleCliente },
  });
}

export async function agregarComentarioProduccion(
  data: Prisma.ComentarioProduccionUncheckedCreateInput,
) {
  return prisma.$transaction(async (tx) => {
    const comentario = await tx.comentarioProduccion.create({
      data,
      include: { usuario: { select: { id: true, nombre: true } } },
    });

    if (comentario.visibilidad === "CLIENTE") {
      await tx.eventoTimeline.create({
        data: {
          pedidoId: comentario.pedidoId,
          tipo: "COMENTARIO_CLIENTE",
          usuarioId: comentario.usuarioId ?? undefined,
          descripcion: comentario.contenido.slice(0, 200),
          metadata: {
            comentarioId: comentario.id,
            autor:
              comentario.autorNombre ?? comentario.usuario?.nombre ?? "Equipo",
          },
        },
      });
    }

    return comentario;
  });
}

export async function listarComentariosProduccion(pedidoId: string) {
  return prisma.comentarioProduccion.findMany({
    where: { pedidoId },
    orderBy: { createdAt: "desc" },
    include: { usuario: { select: { id: true, nombre: true } } },
  });
}

export async function crearSolicitudCambio(
  data: Prisma.SolicitudCambioUncheckedCreateInput & {
    comentarioInicial?: string;
    autor?: string;
  },
) {
  return prisma.$transaction(async (tx) => {
    const solicitud = await tx.solicitudCambio.create({
      data: {
        pedidoId: data.pedidoId,
        descripcion: data.descripcion,
        estado: data.estado,
        origen: data.origen,
        creadorPor: data.creadorPor,
      },
    });

    if (data.comentarioInicial?.trim()) {
      await tx.comentarioSolicitud.create({
        data: {
          solicitudId: solicitud.id,
          contenido: data.comentarioInicial,
          autor: data.autor ?? "Equipo Emaleli",
          origen: data.origen ?? "ADMIN",
          visibleCliente: true,
        },
      });
    }

    await tx.eventoTimeline.create({
      data: {
        pedidoId: solicitud.pedidoId,
        tipo: "SOLICITUD_CAMBIO",
        descripcion: `Solicitud de cambio ${data.origen === "CLIENTE" ? "del cliente" : "creada"}: ${data.descripcion.slice(0, 120)}`,
        metadata: {
          solicitudId: solicitud.id,
          origen: data.origen,
          estado: solicitud.estado,
        },
      },
    });

    return tx.solicitudCambio.findUnique({
      where: { id: solicitud.id },
      include: { comentarios: { orderBy: { createdAt: "asc" } } },
    });
  });
}

export async function listarSolicitudesCambio(pedidoId: string) {
  return prisma.solicitudCambio.findMany({
    where: { pedidoId },
    orderBy: { createdAt: "desc" },
    include: { comentarios: { orderBy: { createdAt: "asc" } } },
  });
}

export async function obtenerSolicitudCambio(id: string) {
  return prisma.solicitudCambio.findUnique({
    where: { id },
    include: {
      comentarios: { orderBy: { createdAt: "asc" } },
      pedido: { select: { id: true, codigo: true, clienteId: true } },
    },
  });
}

export async function actualizarEstadoSolicitudCambio(params: {
  id: string;
  estado: EstadoSolicitudCambio;
  respuestaCliente?: string;
  respuestaAt?: Date;
  resueltoAt?: Date;
}) {
  return prisma.solicitudCambio.update({
    where: { id: params.id },
    data: {
      estado: params.estado,
      respuestaCliente: params.respuestaCliente ?? undefined,
      respuestaAt: params.respuestaAt ?? undefined,
      resueltoAt: params.resueltoAt ?? undefined,
    },
    include: { comentarios: { orderBy: { createdAt: "asc" } } },
  });
}

export async function agregarComentarioSolicitud(
  data: Prisma.ComentarioSolicitudUncheckedCreateInput,
) {
  return prisma.comentarioSolicitud.create({ data });
}

export function detectarTipoMedioProduccion(
  tipoMime: string,
): TipoMedioProduccion {
  return tipoMime.startsWith("video") ? "VIDEO" : "IMAGEN";
}
