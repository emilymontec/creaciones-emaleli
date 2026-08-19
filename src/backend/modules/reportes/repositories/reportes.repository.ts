import { prisma } from "@/src/backend/shared/prisma";
import type { Agrupacion } from "../schemas/reportes.schema";

type RangoFechas = { desde?: Date; hasta?: Date };

function rangoComoFiltro({ desde, hasta }: RangoFechas) {
  if (!desde && !hasta) return undefined;
  return {
    ...(desde ? { gte: desde } : {}),
    ...(hasta ? { lte: hasta } : {}),
  };
}

/** Ventas agrupadas por día, mes o año usando date_trunc de Postgres. */
export async function ventasPorPeriodo(
  agrupacion: Agrupacion,
  rango: RangoFechas,
): Promise<{ periodo: string; total: number; pedidos: number }[]> {
  const truncUnit =
    agrupacion === "dia" ? "day" : agrupacion === "mes" ? "month" : "year";
  const desde = rango.desde ?? new Date(0);
  const hasta = rango.hasta ?? new Date();

  const rows = await prisma.$queryRaw<
    { periodo: Date; total: string; pedidos: bigint }[]
  >`
    SELECT
      date_trunc(${truncUnit}, "fechaPedido") AS periodo,
      COALESCE(SUM("total"), 0) AS total,
      COUNT(*) AS pedidos
    FROM "Pedido"
    WHERE "fechaPedido" >= ${desde} AND "fechaPedido" <= ${hasta}
    GROUP BY periodo
    ORDER BY periodo ASC
  `;

  return rows.map((r) => ({
    periodo: r.periodo.toISOString(),
    total: Number(r.total),
    pedidos: Number(r.pedidos),
  }));
}

export async function productosPorVentas(
  rango: RangoFechas,
  categoriaId: string | undefined,
  orden: "desc" | "asc",
  limit: number,
) {
  const items = await prisma.itemPedido.findMany({
    where: {
      pedido: { fechaPedido: rangoComoFiltro(rango) },
      ...(categoriaId
        ? { producto: { categorias: { some: { id: categoriaId } } } }
        : {}),
    },
    select: { nombreProducto: true, cantidad: true, subtotal: true },
  });

  const agrupado = new Map<string, { cantidad: number; total: number }>();
  for (const item of items) {
    const actual = agrupado.get(item.nombreProducto) ?? {
      cantidad: 0,
      total: 0,
    };
    actual.cantidad += item.cantidad;
    actual.total += Number(item.subtotal);
    agrupado.set(item.nombreProducto, actual);
  }

  return Array.from(agrupado.entries())
    .map(([nombreProducto, data]) => ({ nombreProducto, ...data }))
    .sort((a, b) =>
      orden === "desc" ? b.cantidad - a.cantidad : a.cantidad - b.cantidad,
    )
    .slice(0, limit);
}

export async function pedidosPorEstado(rango: RangoFechas) {
  const rows = await prisma.pedido.groupBy({
    by: ["estado"],
    where: { fechaPedido: rangoComoFiltro(rango) },
    _count: { estado: true },
  });
  return rows.map((r) => ({ estado: r.estado, cantidad: r._count.estado }));
}

export async function pedidosPorCiudad(rango: RangoFechas, limit = 10) {
  const rows = await prisma.pedido.groupBy({
    by: ["ciudad"],
    where: { fechaPedido: rangoComoFiltro(rango) },
    _count: { ciudad: true },
    orderBy: { _count: { ciudad: "desc" } },
    take: limit,
  });
  return rows.map((r) => ({ ciudad: r.ciudad, cantidad: r._count.ciudad }));
}

/**
 * Tiempo promedio (en horas) que los pedidos permanecen en cada estado,
 * calculado a partir de los eventos de cambio de estado del timeline.
 * No usa SQL de ventana porque la secuencia de estados por pedido no es
 * uniforme (no todos los pedidos pasan por los mismos estados en el mismo
 * orden), así que se recorre en memoria agrupando por pedido.
 */
export async function tiempoPromedioPorEtapa(rango: RangoFechas) {
  const eventos = await prisma.eventoTimeline.findMany({
    where: {
      tipo: "CAMBIO_ESTADO",
      pedido: { fechaPedido: rangoComoFiltro(rango) },
    },
    select: { pedidoId: true, estadoNuevo: true, createdAt: true },
    orderBy: [{ pedidoId: "asc" }, { createdAt: "asc" }],
  });

  const porPedido = new Map<string, typeof eventos>();
  for (const evento of eventos) {
    const lista = porPedido.get(evento.pedidoId) ?? [];
    lista.push(evento);
    porPedido.set(evento.pedidoId, lista);
  }

  const acumulado = new Map<string, { horasTotal: number; muestras: number }>();

  for (const lista of porPedido.values()) {
    for (let i = 0; i < lista.length - 1; i++) {
      const actual = lista[i];
      const siguiente = lista[i + 1];
      if (!actual.estadoNuevo) continue;

      const horas =
        (siguiente.createdAt.getTime() - actual.createdAt.getTime()) /
        3_600_000;

      const acc = acumulado.get(actual.estadoNuevo) ?? {
        horasTotal: 0,
        muestras: 0,
      };
      acc.horasTotal += horas;
      acc.muestras += 1;
      acumulado.set(actual.estadoNuevo, acc);
    }
  }

  return Array.from(acumulado.entries()).map(
    ([estado, { horasTotal, muestras }]) => ({
      estado,
      horasPromedio: muestras > 0 ? horasTotal / muestras : 0,
      muestras,
    }),
  );
}

export async function clientesFrecuentes(rango: RangoFechas, limit = 10) {
  const rows = await prisma.pedido.groupBy({
    by: ["clienteId"],
    where: { fechaPedido: rangoComoFiltro(rango) },
    _count: { clienteId: true },
    _sum: { total: true },
    orderBy: { _count: { clienteId: "desc" } },
    take: limit,
  });

  const clientes = await prisma.cliente.findMany({
    where: { id: { in: rows.map((r) => r.clienteId) } },
    select: { id: true, nombre: true, whatsapp: true, ciudad: true },
  });
  const clientesPorId = new Map(clientes.map((c) => [c.id, c]));

  return rows.map((r) => ({
    cliente: clientesPorId.get(r.clienteId) ?? null,
    pedidos: r._count.clienteId,
    totalGastado: Number(r._sum.total ?? 0),
  }));
}

export async function clientesNuevos(rango: RangoFechas) {
  const where = { createdAt: rangoComoFiltro(rango) };
  const [total, ultimos] = await Promise.all([
    prisma.cliente.count({ where }),
    prisma.cliente.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        whatsapp: true,
        ciudad: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  return { total, ultimos };
}
