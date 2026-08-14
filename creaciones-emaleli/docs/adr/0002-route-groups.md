# ADR-0002: Route groups `(public)` y `(admin)`

- **Fecha:** 2026-08-04
- **Estado:** Aceptada

## Contexto

La tienda pública y el panel administrativo son dominios distintos con layouts, layouts root y (en el futuro) requisitos de autenticación diferentes. Ambos conviven en `src/app/`.

## Decisión

Usar route groups de Next.js para separar los dominios sin afectar las URLs:

- `src/app/(public)/` → `/`, `/catalogo`, `/producto/[slug]`, ...
- `src/app/(admin)/admin/` → `/admin`, `/admin/productos`, ...

El segmento `(admin)` no aparece en la URL; el subdirectorio `admin` sí. Hay un root layout común (`src/app/layout.tsx`) y layouts propios por grupo.

## Consecuencias

- Los grupos no se reflejan en la URL (sin romper enlaces).
- Permite un layout distinto por dominio y protección de rutas `/admin/*` en Fase 1.
- Rutas en grupos distintos no deben resolver a la misma URL (regla de Next.js).
