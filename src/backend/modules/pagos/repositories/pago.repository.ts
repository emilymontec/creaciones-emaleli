import { prisma } from "@/src/backend/shared/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function listarPagosGeneral(opts: {
  take?: number;
  skip?: number;
  pedidoId?: string;
}) {
  const take = opts.take ?? 50;
  const skip = opts.skip ?? 0;
  const where: Prisma.PagoWhereInput = {};
  if (opts.pedidoId) where.pedidoId = opts.pedidoId;

  return prisma.pago.findMany({
    where,
    take,
    skip,
    orderBy: { fecha: "desc" },
    include: {
      pedido: {
        select: {
          id: true,
          codigo: true,
          total: true,
          saldoPendiente: true,
          cliente: { select: { id: true, nombre: true, whatsapp: true } },
        },
      },
      usuario: { select: { id: true, nombre: true } },
      comprobante: {
        select: { id: true, url: true, nombre: true, tipo: true },
      },
    },
  });
}

export async function obtenerPagoPorId(id: string) {
  return prisma.pago.findUnique({
    where: { id },
    include: {
      pedido: true,
      usuario: true,
      comprobante: true,
    },
  });
}

export async function registrarPagoConComprobante(params: {
  pedidoId: string;
  tipo: "ANTICIPO" | "ABONO" | "PAGO_FINAL";
  monto: number;
  metodo: string;
  usuarioId?: string;
  notas?: string;
  fecha?: Date;
  comprobante?: Prisma.ArchivoAdjuntoUncheckedCreateWithoutPagoComprobanteInput;
}) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: { id: params.pedidoId },
      include: { pagos: true },
    });
    if (!pedido) throw new Error("Pedido no encontrado.");

    const totalPagado = pedido.pagos.reduce(
      (sum, p) => sum + Number(p.monto),
      0,
    );
    const nuevoTotalPagado = totalPagado + params.monto;
    const montoTotal = Number(pedido.total);

    if (params.tipo === "PAGO_FINAL") {
      const diferencia = Math.abs(nuevoTotalPagado - montoTotal);
      const tolerancia = 1;
      if (diferencia > tolerancia) {
        throw new Error(
          `Pago final debe coincidir con el saldo pendiente. Total pagado sería $${nuevoTotalPagado.toLocaleString(
            "es-CO",
          )} sobre total del pedido $${montoTotal.toLocaleString("es-CO")}.`,
        );
      }
    }

    if (nuevoTotalPagado > montoTotal + 1) {
      throw new Error(
        `El pago excede el total del pedido. Total pagado sería $${nuevoTotalPagado.toLocaleString(
          "es-CO",
        )} sobre $${montoTotal.toLocaleString("es-CO")}.`,
      );
    }

    const nuevoSaldo = Math.max(0, montoTotal - nuevoTotalPagado);

    const pago = await tx.pago.create({
      data: {
        pedidoId: params.pedidoId,
        tipo: params.tipo,
        monto: params.monto,
        metodo: params.metodo,
        notas: params.notas ?? null,
        fecha: params.fecha ?? new Date(),
        usuarioId: params.usuarioId ?? null,
        comprobante: params.comprobante
          ? { create: params.comprobante }
          : undefined,
      },
      include: {
        comprobante: true,
        usuario: { select: { id: true, nombre: true } },
      },
    });

    await tx.pedido.update({
      where: { id: params.pedidoId },
      data: { saldoPendiente: nuevoSaldo },
    });

    await tx.eventoTimeline.create({
      data: {
        pedidoId: params.pedidoId,
        tipo: "PAGO_REGISTRADO",
        usuarioId: params.usuarioId ?? null,
        descripcion: `${
          params.tipo === "ANTICIPO"
            ? "Anticipo"
            : params.tipo === "ABONO"
              ? "Abono"
              : "Pago final"
        } de $${params.monto.toLocaleString("es-CO")} vía ${params.metodo}.${
          params.notas ? ` Nota: ${params.notas}` : ""
        }`,
      },
    });

    return pago;
  });
}

export async function obtenerFacturaPorPedido(pedidoId: string) {
  return prisma.factura.findUnique({
    where: { pedidoId },
    include: {
      usuario: { select: { id: true, nombre: true } },
    },
  });
}

export async function upsertFactura(params: {
  pedidoId: string;
  numero?: string | null;
  estado: "PENDIENTE" | "EMITIDA" | "ANULADA";
  urlPdf?: string | null;
  notas?: string | null;
  usuarioId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: { id: params.pedidoId },
    });
    if (!pedido) throw new Error("Pedido no encontrado.");

    const existente = await tx.factura.findUnique({
      where: { pedidoId: params.pedidoId },
    });

    const data: Prisma.FacturaUncheckedUpdateInput = {
      numero: params.numero ?? null,
      estado: params.estado,
      urlPdf: params.urlPdf ?? null,
      notas: params.notas ?? null,
      usuarioId: params.usuarioId ?? null,
    };

    if (params.estado === "EMITIDA" && !existente?.fechaEmision) {
      data.fechaEmision = new Date();
    }
    if (params.estado === "EMITIDA" && existente?.fechaAnulacion) {
      data.fechaAnulacion = null;
    }
    if (params.estado === "ANULADA" && !existente?.fechaAnulacion) {
      data.fechaAnulacion = new Date();
    }

    const factura = await tx.factura.upsert({
      where: { pedidoId: params.pedidoId },
      create: {
        pedidoId: params.pedidoId,
        numero: params.numero ?? null,
        estado: params.estado,
        urlPdf: params.urlPdf ?? null,
        notas: params.notas ?? null,
        usuarioId: params.usuarioId ?? null,
        fechaEmision: params.estado === "EMITIDA" ? new Date() : null,
        fechaAnulacion: params.estado === "ANULADA" ? new Date() : null,
      },
      update: data,
      include: { usuario: { select: { id: true, nombre: true } } },
    });

    return factura;
  });
}

export interface ResumenFinancieroFiltros {
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export async function obtenerResumenFinanciero(
  filtros: ResumenFinancieroFiltros = {},
) {
  const wherePagos: Prisma.PagoWhereInput = {};
  const wherePedidos: Prisma.PedidoWhereInput = {};
  if (filtros.fechaDesde || filtros.fechaHasta) {
    wherePagos.fecha = {};
    wherePedidos.fechaPedido = {};
    if (filtros.fechaDesde) {
      wherePagos.fecha.gte = filtros.fechaDesde;
      wherePedidos.fechaPedido.gte = filtros.fechaDesde;
    }
    if (filtros.fechaHasta) {
      wherePagos.fecha.lte = filtros.fechaHasta;
      wherePedidos.fechaPedido.lte = filtros.fechaHasta;
    }
  }

  const [totalRecaudadoRaw, pedidosAgregado, pagos] = await Promise.all([
    prisma.pago.aggregate({
      where: wherePagos,
      _sum: { monto: true },
    }),
    prisma.pedido.aggregate({
      where: wherePedidos,
      _sum: { total: true, saldoPendiente: true },
      _count: true,
    }),
    prisma.pago.groupBy({
      where: wherePagos,
      by: ["tipo"],
      _sum: { monto: true },
      _count: true,
    }),
  ]);

  const porTipo: Record<string, { monto: number; cantidad: number }> = {};
  for (const row of pagos) {
    porTipo[row.tipo] = {
      monto: Number(row._sum.monto ?? 0),
      cantidad: row._count,
    };
  }

  return {
    totalFacturado: Number(pedidosAgregado._sum.total ?? 0),
    totalPagado: Number(totalRecaudadoRaw._sum.monto ?? 0),
    saldoPorCobrar: Number(pedidosAgregado._sum.saldoPendiente ?? 0),
    cantidadPedidos: pedidosAgregado._count,
    porTipo,
  };
}
