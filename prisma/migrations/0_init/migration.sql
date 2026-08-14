-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('NUEVO', 'EN_REVISION', 'ESPERANDO_CLIENTE', 'DISENO_APROBADO', 'EN_PRODUCCION', 'EMPACADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoPersonalizacion" AS ENUM ('TEXTO', 'NUMERO', 'TEXTAREA', 'LISTA', 'COLOR', 'CHECKBOX', 'ARCHIVO');

-- CreateEnum
CREATE TYPE "MetodoEnvio" AS ENUM ('RECOGER', 'DOMICILIO', 'TRANSPORTADORA');

-- CreateEnum
CREATE TYPE "EstadoProducto" AS ENUM ('ACTIVO', 'INACTIVO', 'AGOTADO');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('ANTICIPO', 'ABONO', 'PAGO_FINAL');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('PENDIENTE', 'EMITIDA', 'ANULADA');

-- CreateEnum
CREATE TYPE "EstadoGuia" AS ENUM ('GENERADA', 'EN_TRANSITO', 'ENTREGADA', 'DEVUELTA');

-- CreateEnum
CREATE TYPE "OrigenArchivo" AS ENUM ('CLIENTE', 'PRODUCCION');

-- CreateEnum
CREATE TYPE "EstadoSolicitudCambio" AS ENUM ('ABIERTA', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'CERRADA');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'ADMIN',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioBase" DECIMAL(10,2) NOT NULL,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "estado" "EstadoProducto" NOT NULL DEFAULT 'ACTIVO',
    "tiempoProduccion" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoImagen" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductoImagen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoVariante" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "precioExtra" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductoVariante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personalizacion" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoPersonalizacion" NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT false,
    "opciones" JSONB,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Personalizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT,
    "empresa" TEXT,
    "ciudad" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'NUEVO',
    "metodoEnvio" "MetodoEnvio" NOT NULL DEFAULT 'RECOGER',
    "total" DECIMAL(10,2) NOT NULL,
    "saldoPendiente" DECIMAL(10,2) NOT NULL,
    "ciudad" TEXT NOT NULL,
    "direccion" TEXT,
    "observaciones" TEXT,
    "tokenSeguimiento" TEXT NOT NULL,
    "fechaPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT,
    "varianteId" TEXT,
    "nombreProducto" TEXT NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "personalizaciones" JSONB,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "tipo" "TipoPago" NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodo" TEXT NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Envio" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "metodo" "MetodoEnvio" NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT,
    "destinatario" TEXT,
    "documento" TEXT,
    "telefono" TEXT,
    "numeroGuia" TEXT,
    "estadoGuia" "EstadoGuia",
    "fechaDespacho" TIMESTAMP(3),
    "fechaEntrega" TIMESTAMP(3),
    "enlaceRastreo" TEXT,

    CONSTRAINT "Envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivoAdjunto" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT,
    "pagoId" TEXT,
    "origen" "OrigenArchivo" NOT NULL DEFAULT 'CLIENTE',
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nombre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchivoAdjunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudCambio" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoSolicitudCambio" NOT NULL DEFAULT 'ABIERTA',
    "respuestaCliente" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resueltoAt" TIMESTAMP(3),

    CONSTRAINT "SolicitudCambio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoriaToProducto" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoriaToProducto_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_slug_key" ON "Producto"("slug");

-- CreateIndex
CREATE INDEX "Producto_estado_idx" ON "Producto"("estado");

-- CreateIndex
CREATE INDEX "ProductoImagen_productoId_idx" ON "ProductoImagen"("productoId");

-- CreateIndex
CREATE INDEX "ProductoVariante_productoId_idx" ON "ProductoVariante"("productoId");

-- CreateIndex
CREATE INDEX "Personalizacion_productoId_idx" ON "Personalizacion"("productoId");

-- CreateIndex
CREATE INDEX "Cliente_ciudad_idx" ON "Cliente"("ciudad");

-- CreateIndex
CREATE INDEX "Cliente_whatsapp_idx" ON "Cliente"("whatsapp");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_codigo_key" ON "Pedido"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_tokenSeguimiento_key" ON "Pedido"("tokenSeguimiento");

-- CreateIndex
CREATE INDEX "Pedido_ciudad_idx" ON "Pedido"("ciudad");

-- CreateIndex
CREATE INDEX "Pedido_estado_idx" ON "Pedido"("estado");

-- CreateIndex
CREATE INDEX "Pedido_clienteId_idx" ON "Pedido"("clienteId");

-- CreateIndex
CREATE INDEX "ItemPedido_pedidoId_idx" ON "ItemPedido"("pedidoId");

-- CreateIndex
CREATE INDEX "ItemPedido_productoId_idx" ON "ItemPedido"("productoId");

-- CreateIndex
CREATE INDEX "Pago_pedidoId_idx" ON "Pago"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "Envio_numeroGuia_key" ON "Envio"("numeroGuia");

-- CreateIndex
CREATE INDEX "Envio_pedidoId_idx" ON "Envio"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "ArchivoAdjunto_pagoId_key" ON "ArchivoAdjunto"("pagoId");

-- CreateIndex
CREATE INDEX "ArchivoAdjunto_pedidoId_idx" ON "ArchivoAdjunto"("pedidoId");

-- CreateIndex
CREATE INDEX "SolicitudCambio_pedidoId_idx" ON "SolicitudCambio"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracion_clave_key" ON "Configuracion"("clave");

-- CreateIndex
CREATE INDEX "_CategoriaToProducto_B_index" ON "_CategoriaToProducto"("B");

-- AddForeignKey
ALTER TABLE "ProductoImagen" ADD CONSTRAINT "ProductoImagen_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoVariante" ADD CONSTRAINT "ProductoVariante_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personalizacion" ADD CONSTRAINT "Personalizacion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "ProductoVariante"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Envio" ADD CONSTRAINT "Envio_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivoAdjunto" ADD CONSTRAINT "ArchivoAdjunto_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivoAdjunto" ADD CONSTRAINT "ArchivoAdjunto_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudCambio" ADD CONSTRAINT "SolicitudCambio_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToProducto" ADD CONSTRAINT "_CategoriaToProducto_A_fkey" FOREIGN KEY ("A") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToProducto" ADD CONSTRAINT "_CategoriaToProducto_B_fkey" FOREIGN KEY ("B") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
