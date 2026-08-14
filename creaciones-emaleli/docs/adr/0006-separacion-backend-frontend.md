# ADR-0006: Separación explícita backend/frontend dentro de `src/`

- **Fecha:** 2026-08-07
- **Estado:** Aceptada (supera parcialmente a ADR-0001)

## Contexto

ADR-0001 organizó el código en `src/features/<dominio>/` mezclando en una
misma carpeta la UI del módulo (`components/`) y su lógica de servidor
(`actions/`, `services/`, `repositories/`, `schemas/`). Al iniciar la Fase 2
(panel administrativo + design system) se pidió una separación más clara
entre "frontend" y "backend" que la carpeta única `features/` no
comunicaba bien, sobre todo para un design system compartido por múltiples
dominios (no tiene sentido que `Button` o `Table` vivan dentro de un
dominio concreto).

Next.js App Router impone una restricción: la carpeta `app/` **debe** vivir
en la raíz del proyecto o de `src/`, y en ella conviven páginas (frontend)
y Server Actions/Route Handlers (backend). No es posible mover `app/`
dentro de una carpeta `frontend/` sin romper el framework.

## Decisión

Dentro de `src/`, además de `app/` (obligatorio ahí) se crean dos árboles:

- `src/backend/modules/<dominio>/{actions,services,repositories,schemas,lib,types}`
- `src/frontend/{components/{ui,layout,shared}, modules/<dominio>/components, providers}`

`src/shared/` se mantiene para código transversal (errores, logger,
constantes, permisos) usado por ambos lados. `src/backend/shared/` se
añade específicamente para infraestructura de solo-servidor (el singleton
de Prisma), para que nunca pueda importarse por error desde un Client
Component.

Reglas:

- Un componente de `frontend/` solo puede importar de `backend/` la
  **Action** de un módulo (nunca un `service` o `repository` directamente).
- El design system (`frontend/components/ui`) no depende de ningún dominio.
- `app/` actúa como capa de "entrada" fina: importa desde `backend/` y
  `frontend/`, pero no contiene lógica de negocio ni componentes de UI
  reutilizables propios.

## Consecuencias

- Ventajas: separación de responsabilidades más legible para un equipo que
  piensa en "frontend vs backend"; el design system deja de estar atado a
  un dominio; más fácil de auditar qué código corre solo en servidor.
- Costo: un dominio ahora toca dos carpetas en vez de una (`backend/modules/x`
  y, si tiene UI propia, `frontend/modules/x/components`); hay que mantener
  la disciplina de no importar `services`/`repositories` desde `frontend/`.
- ADR-0001 sigue vigente en cuanto a "un dominio no importa de otro
  dominio" y a la nomenclatura; queda superada solo en la ubicación de la
  UI dentro de cada dominio.
