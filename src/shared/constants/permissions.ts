export const PERMISOS = {
  CATALOGO_GESTIONAR: "catalogo.gestionar",
  PEDIDOS_GESTIONAR: "pedidos.gestionar",
  PAGOS_GESTIONAR: "pagos.gestionar",
  ENVIOS_GESTIONAR: "envios.gestionar",
  CONFIGURACION_GESTIONAR: "configuracion.gestionar",
  REPORTES_VER: "reportes.ver",
  USUARIOS_GESTIONAR: "usuarios.gestionar",
} as const;

export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS];

export type Rol = "ADMIN" | "PRODUCCION" | "VENTAS" | "SOPORTE";

export const PERMISOS_POR_ROL: Record<Rol, readonly Permiso[]> = {
  ADMIN: Object.values(PERMISOS),
  PRODUCCION: [PERMISOS.PEDIDOS_GESTIONAR, PERMISOS.ENVIOS_GESTIONAR],
  VENTAS: [
    PERMISOS.PEDIDOS_GESTIONAR,
    PERMISOS.PAGOS_GESTIONAR,
    PERMISOS.ENVIOS_GESTIONAR,
  ],
  SOPORTE: [PERMISOS.PEDIDOS_GESTIONAR],
};

export function permisosDeRol(rol: Rol): readonly Permiso[] {
  return PERMISOS_POR_ROL[rol];
}
