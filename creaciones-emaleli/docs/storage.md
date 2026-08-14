# Storage — Creaciones Emaleli

Documento de la Fase 0/1 (1.3 Storage). Define buckets, políticas de acceso, convención de rutas, límites y la utilidad reutilizable de subida/borrado.

## Buckets

| Bucket                 | Acceso  | Uso                                               |
| ---------------------- | ------- | ------------------------------------------------- |
| `productos`            | Público | Imágenes de productos visibles en la tienda       |
| `pedidos-archivos`     | Privado | Archivos de referencia y de producción del pedido |
| `pedidos-comprobantes` | Privado | Comprobantes de pago                              |
| `configuracion`        | Público | Logo y banners del negocio                        |

Los nombres y políticas viven en `src/shared/constants/storage.ts` (`STORAGE_BUCKETS`, `STORAGE_POLICIES`).

## Crear buckets

Ejecutar con las credenciales del proyecto (requiere `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`):

```bash
pnpm storage:setup
```

El script crea los buckets que no existan y ajusta su bandera `public` según la política. Las políticas RLS de los buckets privados se aplican con el SQL de la sección siguiente.

## Políticas de acceso (RLS)

- **Buckets públicos** (`productos`, `configuracion`): lectura pública vía `getPublicUrl`, sin autenticación. La escritura/borrado la hace el servidor con la service role key.
- **Buckets privados** (`pedidos-archivos`, `pedidos-comprobantes`): solo lectura vía URL firmada; el acceso se otorga al rol `authenticated` (admin). La service role key ignora RLS.

SQL para aplicar en Supabase (SQL Editor) una vez exista autenticación (Fase 1.5). `pedidos-archivos`:

```sql
create policy "Lectura autenticada pedidos-archivos"
on storage.objects for select
to authenticated
using (bucket_id = 'pedidos-archivos');

create policy "Subida autenticada pedidos-archivos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'pedidos-archivos');

create policy "Borrado autenticado pedidos-archivos"
on storage.objects for delete
to authenticated
using (bucket_id = 'pedidos-archivos');
```

`pedidos-comprobantes`: mismo esquema con `bucket_id = 'pedidos-comprobantes'`.

## Convención de rutas

```
{bucket}/{entityId}/{filename}
```

| Bucket                 | Ruta                                                                     |
| ---------------------- | ------------------------------------------------------------------------ |
| `productos`            | `productos/{productoId}/{filename}`                                      |
| `pedidos-archivos`     | `pedidos-archivos/{pedidoId}/{filename}`                                 |
| `pedidos-comprobantes` | `pedidos-comprobantes/{pagoId}/{filename}`                               |
| `configuracion`        | `configuracion/{clave}/{filename}` (ej. `logo.png`, `banner-inicio.jpg`) |

El `filename` se sanitiza (caracteres seguros) en `buildStoragePath`.

## Límites de tamaño y tipos

| Bucket                 | Tamaño máx. | Tipos permitidos     |
| ---------------------- | ----------- | -------------------- |
| `productos`            | 5 MB        | JPEG, PNG, WebP      |
| `pedidos-archivos`     | 10 MB       | JPEG, PNG, WebP, PDF |
| `pedidos-comprobantes` | 5 MB        | JPEG, PNG, WebP, PDF |
| `configuracion`        | 5 MB        | JPEG, PNG, WebP      |

Definidos en `STORAGE_LIMITS` (`src/shared/constants/storage.ts`) y validados en la utilidad de subida.

## Utilidad reutilizable

`src/shared/lib/storage.ts` (server-side, usa la service role key):

- `uploadFile({ bucket, entityId, file })` — valida tipo y tamaño, sube con la ruta convenida y devuelve `{ bucket, path }`.
- `deleteFile({ bucket, path })` — borra un archivo.
- `getPublicUrl({ bucket, path })` — URL pública para buckets públicos.
- `buildStoragePath(bucket, entityId, filename)` — genera la ruta segura.

Cliente: `src/shared/lib/supabase.ts` (`getServerSupabase`, service role).
