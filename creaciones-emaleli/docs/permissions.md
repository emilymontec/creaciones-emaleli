# Permisos y roles — Creaciones Emaleli

Documento de la Fase 1 (1.6). Define el modelo de roles y permisos, el guard reutilizable y cómo añadir roles futuros.

## Roles actuales

| Rol     | Estado en BD                                | Permisos                         |
| ------- | ------------------------------------------- | -------------------------------- |
| `ADMIN` | `enum RolUsuario` en `prisma/schema.prisma` | Acceso total: todos los permisos |

El único rol activo en la base de datos es `ADMIN`. Los roles de abajo están **planificados**: para activarlos hay que añadirlos al `enum RolUsuario` (Prisma), generar la migración (`pnpm prisma migrate dev`) y asignarlos a usuarios.

## Roles futuros (planificados)

| Rol          | Permisos previstos                               |
| ------------ | ------------------------------------------------ |
| `PRODUCCION` | Gestionar pedidos, gestionar envíos              |
| `VENTAS`     | Gestionar pedidos, pagos y envíos                |
| `SOPORTE`    | Gestionar pedidos (consulta/atención al cliente) |

## Registro de permisos

Los permisos son cadenas semánticas definidas en `src/shared/constants/permissions.ts`:

- `catalogo.gestionar`
- `pedidos.gestionar`
- `pagos.gestionar`
- `envios.gestionar`
- `configuracion.gestionar`
- `reportes.ver`
- `usuarios.gestionar`

Cada rol mapea a un subconjunto (`PERMISOS_POR_ROL`). `ADMIN` usa `Object.values(PERMISOS)`, así un permiso nuevo queda disponible automáticamente para el admin.

## Guard reutilizable

`src/shared/lib/permissions.ts` expone:

- `hasPermission(rol, permiso)` → `boolean`.
- `requirePermission(rol, permiso)` → lanza `AppError` con `statusCode: 403` y `code: "FORBIDDEN"` si no tiene el permiso.

Uso en server actions y servicios:

```ts
import { requirePermission } from "@/src/shared/lib/permissions";
import { PERMISOS } from "@/src/shared/constants/permissions";
import { getSessionUser } from "@/src/features/auth/lib/session";

const user = await getSessionUser();
requirePermission(user?.rol ?? "", PERMISOS.PEDIDOS_GESTIONAR);
```

## Protección de rutas

- `src/proxy.ts` (convención de Next 16, sustituye a `middleware`): protege `/admin/*` y redirige a `/admin/login` si la sesión JWT no es válida. `/admin/login` queda exento.
- `src/app/(admin)/admin/(panel)/layout.tsx`: guard de defensa adicional; sin sesión redirige a `/admin/login`.
- La sesión se valida contra el JWT firmado con `AUTH_SECRET` (no se consulta la BD en cada request).

## Añadir un rol futuro

1. Añadir el valor al `enum RolUsuario` en `prisma/schema.prisma`.
2. Generar y aplicar la migración: `pnpm prisma migrate dev`.
3. Registrar el rol en `PERMISOS_POR_ROL` de `src/shared/constants/permissions.ts` con sus permisos.
4. Asignar el rol a usuarios (script/seed o gestión de usuarios en una fase posterior).
