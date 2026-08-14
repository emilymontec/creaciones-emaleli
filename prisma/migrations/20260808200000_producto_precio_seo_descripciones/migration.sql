-- Fase 3.2 (Productos): precio con descuento, descripción corta/larga y SEO básico.
-- Nota: esta migración se escribió a mano porque este entorno no tiene acceso
-- de red a binaries.prisma.sh (motor de Prisma) ni a la base de datos real.
-- Verifícala/aplícala con `pnpm prisma migrate dev` (o `deploy` en prod) antes de usarla.

-- Renombrar "descripcion" -> "descripcionLarga" (conserva el contenido existente)
ALTER TABLE "Producto" RENAME COLUMN "descripcion" TO "descripcionLarga";

-- Nuevos campos
ALTER TABLE "Producto" ADD COLUMN "descripcionCorta" TEXT;
ALTER TABLE "Producto" ADD COLUMN "precioDescuento" DECIMAL(10,2);
ALTER TABLE "Producto" ADD COLUMN "seoTitulo" TEXT;
ALTER TABLE "Producto" ADD COLUMN "seoDescripcion" TEXT;
ALTER TABLE "Producto" ADD COLUMN "seoImagen" TEXT;
