import type { Rol } from "@/src/shared/constants/permissions";

export type SessionUser = {
  sub: string;
  nombre: string;
  email: string;
  rol: Rol;
};
