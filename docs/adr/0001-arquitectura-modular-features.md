# ADR-0001: Arquitectura modular por features

- **Fecha:** 2026-08-04
- **Estado:** Aceptada

## Contexto

La aplicación tiene dominios claramente separados (catálogo, pedidos, pagos, envíos, configuración) que comparten infraestructura. Se necesita una estructura que crezca sin acoplar dominios entre sí.

## Decisión

Organizar el código en `src/features/<dominio>/` (uno por dominio) con una estructura interna fija: `actions/`, `components/`, `lib/`, `repositories/`, `schemas/`, `services/`, `types/`, `validations/`. El código reutilizable entre dominios vive en `src/shared/`.

- Un feature **no importa de otro feature** directamente.
- El estado de la ruta se resuelve en `src/app/` (layout y pages finos); la lógica vive en los features.
- Los enums y nombres en Prisma usan singular en español (`Categoria`, `ItemPedido`).

## Consecuencias

- Ventajas: aislamiento, fácil mover/eliminar dominios, nomenclatura uniforme.
- Costo: reglas de dependencia a vigilar (pueden reforzarse con ESLint/Barrelsby en el futuro).
