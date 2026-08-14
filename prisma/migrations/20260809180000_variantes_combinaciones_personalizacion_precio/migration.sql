-- Fase 3.4 (Variantes) y 3.5 (Personalizaciones).
-- Escrita a mano: este entorno no tiene acceso de red a binaries.prisma.sh
-- ni a la base de datos real. Verifícala/aplícala con `pnpm prisma migrate dev`
-- (o `deploy` en prod) antes de usarla.

-- ProductoVariante: imagen opcional por opción (ej. por color) + orden de visualización
ALTER TABLE "ProductoVariante" ADD COLUMN "imagen" TEXT;
ALTER TABLE "ProductoVariante" ADD COLUMN "orden" INTEGER NOT NULL DEFAULT 0;

-- Nueva tabla: combinación de variantes (matriz talla x color, etc.) con
-- stock/precio propios, opcional (si no se define precio se usa el del
-- producto + suma de precioExtra de cada opción).
CREATE TABLE "CombinacionVariante" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "sku" TEXT,
    "precio" DECIMAL(10,2),
    "stock" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CombinacionVariante_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CombinacionVariante_productoId_idx" ON "CombinacionVariante"("productoId");

ALTER TABLE "CombinacionVariante"
  ADD CONSTRAINT "CombinacionVariante_productoId_fkey"
  FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Tabla implícita M2M generada por Prisma para
-- CombinacionVariante.opciones <-> ProductoVariante.combinaciones
CREATE TABLE "_CombinacionVarianteToProductoVariante" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_CombinacionVarianteToProductoVariante_AB_unique"
  ON "_CombinacionVarianteToProductoVariante"("A", "B");
CREATE INDEX "_CombinacionVarianteToProductoVariante_B_index"
  ON "_CombinacionVarianteToProductoVariante"("B");

ALTER TABLE "_CombinacionVarianteToProductoVariante"
  ADD CONSTRAINT "_CombinacionVarianteToProductoVariante_A_fkey"
  FOREIGN KEY ("A") REFERENCES "CombinacionVariante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CombinacionVarianteToProductoVariante"
  ADD CONSTRAINT "_CombinacionVarianteToProductoVariante_B_fkey"
  FOREIGN KEY ("B") REFERENCES "ProductoVariante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Personalizacion: precio adicional plano (para tipos simples como
-- CHECKBOX o ARCHIVO). Las opciones de tipo LISTA guardan su propio
-- precioExtra por opción dentro del campo JSON "opciones".
ALTER TABLE "Personalizacion" ADD COLUMN "precioExtra" DECIMAL(10,2);
