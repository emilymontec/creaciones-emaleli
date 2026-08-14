-- CreateEnum
CREATE TYPE "TipoEventoTimeline" AS ENUM ('CREACION_PEDIDO', 'CAMBIO_ESTADO', 'PAGO_REGISTRADO', 'ARCHIVO_ADJUNTO', 'ENVIO_GENERADO', 'COMENTARIO_INTERNO', 'PRODUCCION_AVANCE');

-- AlterEnum
ALTER TYPE "RolUsuario" ADD VALUE IF NOT EXISTS 'VENTAS';
ALTER TYPE "RolUsuario" ADD VALUE IF NOT EXISTS 'PRODUCCION';
ALTER TYPE "RolUsuario" ADD VALUE IF NOT EXISTS 'SOPORTE';

-- AlterTable
ALTER TABLE "Pago" ADD COLUMN IF NOT EXISTS "usuarioId" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "avatar" TEXT,
ADD COLUMN IF NOT EXISTS "cargo" TEXT,
ADD COLUMN IF NOT EXISTS "empresa" TEXT,
ADD COLUMN IF NOT EXISTS "telefono" TEXT,
ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Update existing Usuario records if any
UPDATE "Usuario" SET "username" = 'admin_' || "id" WHERE "username" IS NULL;

-- Make username NOT NULL
ALTER TABLE "Usuario" ALTER COLUMN "username" SET NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "EventoTimeline" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "tipo" "TipoEventoTimeline" NOT NULL,
    "estadoAnterior" "EstadoPedido",
    "estadoNuevo" "EstadoPedido",
    "descripcion" TEXT,
    "usuarioId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventoTimeline_pedidoId_idx" ON "EventoTimeline"("pedidoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventoTimeline_createdAt_idx" ON "EventoTimeline"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Usuario_username_key" ON "Usuario"("username");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Pago_usuarioId_fkey') THEN
        ALTER TABLE "Pago" ADD CONSTRAINT "Pago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EventoTimeline_pedidoId_fkey') THEN
        ALTER TABLE "EventoTimeline" ADD CONSTRAINT "EventoTimeline_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EventoTimeline_usuarioId_fkey') THEN
        ALTER TABLE "EventoTimeline" ADD CONSTRAINT "EventoTimeline_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
