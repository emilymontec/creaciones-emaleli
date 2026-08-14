"use server";

import { prisma } from "@/src/backend/shared/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function obtenerDashboardMetricas() {
  const [nuevos, productos, categorias, saldoRaw] = await Promise.all([
    prisma.pedido.count({ where: { estado: "NUEVO" } }),
    prisma.producto.count({ where: { estado: "ACTIVO" } }),
    prisma.categoria.count({ where: { activo: true } }),
    prisma.pedido.aggregate({
      where: {
        estado: { notIn: ["ENTREGADO", "CANCELADO"] as any[] },
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
