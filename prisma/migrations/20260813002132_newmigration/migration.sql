-- CreateEnum
CREATE TYPE "TipoMedioProduccion" AS ENUM ('IMAGEN', 'VIDEO');

-- CreateEnum
CREATE TYPE "VisibilidadComentario" AS ENUM ('INTERNO', 'CLIENTE');

-- CreateEnum
CREATE TYPE "OrigenSolicitudCambio" AS ENUM ('ADMIN', 'CLIENTE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoEventoTimeline" ADD VALUE 'COMENTARIO_CLIENTE';
ALTER TYPE "TipoEventoTimeline" ADD VALUE 'SOLICITUD_CAMBIO';

-- AlterTable
ALTER TABLE "SolicitudCambio" ADD COLUMN     "creadorPor" TEXT,
ADD COLUMN     "origen" "OrigenSolicitudCambio" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN     "respuestaAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "_CombinacionVarianteToProductoVariante" ADD CONSTRAINT "_CombinacionVarianteToProductoVariante_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CombinacionVarianteToProductoVariante_AB_unique";

-- CreateTable
CREATE TABLE "ComentarioSolicitud" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "origen" "OrigenSolicitudCambio" NOT NULL,
    "visibleCliente" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComentarioSolicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProduccionAvance" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "tipo" "TipoMedioProduccion" NOT NULL,
    "url" TEXT NOT NULL,
    "nombre" TEXT,
    "titulo" TEXT,
    "descripcion" TEXT,
    "usuarioId" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visibleCliente" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProduccionAvance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComentarioProduccion" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "visibilidad" "VisibilidadComentario" NOT NULL DEFAULT 'INTERNO',
    "usuarioId" TEXT,
    "autorNombre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComentarioProduccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComentarioSolicitud_solicitudId_idx" ON "ComentarioSolicitud"("solicitudId");

-- CreateIndex
CREATE INDEX "ProduccionAvance_pedidoId_idx" ON "ProduccionAvance"("pedidoId");

-- CreateIndex
CREATE INDEX "ProduccionAvance_pedidoId_orden_idx" ON "ProduccionAvance"("pedidoId", "orden");

-- CreateIndex
CREATE INDEX "ComentarioProduccion_pedidoId_idx" ON "ComentarioProduccion"("pedidoId");

-- CreateIndex
CREATE INDEX "ComentarioProduccion_pedidoId_visibilidad_idx" ON "ComentarioProduccion"("pedidoId", "visibilidad");

-- CreateIndex
CREATE INDEX "SolicitudCambio_estado_idx" ON "SolicitudCambio"("estado");

-- AddForeignKey
ALTER TABLE "ComentarioSolicitud" ADD CONSTRAINT "ComentarioSolicitud_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudCambio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionAvance" ADD CONSTRAINT "ProduccionAvance_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionAvance" ADD CONSTRAINT "ProduccionAvance_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioProduccion" ADD CONSTRAINT "ComentarioProduccion_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioProduccion" ADD CONSTRAINT "ComentarioProduccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
