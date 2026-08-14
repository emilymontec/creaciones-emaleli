# ADR-0004: Prisma + PostgreSQL con driver adapter

- **Fecha:** 2026-08-04
- **Estado:** Aceptada

## Contexto

Prisma 7 requiere el uso de driver adapters y configuración vía `prisma.config.ts`. El proyecto usa PostgreSQL en Supabase.

## Decisión

- **ORM:** Prisma 7 con generator `prisma-client` (salida en `generated/prisma/`).
- **Driver adapter:** `@prisma/adapter-pg` + `pg` (pooling de Supabase vía `DATABASE_URL`).
- **Configuración CLI:** `prisma.config.ts` (schema, ruta de migraciones, comando de seed).
- **Migraciones:** `prisma migrate dev` en desarrollo, `prisma migrate deploy` en producción.
- **Seed:** `prisma/seed.ts` ejecutado con `tsx`.

## Consecuencias

- La `DATABASE_URL` debe estar disponible en runtime y para el CLI.
- El cliente generado no se edita a mano y se regenera con `prisma generate`.
- La primera migración (`0_init`) ya está versionada en `prisma/migrations/`.
