import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/backend/modules/auth/lib/session";
import type { SessionUser } from "@/src/backend/modules/auth/types/session";
import { requirePermission } from "@/src/shared/lib/permissions";
import type { Permiso } from "@/src/shared/constants/permissions";

/**
 * Exige una sesión de administrador válida (y, opcionalmente, un permiso
 * concreto según el rol) antes de ejecutar una Server Action.
 *
 * Las Server Actions de Next.js son endpoints HTTP invocables de forma
 * directa (no solo desde la UI protegida por el layout), por lo que cada
 * acción de escritura/lectura sensible del panel admin debe validar la
 * sesión por sí misma y no confiar únicamente en la protección de rutas a
 * nivel de layout.
 *
 * El sistema de roles (`ADMIN`, `PRODUCCION`, `VENTAS`, `SOPORTE`) define
 * permisos granulares por módulo (`src/shared/constants/permissions.ts`),
 * por lo que además de la sesión se valida que el rol del usuario tenga el
 * permiso indicado — de lo contrario cualquier usuario autenticado, sin
 * importar su rol, podría ejecutar acciones fuera de su alcance (p. ej. un
 * usuario de PRODUCCION editando la configuración de pagos).
 *
 * Si no hay sesión, redirige a /admin/login (igual que el resto del panel).
 * Si hay sesión pero el rol no tiene el permiso, lanza un AppError 403 que
 * el `catch` de cada acción ya traduce a un mensaje de error para el usuario.
 */
export async function requireAdmin(permiso?: Permiso): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (permiso) {
    requirePermission(user.rol, permiso);
  }

  return user;
}
