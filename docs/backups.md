# Backups — Creaciones Emaleli

Esta parte de la Fase 13 (Optimización) es configuración de infraestructura
en el dashboard de Supabase, no código de la aplicación — no hay ningún
archivo del repositorio que la implemente. Este documento es el checklist
a seguir manualmente en el proyecto de producción de Supabase.

## 1. Backups de base de datos (PostgreSQL)

Supabase hace backups automáticos diarios en todos los planes de pago
(Pro en adelante); el plan Free **no incluye backups automáticos**.

- [ ] Confirmar el plan del proyecto de producción (debe ser Pro o
      superior para tener backups automáticos).
- [ ] En **Database → Backups**, verificar la frecuencia (diaria en Pro)
      y la retención (7 días en Pro; ampliable con Point-in-Time
      Recovery — PITR — en planes superiores).
- [ ] Si el volumen de pedidos/pagos lo justifica, evaluar activar PITR
      (recuperación a un punto exacto en el tiempo, no solo al último
      snapshot diario) — relevante porque este proyecto maneja pagos y
      estados de pedido que no deberían perderse.
- [ ] Documentar en este archivo la fecha en que se confirmó cada punto
      anterior, para que quede trazable cuándo se revisó por última vez.

## 2. Backups de Storage (buckets)

Supabase Storage **no tiene backup automático propio** — los backups de
base de datos de Supabase respaldan las tablas (incluida la tabla interna
`storage.objects`, que son los metadatos), pero los archivos binarios en
sí requieren respaldo aparte.

Buckets críticos de este proyecto (ver `src/shared/constants/storage.ts`):

| Bucket                 | Contenido                                                    | Prioridad de backup               |
| ---------------------- | ------------------------------------------------------------ | --------------------------------- |
| `pedidos-archivos`     | Archivos de referencia subidos por el cliente en el checkout | Alta                              |
| `pedidos-comprobantes` | Comprobantes de pago                                         | **Crítica** (respaldo financiero) |
| `pedidos-facturas`     | PDFs de factura                                              | Alta                              |
| `produccion-avances`   | Fotos/videos de avance de producción                         | Media                             |
| `productos`            | Imágenes de catálogo                                         | Baja (recuperable re-subiendo)    |
| `configuracion`        | Logo y banner del inicio                                     | Baja (recuperable re-subiendo)    |

- [ ] Configurar un job periódico (ej. GitHub Actions programado, o un
      cron externo) que use `supabase storage download` o la API de
      Storage para copiar los buckets críticos (`pedidos-comprobantes`,
      `pedidos-facturas`, `pedidos-archivos`) a un almacenamiento externo
      (S3, Backblaze B2, o similar) al menos semanalmente.
- [ ] Alternativa más simple si el volumen es bajo: exportar manualmente
      los buckets críticos antes de cambios grandes (migraciones,
      actualizaciones de dependencias) y guardarlos fuera de Supabase.

## 3. Prueba periódica de restauración

Un backup que nunca se probó restaurar no es un backup confiable.

- [ ] Cada 3-6 meses, restaurar el backup más reciente de base de datos
      en un proyecto de Supabase _de prueba_ (nunca sobre producción) y
      verificar que:
  - Las migraciones de Prisma (`prisma migrate status`) coinciden con lo
    esperado.
  - Los datos de pedidos, pagos y clientes están íntegros.
  - El login de admin funciona contra los datos restaurados.
- [ ] Si se implementa el backup externo de Storage (punto 2), probar al
      menos una vez que los archivos descargados abren correctamente
      (no están corruptos) y que se pueden volver a subir al bucket
      correspondiente si hiciera falta una restauración real.

## 4. Registro de revisiones

| Fecha                             | Punto revisado | Resultado | Responsable |
| --------------------------------- | -------------- | --------- | ----------- |
| _(pendiente de primera revisión)_ | —              | —         | —           |

> Actualiza esta tabla cada vez que se revise o pruebe algo de este
> documento, para tener trazabilidad de cuándo fue la última verificación
> real (no solo la configuración teórica).
