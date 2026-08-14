import { AppError } from "@/src/shared/lib/errors";
import {
  permisosDeRol,
  type Permiso,
  type Rol,
} from "@/src/shared/constants/permissions";

export function hasPermission(rol: string, permiso: Permiso): boolean {
  return permisosDeRol(rol as Rol).includes(permiso);
}

export function requirePermission(rol: string, permiso: Permiso): void {
  if (!hasPermission(rol, permiso)) {
    throw new AppError("No tienes permisos para realizar esta acción.", {
      statusCode: 403,
      code: "FORBIDDEN",
    });
  }
}
