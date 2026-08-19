# Despliegue en Vercel — Creaciones Emaleli

Checklist paso a paso para desplegar el proyecto en Vercel. Para el
detalle de cada variable de entorno ver `docs/environment.md`.

## 1. Antes de desplegar

- [ ] `pnpm lint` sin errores (warnings menores son aceptables).
- [ ] `pnpm build` corre localmente sin errores (requiere `prisma generate`
      ya ejecutado — lo dispara `postinstall` automáticamente).
- [ ] Migraciones de Prisma aplicadas y probadas contra la base de
      desarrollo/staging de Supabase (`pnpm prisma migrate dev`).
- [ ] `.env` **no** está commiteado (verificar `.gitignore`).
- [ ] Bucket de Storage creado en el proyecto de Supabase de producción
      (`pnpm storage:setup` apuntando a las credenciales de producción).

## 2. Crear el proyecto en Vercel

1. Importar el repositorio de Git en Vercel (New Project).
2. Framework: Vercel detecta **Next.js** automáticamente (confirmado en
   `vercel.json`).
3. Build & Development Settings:
   - Install Command: `pnpm install` (ya definido en `vercel.json`).
   - Build Command: `pnpm run vercel-build` — este script ejecuta
     `prisma migrate deploy && next build`, es decir, **aplica las
     migraciones pendientes antes de compilar**. No usar el `build`
     genérico (`next build` a secas) como Build Command en Vercel.
   - Output Directory: por defecto (`.next`), no cambiar.

## 3. Variables de entorno en Vercel

En **Settings → Environment Variables**, agregar (para los 3 entornos:
Production, Preview y Development si aplica):

| Variable                        | Notas                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                  | Connection string **con pooling** (puerto 6543) del proyecto de producción de Supabase.                                |
| `DIRECT_URL`                    | Connection string **directa** (puerto 5432) — la usa `prisma migrate deploy` durante el build.                         |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto de producción.                                                                                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima del proyecto de producción.                                                                              |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clave de servicio — **marcar como "Sensitive"** en Vercel, nunca exponerla en el navegador.                            |
| `SUPABASE_BUCKET_PRODUCTOS`     | `productos` (o el nombre que se haya usado en `storage:setup`).                                                        |
| `NEXT_PUBLIC_APP_NAME`          | `Emaleli` (o el nombre público que corresponda).                                                                       |
| `NEXT_PUBLIC_APP_URL`           | URL pública final (ej. `https://creaciones-emaleli.vercel.app` o el dominio propio).                                   |
| `NEXT_PUBLIC_EMPRESA_WHATSAPP`  | Número de WhatsApp de la empresa, formato internacional sin `+`.                                                       |
| `AUTH_SECRET`                   | Generar uno **distinto** al de desarrollo: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |

⚠️ No reutilizar el `AUTH_SECRET` de desarrollo en producción: invalidaría
la separación de sesiones entre entornos y es una mala práctica de
seguridad (rotar secretos por entorno).

## 4. Primer despliegue

1. Disparar el deploy (push a la rama configurada, o "Deploy" manual desde
   el dashboard).
2. Verificar en los logs de build que:
   - `prisma migrate deploy` se ejecutó sin errores.
   - `next build` terminó exitosamente (sin errores de tipos).
3. Una vez desplegado, entrar a `/admin/login` y confirmar que el login
   funciona contra la base de datos de producción.
4. Probar el flujo público completo una vez: catálogo → producto →
   carrito → checkout → confirmación con enlace de WhatsApp.
5. Probar el enlace de seguimiento público (`/seguimiento/[token]`) del
   pedido de prueba recién creado.

## 5. Después del primer despliegue

- [ ] Configurar dominio propio en **Settings → Domains** si aplica, y
      actualizar `NEXT_PUBLIC_APP_URL` a ese dominio.
- [ ] Revisar **Settings → Functions** si algún flujo de subida de
      archivos grandes (fotos/videos de producción) se acerca al límite de
      tamaño de body de las funciones — ya configurado en 50 MB en
      `next.config.ts`, pero el plan de Vercel puede imponer un tope menor
      (Hobby: 4.5 MB reales de payload independientemente de esta config;
      revisar el plan contratado antes de asumir que 50 MB funcionará).
- [ ] Confirmar que las cabeceras de seguridad (CSP, HSTS, etc. definidas
      en `next.config.ts`) no bloquean ningún recurso real en producción
      (revisar la consola del navegador tras el primer deploy).
- [ ] Configurar backups automáticos de la base de datos y del bucket de
      Storage en el dashboard de Supabase (pendiente, ver
      `AUDITORIA-2026-08.md`).

## 6. Notas del entorno de desarrollo (Windows)

El workaround de instalación con `--ignore-scripts` documentado en
`docs/environment.md` es solo para desarrollo local en Windows/PowerShell.
**No aplica a Vercel**: el build de Vercel corre en Linux y no tiene los
problemas de scripts de postinstall que se dan en PowerShell, así que el
Install Command estándar (`pnpm install`) funciona sin modificaciones.
