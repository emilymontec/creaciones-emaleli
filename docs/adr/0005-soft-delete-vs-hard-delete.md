# ADR-0005: Estrategia de soft-delete vs hard-delete

- **Fecha:** 2026-08-04
- **Estado:** Aceptada

## Contexto

Los pedidos, clientes y productos forman historiales (facturación, seguimiento, reportes). Eliminarlos físicamente rompería trazabilidad.

## Decisión

- **Soft-delete** para entidades de historial: `Usuario.activo`, `Categoria.activo`, `Producto.estado`, `ProductoVariante.activo`, `Personalizacion.activo`, `Cliente.activo`, `Pedido.estado` (`CANCELADO`).
- **Hard-delete** para transitorios y dependientes: `ProductoImagen`, `ItemPedido`, `Pago`, `Envio`, `ArchivoAdjunto`, `SolicitudCambio`, `Configuracion`.
- Las claves foráneas del historial usan `ON DELETE RESTRICT`; las referencias snapshot usan `SET NULL` (`ItemPedido.producto`, `ItemPedido.variante`).

## Consecuencias

- Las consultas de catálogo deben filtrar por `activo`/`estado`.
- El borrado lógico conserva integridad y auditoría.
- Detalle por entidad documentado en [../database.md](../database.md).
