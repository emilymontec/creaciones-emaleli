import { prisma } from "@/src/backend/shared/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function crearCliente(data: Prisma.ClienteCreateInput) {
  return prisma.cliente.create({ data });
}

export async function buscarClientePorWhatsapp(whatsapp: string) {
  return prisma.cliente.findFirst({ where: { whatsapp } });
}

export async function crearPedido(data: Prisma.PedidoCreateInput) {
  return prisma.pedido.create({
    data,
    include: {
      cliente: true,
      items: true,
      archivos: true,
      envios: true,
    },
  });
}

export async function crearPedidoTransaccion(payload: {
  cliente: Prisma.ClienteCreateInput;
  pedido: Omit<Prisma.PedidoCreateInput, "cliente">;
  items: Prisma.ItemPedidoCreateManyPedidoInput[];
  envio: Prisma.EnvioCreateManyPedidoInput;
  archivos: Prisma.ArchivoAdjuntoCreateManyPedidoInput[];
}) {
  return prisma.$transaction(async (tx) => {
    const clienteExistente = await tx.cliente.findFirst({
      where: { whatsapp: payload.cliente.whatsapp },
    });

    const cliente = clienteExistente
      ? await tx.cliente.update({
          where: { id: clienteExistente.id },
          data: {
            nombre: payload.cliente.nombre,
            email: payload.cliente.email,
            ciudad: payload.cliente.ciudad,
            empresa: payload.cliente.empresa,
          },
        })
      : await tx.cliente.create({ data: payload.cliente });

    const pedido = await tx.pedido.create({
      data: {
        ...payload.pedido,
        cliente: { connect: { id: cliente.id } },
        items: { createMany: { data: payload.items } },
        envios: { createMany: { data: [payload.envio] } },
        archivos:
          payload.archivos.length > 0
            ? { createMany: { data: payload.archivos } }
            : undefined,
        timeline: {
          create: {
            tipo: "CREACION_PEDIDO",
            estadoNuevo: payload.pedido.estado as any,
            descripcion: "Pedido creado desde checkout.",
          },
        },
      },
      include: {
        cliente: true,
        items: true,
        archivos: true,
        envios: true,
        timeline: {
          orderBy: { createdAt: "desc" },
          include: { usuario: { select: { id: true, nombre: true } } },
        },
      },
    });

    return pedido;
  });
}

export async function siguienteNumeroPedido(anio: number): Promise<number> {
  const prefijo = `EML-${anio}-`;
  const ultimo = await prisma.pedido.findFirst({
    where: { codigo: { startsWith: prefijo } },
    orderBy: { codigo: "desc" },
    select: { codigo: true },
  });

  if (!ultimo) return 1;

  const partes = ultimo.codigo.split("-");
  const numero = parseInt(partes[2] ?? "0", 10);
  return Number.isFinite(numero) ? numero + 1 : 1;
}

export async function buscarPedidoPorCodigo(codigo: string) {
  return prisma.pedido.findUnique({
    where: { codigo },
    include: {
      cliente: true,
      items: true,
      archivos: true,
      envios: true,
    },
  });
}

export async function buscarPedidoPorToken(token: string) {
  return prisma.pedido.findUnique({
    where: { tokenSeguimiento: token },
    include: {
      cliente: true,
      items: true,
      archivos: true,
      envios: true,
    },
  });
}

export interface ListarPedidosFiltros {
  estado?: string;
  ciudad?: string;
  cliente?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  page?: number;
  perPage?: number;
}

export async function listarPedidosAdmin(filtros: ListarPedidosFiltros = {}) {
  const page = filtros.page ?? 1;
  const perPage = filtros.perPage ?? 20;
  const skip = (page - 1) * perPage;

  const where: Prisma.PedidoWhereInput = {};
  if (filtros.estado) where.estado = filtros.estado as any;
  if (filtros.ciudad) where.ciudad = { contains: filtros.ciudad, mode: "insensitive" };
  if (filtros.cliente) {
    where.cliente = {
      OR: [
        { nombre: { contains: filtros.cliente, mode: "insensitive" } },
        { whatsapp: { contains: filtros.cliente } },
        { email: { contains: filtros.cliente, mode: "insensitive" } },
      ],
    };
  }
  if (filtros.fechaDesde || filtros.fechaHasta) {
    where.fechaPedido = {};
    if (filtros.fechaDesde) where.fechaPedido.gte = filtros.fechaDesde;
    if (filtros.fechaHasta) where.fechaPedido.lte = filtros.fechaHasta;
  }

  const [items, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { fechaPedido: "desc" },
      include: {
        cliente: { select: { id: true, nombre: true, whatsapp: true, ciudad: true } },
        _count: { select: { items: true, pagos: true } },
        pagos: { select: { monto: true, tipo: true, fecha: true } },
      },
    }),
    prisma.pedido.count({ where }),
  ]);

  return { items, total, page, perPage, pages: Math.ceil(total / perPage) };
}

export async function conteosPorEstado() {
  const raw = await prisma.pedido.groupBy({
    by: ["estado"],
    _count: { estado: true },
  });
  return Object.fromEntries(
    raw.map((r) => [r.estado, r._count.estado]),
  ) as Record<string, number>;
}

export async function obtenerPedidoDetalleAdmin(id: string) {
  return prisma.pedido.findUnique({
    where: { id },
    include: {
      cliente: true,
      items: true,
      pagos: {
        orderBy: { fecha: "desc" },
        include: {
          usuario: { select: { id: true, nombre: true } },
          comprobante: {
            select: { id: true, url: true, nombre: true, tipo: true },
          },
        },
      },
      factura: {
        include: { usuario: { select: { id: true, nombre: true } } },
      },
      envios: true,
      archivos: true,
      avancesProduccion: {
        orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
        include: { usuario: { select: { id: true, nombre: true } } },
      },
      comentariosProduccion: {
        orderBy: { createdAt: "desc" },
        include: { usuario: { select: { id: true, nombre: true } } },
      },
      solicitudes: {
        orderBy: { createdAt: "desc" },
        include: { comentarios: { orderBy: { createdAt: "asc" } } },
      },
      timeline: {
        orderBy: { createdAt: "desc" },
        include: { usuario: { select: { id: true, nombre: true } } },
      },
    },
  });
}

export async function obtenerPedidoDetallePorCodigo(codigo: string) {
  return prisma.pedido.findUnique({
    where: { codigo },
    include: {
      cliente: true,
      items: true,
      pagos: true,
      envios: true,
      archivos: true,
      timeline: {
        orderBy: { createdAt: "desc" },
        include: { usuario: { select: { id: true, nombre: true } } },
      },
    },
  });
}

export async function actualizarEstadoPedido(params: {
  id: string;
  estadoNuevo: any;
  estadoAnterior: any;
  usuarioId: string;
  descripcion?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.pedido.update({
      where: { id: params.id },
      data: { estado: params.estadoNuevo },
    });

    await tx.eventoTimeline.create({
      data: {
        pedidoId: params.id,
        tipo: "CAMBIO_ESTADO",
        estadoAnterior: params.estadoAnterior,
        estadoNuevo: params.estadoNuevo,
        usuarioId: params.usuarioId,
        descripcion: params.descripcion,
      },
    });

    return actualizado;
  });
}

export async function agregarComentarioInterno(params: {
  pedidoId: string;
  usuarioId: string;
  descripcion: string;
}) {
  return prisma.eventoTimeline.create({
    data: {
      pedidoId: params.pedidoId,
      tipo: "COMENTARIO_INTERNO",
      usuarioId: params.usuarioId,
      descripcion: params.descripcion,
    },
    include: { usuario: { select: { id: true, nombre: true } } },
  });
}

export async function buscarPedidoPorTokenPublico(token: string) {
  return prisma.pedido.findUnique({
    where: { tokenSeguimiento: token },
    include: {
      cliente: { select: { nombre: true, ciudad: true, whatsapp: true } },
      items: true,
      pagos: {
        orderBy: { fecha: "desc" },
        select: { id: true, tipo: true, monto: true, fecha: true, metodo: true },
      },
      envios: true,
      archivos: true,
      avancesProduccion: {
        where: { visibleCliente: true },
        orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          tipo: true,
          url: true,
          nombre: true,
          titulo: true,
          descripcion: true,
          createdAt: true,
        },
      },
      comentariosProduccion: {
        where: { visibilidad: "CLIENTE" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          contenido: true,
          autorNombre: true,
          createdAt: true,
        },
      },
      solicitudes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          descripcion: true,
          estado: true,
          origen: true,
          respuestaCliente: true,
          respuestaAt: true,
          createdAt: true,
          comentarios: {
            where: { visibleCliente: true },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              contenido: true,
              autor: true,
              origen: true,
              createdAt: true,
            },
          },
        },
      },
      timeline: {
        orderBy: { createdAt: "desc" },
        select: { id: true, tipo: true, estadoNuevo: true, descripcion: true, createdAt: true },
      },
    },
  });
}

export async function registrarPagoTransaccion(params: {
  pedidoId: string;
  tipo: "ANTICIPO" | "ABONO" | "PAGO_FINAL";
  monto: number;
  metodo: string;
  usuarioId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({ where: { id: params.pedidoId } });
    if (!pedido) throw new Error("Pedido no encontrado.");

    const nuevoSaldo = Math.max(0, Number(pedido.saldoPendiente) - params.monto);

    const pago = await tx.pago.create({
      data: {
        pedidoId: params.pedidoId,
        tipo: params.tipo,
        monto: params.monto,
        metodo: params.metodo,
        usuarioId: params.usuarioId || null,
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
        usuarioId: params.usuarioId || null,
        descripcion: `Pago de $${params.monto.toLocaleString("es-CO")} (${params.tipo}) vía ${params.metodo}.`,
      },
    });

    return pago;
  });
}

export async function actualizarEnvioTransaccion(params: {
  pedidoId: string;
  numeroGuia: string;
  estadoGuia?: "GENERADA" | "EN_TRANSITO" | "ENTREGADA" | "DEVUELTA";
  enlaceRastreo?: string;
  usuarioId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const envioExistente = await tx.envio.findFirst({
      where: { pedidoId: params.pedidoId },
    });

    let envio;
    if (envioExistente) {
      envio = await tx.envio.update({
        where: { id: envioExistente.id },
        data: {
          numeroGuia: params.numeroGuia,
          estadoGuia: params.estadoGuia || "GENERADA",
          enlaceRastreo: params.enlaceRastreo || null,
          fechaDespacho: new Date(),
        },
      });
    } else {
      envio = await tx.envio.create({
        data: {
          pedidoId: params.pedidoId,
          metodo: "TRANSPORTADORA",
          numeroGuia: params.numeroGuia,
          estadoGuia: params.estadoGuia || "GENERADA",
          enlaceRastreo: params.enlaceRastreo || null,
          fechaDespacho: new Date(),
        },
      });
    }

    await tx.eventoTimeline.create({
      data: {
        pedidoId: params.pedidoId,
        tipo: "ENVIO_GENERADO",
        usuarioId: params.usuarioId || null,
        descripcion: `Guía de envío ${params.numeroGuia} registrada.`,
      },
    });

    return envio;
  });
}

export async function listarCiudadesPedido() {
  const rows = await prisma.pedido.findMany({
    select: { ciudad: true },
    distinct: ["ciudad"],
    orderBy: { ciudad: "asc" },
    take: 50,
  });
  return rows.map((r) => r.ciudad).filter(Boolean) as string[];
}

