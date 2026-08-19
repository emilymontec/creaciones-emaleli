-- ============================================================
-- FASE 13 — Optimización / Seguridad
-- Registro de auditoría de acciones administrativas sensibles.
-- ============================================================

CREATE TABLE IF NOT EXISTS "RegistroAuditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "usuarioNombre" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "detalle" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroAuditoria_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RegistroAuditoria_entidad_entidadId_idx"
    ON "RegistroAuditoria"("entidad", "entidadId");

CREATE INDEX IF NOT EXISTS "RegistroAuditoria_usuarioId_idx"
    ON "RegistroAuditoria"("usuarioId");

CREATE INDEX IF NOT EXISTS "RegistroAuditoria_createdAt_idx"
    ON "RegistroAuditoria"("createdAt");
