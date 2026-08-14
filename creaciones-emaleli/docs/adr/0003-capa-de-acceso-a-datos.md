# ADR-0003: Capa de acceso a datos separada de la UI

- **Fecha:** 2026-08-04
- **Estado:** Aceptada

## Contexto

El acceso a datos debe ser testeable y reutilizable, y la UI no debe conocer los detalles de Prisma. Además, Prisma 7 requiere driver adapters y el cliente se genera en una ruta propia.

## Decisión

En cada feature: **UI → Action → Service → Repository → DB**.

- `repositories/`: únicamente consultas Prisma (CRUD) sobre el modelo del dominio.
- `services/`: lógica de negocio y reglas (validar slug, calcular totales, transiciones de estado).
- `actions/`: Server Actions que validan con Zod y orquestan servicios, devolviendo estado plano.
- `components/`: sin importar Prisma ni ejecutar consultas.

El cliente Prisma se instancia una sola vez (`src/features/categorias/lib/prisma.ts`, patrón global singleton con `PrismaPg`).

## Consecuencias

- Cambios de esquema/ORM se limitan a `repositories/` y `lib/prisma.ts`.
- La UI se puede probar con mocks de servicios.
- Costo: más archivos; se evita con convención estricta en cada feature.
