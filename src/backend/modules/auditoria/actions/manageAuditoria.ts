"use server";

import { prisma } from "@/src/backend/shared/prisma";
import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";

export async function listarAuditoriaAction(limit = 100) {
  // El log de auditoría es información sensible de todo el panel (incluye
  // acciones de otros roles), por eso se restringe al mismo permiso que
  // los reportes de negocio (en la práctica, solo el rol ADMIN), no al
  // permiso del módulo donde ocurrió cada acción registrada.
  await requireAdmin(PERMISOS.REPORTES_VER);

  return prisma.registroAuditoria.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
