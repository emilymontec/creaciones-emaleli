# Base de datos — Creaciones Emaleli

Modelo de datos de la Fase 0. Esquema fuente: `prisma/schema.prisma`.

## Modelos

| Modelo           | Relación destacada        | Cardinalidad |
|------------------|---------------------------|--------------|
| `Usuario`        | —                         | —            |
| `Categoria`      | → `Producto`              | 1-N          |
| `Producto`       | → `Categoria`             | N-N          |
| `ProductoImagen` | → `Producto`              | N-1          |
| `ProductoVariante` | → `Producto`            | N-1          |
| `Personalizacion`| → `Producto`              | N-1          |
| `Cliente`        | → `Pedido`                | 1-N          |
| `Pedido`         | → `ItemPedido`, `Pago`, `Envio`, `ArchivoAdjunto`, `SolicitudCambio` | 1-N |
| `ItemPedido`     | → `Producto`, `ProductoVariante` (opcional) | N-1 |
| `Pago`           | → `ArchivoAdjunto` (comprobante) | 1-1 |
| `Envio`          | → `Pedido`                | N-1 |
| `ArchivoAdjunto` | → `Pedido`, `Pago`        | N-1 / 1-1 |
| `SolicitudCambio`| → `Pedido`                | N-1 |
| `Configuracion`  | —                         | —            |

Ver diagrama completo en [erd.md](./erd.md).

## Soft-delete vs hard-delete

| Entidad            | Estrategia    | Campo                      | Motivo |
|--------------------|---------------|----------------------------|--------|
| `Usuario`          | Soft-delete   | `activo` (bool)            | Preservar auditoría de acciones |
| `Categoria`        | Soft-delete   | `activo` (bool)            | No romper productos asociados |
| `Producto`         | Soft-delete   | `estado` (`EstadoProducto`) | El catálogo usa estados de visibilidad |
| `ProductoImagen`   | Hard-delete   | —                          | Dependencia directa del producto |
| `ProductoVariante` | Soft-delete   | `activo` (bool)            | Historial de ventas |
| `Personalizacion`  | Soft-delete   | `activo` (bool)            | Pedidos históricos la referencian |
| `Cliente`          | Soft-delete   | `activo` (bool)            | Historial de pedidos |
| `Pedido`           | Soft-delete   | `estado` (`CANCELADO`)     | Trazabilidad completa |
| `ItemPedido`       | Hard-delete   | —                          | Se elimina junto al pedido (restrict) |
| `Pago`             | Hard-delete   | —                          | Se elimina junto al pedido (restrict) |
| `Envio`            | Hard-delete   | —                          | Se elimina junto al pedido (restrict) |
| `ArchivoAdjunto`   | Hard-delete   | —                          | Referencia a Storage |
| `SolicitudCambio`  | Hard-delete   | —                          | Dependencia del pedido |
| `Configuracion`    | Hard-delete   | —                          | Dato de configuración |

Regla general: **se soft-deletea todo lo que aparece en historiales o facturación; se hard-deletea lo transitorio o dependiente**. Las claves foráneas usan `ON DELETE RESTRICT` (proteger historial) salvo referencias snapshots (`SET NULL`).

## Índices y claves únicas

Índices para búsquedas frecuentes:

- `Producto.estado` (visibilidad)
- `Pedido.ciudad`, `Pedido.estado`, `Pedido.clienteId`
- `Cliente.ciudad`, `Cliente.whatsapp`
- FK: `productoId`, `pedidoId` en tablas hijas

Claves únicas:

- `Categoria.slug`, `Producto.slug`
- `Pedido.codigo`, `Pedido.tokenSeguimiento`
- `Envio.numeroGuia`
- `Usuario.email`, `Configuracion.clave`

## Migraciones

- **Desarrollo:** `pnpm exec prisma migrate dev --name <descripcion>` — crea y aplica la migración.
- **Producción/CI:** `pnpm exec prisma migrate deploy` — aplica migraciones pendientes.
- **Primera migración:** ya versionada en `prisma/migrations/0_init/`.

```bash
pnpm exec prisma migrate status   # estado de migraciones
pnpm exec prisma migrate dev      # nueva migración en dev
pnpm exec prisma migrate deploy   # aplicar en prod
```

## Seed

Script: `prisma/seed.ts` (ejecutado con `tsx`).

```bash
pnpm exec prisma db seed
```

Crea: usuario administrador, categorías demo, producto demo con variantes/personalizaciones/imagen y configuración base. Es **idempotente** (usa `upsert`).
