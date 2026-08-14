# Arquitectura — Creaciones Emaleli

Documento de arquitectura de la Fase 0. Define estructura, convenciones y decisiones técnicas del proyecto.

> **Actualizado en la revisión de Fase 2:** la carpeta de dominios pasó de
> `src/features/<dominio>/` (todo mezclado: UI + lógica de servidor en un
> mismo árbol) a una separación explícita **backend / frontend** dentro de
> `src/`. El motivo: Next.js App Router obliga a que `app/` viva en la raíz
> de `src/` (no se puede mover dentro de `frontend/` o `backend/`), así que
> `app/` sigue siendo el punto de entrada tanto de páginas como de Server
> Actions/Route Handlers — pero todo el **código** de negocio y de
> presentación de cada módulo ahora está separado con claridad, con un
> patrón inspirado en la modularidad de Nest.js (`module → service →
> repository → schema`) adaptado a Server Actions de Next.js.

## Stack

- **Frontend/Backend:** Next.js (App Router) + TypeScript
- **ORM:** Prisma 7 (driver adapter `PrismaPg`)
- **Base de datos:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage (Fase 1)
- **Estilos:** Tailwind CSS v4
- **Autenticación:** sesión propia (JWT firmado) — ver `src/backend/modules/auth`

## Estructura de carpetas

```txt
emaleli/
├── src/
│   ├── app/                        # Rutas (App Router) — obligatorio en esta ubicación por Next.js
│   │   ├── layout.tsx              # Root layout (html/body, fuente puente)
│   │   ├── globals.css             # Tokens de diseño + entrada de Tailwind
│   │   ├── (public)/               # Route group: tienda pública
│   │   ├── (admin)/                # Route group: panel administrativo
│   │   │   └── admin/
│   │   │       ├── login/          # Ruta pública de login
│   │   │       └── (panel)/        # Rutas protegidas (requieren sesión)
│   │   └── api/                    # Route handlers (si aplica)
│   │
│   ├── backend/                    # Toda la lógica de servidor, por módulo de dominio
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── actions/        # Server Actions ("use server")
│   │   │   │   ├── services/       # Lógica de negocio
│   │   │   │   ├── repositories/   # Acceso a datos (Prisma)
│   │   │   │   ├── schemas/        # Validación (Zod)
│   │   │   │   ├── lib/            # Utilidades internas (hash, JWT, sesión)
│   │   │   │   └── types/
│   │   │   └── categorias/         # (mismo patrón; futuro: productos, pedidos, pagos...)
│   │   └── shared/                 # prisma.ts (singleton del cliente) y utilidades de servidor
│   │
│   ├── frontend/                   # Toda la capa de presentación (Client/Server Components de UI)
│   │   ├── components/
│   │   │   ├── ui/                 # Design system interno (Button, Input, Modal, Table...)
│   │   │   ├── layout/             # AdminShell, AdminSidebar, AdminTopbar, AdminBreadcrumb, AdminFooter
│   │   │   └── shared/             # PageHeader y otros compartidos entre módulos
│   │   ├── modules/
│   │   │   ├── auth/components/    # LoginForm
│   │   │   └── categorias/components/  # CategoryForm, NewCategoryButton
│   │   └── providers/              # ToastProvider, etc.
│   │
│   └── shared/                     # Código transversal usado por backend Y frontend
│       ├── constants/              # permissions.ts, storage.ts
│       ├── lib/                    # errors.ts, logger.ts, supabase.ts, permissions.ts, storage.ts
│       └── ...
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/                 # Migraciones SQL versionadas
│   └── seed.ts                     # Datos iniciales de prueba
├── generated/prisma/               # Cliente Prisma generado (no editar, no versionado)
├── public/
│   ├── brand/                      # Logo y paleta oficial
│   └── fonts/                      # Heroik / Qlassik (.woff2) — a incorporar por el equipo de marca
└── docs/
    ├── architecture.md
    ├── design-system.md            # Props de cada componente del design system
    ├── ui-styleguide.md
    ├── database.md
    ├── erd.md
    └── adr/                        # Registro de decisiones de arquitectura
```

**Por qué no un monorepo `backend/` + `frontend/` en el sentido clásico:** Next.js App Router es full-stack por diseño — una misma Server Action vive "en el backend" en tiempo de ejecución pero se importa desde un Client Component "del frontend". Separar `src/backend` y `src/frontend` a nivel de **código y responsabilidad** (dónde vive la lógica de negocio vs. dónde vive la presentación) logra el mismo objetivo de claridad que pedías sin pelear contra las convenciones del framework, que exige `app/` en la raíz de `src/`.

## Módulos de dominio

Cada dominio vive en `src/backend/modules/<dominio>/` (lógica) + `src/frontend/modules/<dominio>/components/` (UI propia del módulo, si la necesita) y **no importa de otro módulo directamente**; comparte infraestructura a través de `src/shared/` (transversal) o `src/backend/shared/` (solo servidor, ej. el cliente Prisma).

| Dominio        | Backend                          | Frontend                                   | Estado |
|----------------|-----------------------------------|---------------------------------------------|--------|
| Auth           | `backend/modules/auth`            | `frontend/modules/auth/components`           | Activo |
| Catálogo       | `backend/modules/categorias`      | `frontend/modules/categorias/components`     | Activo |
| Productos      | `backend/modules/productos`       | `frontend/modules/productos/components`      | Fase 3 |
| Pedidos        | `backend/modules/pedidos`         | `frontend/modules/pedidos/components`        | Fases 6-7 |
| Pagos          | `backend/modules/pagos`           | `frontend/modules/pagos/components`          | Fase 9 |
| Envíos         | `backend/modules/envios`          | `frontend/modules/envios/components`         | Fase 10 |
| Configuración  | `backend/modules/configuracion`   | `frontend/modules/configuracion/components`  | Fase 11 |
| Clientes       | `backend/modules/clientes`        | `frontend/modules/clientes/components`       | Fases 6-7 |

## Capas dentro de un módulo backend

1. **Acciones** (`actions/`): Server Actions, validan entrada y orquestan el servicio.
2. **Servicios** (`services/`): lógica de negocio y reglas de dominio.
3. **Repositorios** (`repositories/`): acceso a datos vía Prisma.
4. **Esquemas** (`schemas/`): validación de entrada (Zod).

Flujo de una operación: `Action → Service → Repository → DB`. La UI (`frontend/`) solo conoce la Action (nunca importa un repository o servicio directamente).

## Convención de nombres

| Elemento              | Convención            | Ejemplo                          |
|-----------------------|-----------------------|----------------------------------|
| Archivos de módulo    | `kebab-case.ts/.tsx`  | `createCategory.ts`, `Button.tsx`|
| Componentes React     | `PascalCase.tsx`      | `CategoryForm.tsx`, `PageHeader` |
| Funciones             | `camelCase`           | `createCategory`, `findAll`      |
| Constantes            | `UPPER_SNAKE_CASE`    | `MAX_FILE_SIZE`                  |
| Variables de entorno  | `UPPER_SNAKE_CASE`    | `DATABASE_URL`                   |
| Variables cliente     | `NEXT_PUBLIC_*`       | `NEXT_PUBLIC_APP_URL`            |
| Enums Prisma          | `PascalCase`          | `EstadoPedido`                   |
| Valores de enums      | `UPPER_SNAKE_CASE`    | `EN_PRODUCCION`                  |
| Route groups          | `(dominio)`           | `(public)`, `(admin)`            |
| Tabla en Prisma       | `PascalCase` singular | `Categoria`, `ItemPedido`        |

## Manejo de errores y logging

- **Errores de negocio:** `AppError` (`src/shared/lib/errors.ts`) con `statusCode` y `code` legibles.
- **Server Actions:** retornan estado `{ success, message?, errors? }`; nunca propagan el stack al cliente.
- **Repositorios/Servicios:** pueden lanzar `AppError`; las capas superiores lo traducen.
- **Logging:** `logger` (`src/shared/lib/logger.ts`), JSON estructurado; en producción se ocultan los `debug`.
- **Datos sensibles:** nunca registrar contraseñas, tokens o datos personales.

## Verificación de calidad

```bash
pnpm lint              # ESLint
pnpm exec tsc --noEmit # TypeScript
pnpm build             # Build de producción
```
