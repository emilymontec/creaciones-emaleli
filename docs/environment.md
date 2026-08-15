# Variables de entorno — Creaciones Emaleli

Documento de la Fase 1 (1.4). Define cada variable, su propósito y cómo se configuran los entornos.

## Variables

| Variable                        | Uso                                                                                              | Dónde se usa                                   | Segura en navegador |
| ------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ------------------- |
| `DATABASE_URL`                  | Conexión a PostgreSQL **con pooling** (pgbouncer, puerto 6543). La usa Prisma Client en runtime. | App (Next.js)                                  | No aplica (server)  |
| `DIRECT_URL`                    | Conexión **directa** (puerto 5432) para migraciones de Prisma (`migrate dev`, `migrate deploy`). | CLI Prisma (`prisma.config.ts`)                | No aplica           |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto Supabase (REST + Storage).                                                      | Cliente y servidor                             | Sí                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase para peticiones del navegador (RLS).                                   | Cliente                                        | Sí                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clave de servicio (bypass RLS). Solo server-side.                                                | Server (`src/shared/lib/supabase.ts`, scripts) | **No**              |
| `SUPABASE_BUCKET_PRODUCTOS`     | Nombre del bucket de Storage para fotos de productos/categorías (galería, principal, variante). Por defecto `productos`. | Server (`src/shared/constants/storage.ts`, `pnpm storage:setup`) | No aplica (server)  |
| `NEXT_PUBLIC_APP_NAME`          | Nombre público de la marca.                                                                      | Cliente/servidor (metadata, UI)                | Sí                  |
| `NEXT_PUBLIC_APP_URL`           | URL base de la aplicación (metadata, enlaces `wa.me`).                                           | Server                                         | Sí                  |
| `AUTH_SECRET`                   | Secreto para firmar los JWT de sesión (login admin). Generar con 48 bytes aleatorios.            | Server (`src/features/auth`, `src/proxy.ts`)   | **No**              |

## Entornos

### Desarrollo

El archivo de desarrollo es `.env` (lo cargan tanto Next.js como el CLI de Prisma a través de `dotenv` en `prisma.config.ts` y `prisma/seed.ts`). Apunta a la base de datos de desarrollo/staging de Supabase.

Para overrides locales opcionales se puede crear `.env.local` (Next.js le da prioridad), pero las variables que use el CLI de Prisma (`DATABASE_URL`, `DIRECT_URL`) deben estar en `.env`.

### Producción

Las variables se definen en el proveedor de hosting (p. ej. Vercel: Settings > Environment Variables), sin commits:

- Las mismas variables de desarrollo, apuntando a la base y proyecto Supabase de producción.
- `NEXT_PUBLIC_APP_URL` = URL pública de producción.
- Aplicar migraciones antes del despliegue con `pnpm prisma migrate deploy`.

## Seguridad

- `.gitignore` ignora todos los `.env*` excepto `.env.example` (plantilla sin valores).
- `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET` y `DATABASE_URL`/`DIRECT_URL` jamás se exponen al navegador ni se registran en logs.
- Las claves del navegador usan el prefijo `NEXT_PUBLIC_` (visibles por diseño; deben ser claves sin privilegios, con RLS).

## Plantilla

Ver `.env.example` para la plantilla con placeholders.
