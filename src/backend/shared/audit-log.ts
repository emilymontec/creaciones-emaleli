import { Prisma } from "@prisma/client";
import { prisma } from "@/src/backend/shared/prisma";
import { logger } from "@/src/shared/lib/logger";

type DetalleAuditoria =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | null
  | DetalleAuditoria[];

export async function registrarAuditoria(params: {
  usuarioId: string | null;
  usuarioNombre?: string | null;
  accion: string;
  entidad: string;
  entidadId?: string | null;
  detalle?: DetalleAuditoria;
}) {
  try {
    const detalle = params.detalle as Prisma.InputJsonValue | undefined;
    await prisma.registroAuditoria.create({
      data: {
        usuarioId: params.usuarioId,
        usuarioNombre: params.usuarioNombre ?? null,
        accion: params.accion,
        entidad: params.entidad,
        entidadId: params.entidadId ?? null,
        detalle: detalle ?? Prisma.JsonNull,
      },
    });
  } catch (error) {
    logger.warn("No se pudo registrar la auditoría", { params, error });
  }
}
