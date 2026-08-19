import { prisma } from "@/src/backend/shared/prisma";
import { logger } from "@/src/shared/lib/logger";

/**
 * Registra una acción administrativa sensible (quién, qué, cuándo) en la
 * tabla `RegistroAuditoria`. Se usa en escrituras con impacto real —
 * cambios de configuración, eliminaciones, cambios de contraseña, cambios
 * de estado de pedido, registro de pagos — no en cada lectura, para no
 * generar un volumen de registros que no aporte valor.
 *
 * Nunca debe interrumpir la acción principal: si falla el registro de
 * auditoría (por ejemplo, la migración aún no se aplicó en este entorno),
 * se registra el error en el logger y la acción de negocio continúa.
 */
export async function registrarAuditoria(params: {
  usuarioId: string | null;
  usuarioNombre?: string | null;
  accion: string;
  entidad: string;
  entidadId?: string | null;
  detalle?: Record<string, unknown>;
}) {
  try {
    await prisma.registroAuditoria.create({
      data: {
        usuarioId: params.usuarioId,
        usuarioNombre: params.usuarioNombre ?? null,
        accion: params.accion,
        entidad: params.entidad,
        entidadId: params.entidadId ?? null,
        detalle: params.detalle ?? undefined,
      },
    });
  } catch (error) {
    logger.warn("No se pudo registrar la auditoría", { params, error });
  }
}
