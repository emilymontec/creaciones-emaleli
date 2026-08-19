import { randomUUID } from "node:crypto";
import * as repository from "../repositories/pedido.repository";
import { AppError } from "@/src/shared/lib/errors";
import type { CheckoutInput } from "../schemas/checkout.schema";
import type { CartItem } from "@/src/frontend/cart/types";
import type { Prisma, EstadoPedido } from "@/generated/prisma/client";
import { uploadFile, getPublicUrl } from "@/src/shared/lib/storage";
import { STORAGE_BUCKETS } from "@/src/shared/constants/storage";
import {
  construirMensajeWhatsapp,
  calcularCostoEnvio,
  normalizarWhatsapp,
  padNumeroPedido,
  personalizacionesItemToJson,
} from "@/src/shared/lib/checkout";
import {
  TRANSICIONES_PERMITIDAS,
  ListarPedidosInput,
  CambiarEstadoInput,
  ESTADO_PEDIDO_LABEL,
} from "../schemas/pedido-admin.schema";

export interface CrearPedidoParams {
  checkout: CheckoutInput;
  archivosAdjuntos?: File[];
}

function calcularTotales(items: CartItem[], costoEnvio: number) {
  const subtotal = items.reduce(
    (sum, i) => sum + i.precioUnitario * i.cantidad,
    0,
  );
  const total = subtotal + costoEnvio;
  return { subtotal, total };
}

export { calcularCostoEnvio, construirMensajeWhatsapp };

async function generarCodigoPedido(): Promise<{
  codigo: string;
  token: string;
}> {
  const anio = new Date().getFullYear();
  const siguiente = await repository.siguienteNumeroPedido(anio);
  const codigo = `EML-${anio}-${padNumeroPedido(siguiente)}`;
  // Se usa el UUID completo (no solo un fragmento) como sufijo no adivinable
  // del token de seguimiento público: el endpoint no requiere autenticación,
  // por lo que su seguridad depende enteramente de la entropía del token.
  const token = `${codigo}-${randomUUID().toUpperCase()}`;
  return { codigo, token };
}

export async function crearPedido({
  checkout,
  archivosAdjuntos = [],
}: CrearPedidoParams) {
  if (checkout.items.length === 0) {
    throw new AppError("No hay productos en el carrito.", {
      statusCode: 400,
      code: "CART_EMPTY",
    });
  }

  const { total } = calcularTotales(checkout.items, checkout.costoEnvio);
  const { codigo, token } = await generarCodigoPedido();

  const clienteData: Prisma.ClienteCreateInput = {
    nombre: checkout.cliente.nombreCompleto.trim(),
    whatsapp: normalizarWhatsapp(checkout.cliente.whatsapp),
    email: checkout.cliente.email.trim() || null,
    ciudad: checkout.cliente.ciudad.trim(),
    empresa: checkout.cliente.empresa?.trim() || null,
  };

  const itemsData: Prisma.ItemPedidoCreateManyPedidoInput[] =
    checkout.items.map((item) => ({
      productoId: item.productoId,
      varianteId: item.opciones.length > 0 ? item.opciones[0]!.opcionId : null,
      nombreProducto: item.nombre,
      precioUnitario: item.precioUnitario,
      cantidad: item.cantidad,
      personalizaciones: personalizacionesItemToJson(item),
      subtotal: item.precioUnitario * item.cantidad,
    }));

  const envioData: Prisma.EnvioCreateManyPedidoInput = {
    metodo: checkout.envio.metodo,
    ciudad: checkout.cliente.ciudad.trim(),
    direccion:
      checkout.envio.metodo === "RECOGER" ? null : checkout.envio.direccion,
    destinatario:
      checkout.envio.metodo === "RECOGER" ? null : checkout.envio.destinatario,
    telefono:
      checkout.envio.metodo === "RECOGER"
        ? null
        : normalizarWhatsapp(checkout.envio.telefono),
    documento:
      checkout.envio.metodo === "TRANSPORTADORA"
        ? checkout.envio.documento
        : null,
  };

  const pedidoData: Omit<Prisma.PedidoCreateInput, "cliente"> = {
    codigo,
    estado: "NUEVO",
    metodoEnvio: checkout.envio.metodo,
    total,
    saldoPendiente: total,
    ciudad: checkout.cliente.ciudad.trim(),
    direccion:
      checkout.envio.metodo === "RECOGER" ? null : checkout.envio.direccion,
    observaciones: checkout.observaciones?.trim() || null,
    tokenSeguimiento: token,
    fechaPedido: new Date(),
  };

  const archivosData: Prisma.ArchivoAdjuntoCreateManyPedidoInput[] = [];
  if (archivosAdjuntos.length > 0) {
    for (const file of archivosAdjuntos) {
      const ref = await uploadFile({
        bucket: STORAGE_BUCKETS.PEDIDOS_ARCHIVOS,
        entityId: codigo,
        file,
      });
      archivosData.push({
        origen: "CLIENTE",
        tipo: file.type || "application/octet-stream",
        url: getPublicUrl(ref),
        nombre: file.name,
      });
    }
  }

  return repository.crearPedidoTransaccion({
    cliente: clienteData,
    pedido: pedidoData,
    items: itemsData,
    envio: envioData,
    archivos: archivosData,
  });
}

export function obtenerPedidoPorCodigo(codigo: string) {
  return repository.buscarPedidoPorCodigo(codigo);
}

export function obtenerPedidoPorToken(token: string) {
  return repository.buscarPedidoPorToken(token);
}

export async function listarPedidos(input: ListarPedidosInput) {
  const filtros: repository.ListarPedidosFiltros = {
    estado: input.estado,
    ciudad: input.ciudad,
    cliente: input.cliente,
    page: input.page,
    perPage: input.perPage,
  };
  if (input.fechaDesde) filtros.fechaDesde = new Date(input.fechaDesde);
  if (input.fechaHasta) {
    const hasta = new Date(input.fechaHasta);
    hasta.setHours(23, 59, 59, 999);
    filtros.fechaHasta = hasta;
  }
  const [pedidos, conteos] = await Promise.all([
    repository.listarPedidosAdmin(filtros),
    repository.conteosPorEstado(),
  ]);
  return { pedidos, conteos };
}

export async function obtenerDetallePedido(id: string) {
  const pedido = await repository.obtenerPedidoDetalleAdmin(id);
  if (!pedido) {
    throw new AppError("Pedido no encontrado.", {
      statusCode: 404,
      code: "PEDIDO_NOT_FOUND",
    });
  }
  return pedido;
}

export async function cambiarEstadoPedido(
  input: CambiarEstadoInput & { usuarioId: string },
) {
  const pedido = await repository.obtenerPedidoDetalleAdmin(input.pedidoId);
  if (!pedido) {
    throw new AppError("Pedido no encontrado.", {
      statusCode: 404,
      code: "PEDIDO_NOT_FOUND",
    });
  }

  const estadoAnterior = pedido.estado as EstadoPedido;
  const estadoNuevo = input.estado;
  const permitidos = TRANSICIONES_PERMITIDAS[estadoAnterior] ?? [];

  if (!permitidos.includes(estadoNuevo) && estadoAnterior !== estadoNuevo) {
    throw new AppError(
      `Transición no permitida: ${ESTADO_PEDIDO_LABEL[estadoAnterior]} → ${ESTADO_PEDIDO_LABEL[estadoNuevo]}`,
      { statusCode: 400, code: "INVALID_TRANSITION" },
    );
  }

  if (estadoAnterior === estadoNuevo) {
    return { pedido, cambiado: false };
  }

  const actualizado = await repository.actualizarEstadoPedido({
    id: input.pedidoId,
    estadoAnterior,
    estadoNuevo,
    usuarioId: input.usuarioId,
    descripcion: input.descripcion,
  });

  return { pedido: actualizado, cambiado: true };
}

export async function agregarComentario(params: {
  pedidoId: string;
  usuarioId: string;
  descripcion: string;
}) {
  const pedido = await repository.obtenerPedidoDetalleAdmin(params.pedidoId);
  if (!pedido) {
    throw new AppError("Pedido no encontrado.", {
      statusCode: 404,
      code: "PEDIDO_NOT_FOUND",
    });
  }
  return repository.agregarComentarioInterno(params);
}

export async function obtenerListadoCiudades() {
  return repository.listarCiudadesPedido();
}

export async function obtenerDetalleSeguimientoPublico(token: string) {
  const pedido = await repository.buscarPedidoPorTokenPublico(token);
  if (!pedido) {
    throw new AppError("Pedido no encontrado o enlace inválido.", {
      statusCode: 404,
      code: "PEDIDO_NOT_FOUND",
    });
  }
  return pedido;
}

export async function registrarPago(params: {
  pedidoId: string;
  tipo: "ANTICIPO" | "ABONO" | "PAGO_FINAL";
  monto: number;
  metodo: string;
  usuarioId?: string;
}) {
  if (params.monto <= 0) {
    throw new AppError("El monto del pago debe ser mayor a 0.", {
      statusCode: 400,
      code: "INVALID_AMOUNT",
    });
  }
  return repository.registrarPagoTransaccion(params);
}

export async function actualizarGuiaEnvio(params: {
  pedidoId: string;
  numeroGuia: string;
  estadoGuia?: "GENERADA" | "EN_TRANSITO" | "ENTREGADA" | "DEVUELTA";
  enlaceRastreo?: string;
  usuarioId?: string;
}) {
  if (!params.numeroGuia.trim()) {
    throw new AppError("El número de guía es obligatorio.", {
      statusCode: 400,
      code: "INVALID_GUIA",
    });
  }
  return repository.actualizarEnvioTransaccion(params);
}

export async function listarEnvios(limit = 50) {
  return repository.listarEnvios(limit);
}
