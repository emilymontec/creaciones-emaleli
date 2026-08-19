"use server";

import { prisma } from "@/src/backend/shared/prisma";
import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";

export async function obtenerDashboardMetricas() {
  await requireAdmin(PERMISOS.REPORTES_VER);

  const [nuevos, productos, categorias, saldoRaw] = await Promise.all([
    prisma.pedido.count({ where: { estado: "NUEVO" } }),
    prisma.producto.count({ where: { estado: "ACTIVO" } }),
    prisma.categoria.count({ where: { activo: true } }),
    prisma.pedido.aggregate({
      where: {
        estado: { notIn: ["ENTREGADO", "CANCELADO"] },
      },
      _sum: { saldoPendiente: true },
    }),
  ]);

  return {
    pedidosNuevos: nuevos,
    productosActivos: productos,
    categoriasActivas: categorias,
    saldoPorCobrar: Number(saldoRaw._sum.saldoPendiente ?? 0),
  };
}

export type DashboardMetricas = Awaited<
  ReturnType<typeof obtenerDashboardMetricas>
>;
