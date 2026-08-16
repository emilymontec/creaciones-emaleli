-- ============================================================
-- FASE 9 — Pagos y Facturación
-- Nuevos campos en Pago, migración de relación de comprobantes,
-- y creación de tabla Factura.
-- ============================================================

-- AlterTable: Pago gana notas y comprobanteId (nueva FK a ArchivoAdjunto)
ALTER TABLE "Pago" ADD COLUMN IF NOT EXISTS "notas" TEXT;
ALTER TABLE "Pago" ADD COLUMN IF NOT EXISTS "comprobanteId" TEXT;

-- Migración de datos: pasamos la relación desde ArchivoAdjunto.pagoId → Pago.comprobanteId
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ArchivoAdjunto' AND column_name = 'pagoId'
    ) THEN
        UPDATE "Pago" p
        SET "comprobanteId" = a."id"
        FROM "ArchivoAdjunto" a
        WHERE a."pagoId" = p."id"
          AND p."comprobanteId" IS NULL;
    END IF;
END $$;

-- DropIndex y DropForeignKey de la vieja relación (ArchivoAdjunto.pagoId)
DROP INDEX IF EXISTS "ArchivoAdjunto_pagoId_key";

ALTER TABLE "ArchivoAdjunto" DROP CONSTRAINT IF EXISTS "ArchivoAdjunto_pagoId_fkey";
ALTER TABLE "ArchivoAdjunto" DROP COLUMN IF EXISTS "pagoId";

-- CreateIndex + AddForeignKey para la nueva relación (Pago.comprobanteId)
CREATE UNIQUE INDEX IF NOT EXISTS "Pago_comprobanteId_key" ON "Pago"("comprobanteId");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Pago_comprobanteId_fkey') THEN
        ALTER TABLE "Pago"
            ADD CONSTRAINT "Pago_comprobanteId_fkey"
            FOREIGN KEY ("comprobanteId")
            REFERENCES "ArchivoAdjunto"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: Factura
CREATE TABLE IF NOT EXISTS "Factura" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "numero" TEXT,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'PENDIENTE',
    "urlPdf" TEXT,
    "fechaEmision" TIMESTAMP(3),
    "fechaAnulacion" TIMESTAMP(3),
    "notas" TEXT,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Factura
CREATE UNIQUE INDEX IF NOT EXISTS "Factura_pedidoId_key" ON "Factura"("pedidoId");
CREATE UNIQUE INDEX IF NOT EXISTS "Factura_numero_key" ON "Factura"("numero");
CREATE INDEX IF NOT EXISTS "Factura_estado_idx" ON "Factura"("estado");

-- AddForeignKey: Factura → Pedido
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Factura_pedidoId_fkey') THEN
        ALTER TABLE "Factura"
            ADD CONSTRAINT "Factura_pedidoId_fkey"
            FOREIGN KEY ("pedidoId")
            REFERENCES "Pedido"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Factura → Usuario
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Factura_usuarioId_fkey') THEN
        ALTER TABLE "Factura"
            ADD CONSTRAINT "Factura_usuarioId_fkey"
            FOREIGN KEY ("usuarioId")
            REFERENCES "Usuario"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
