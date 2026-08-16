import * as repository from "../repositories/pago.repository";
import * as pedidoRepository from "../../pedidos/repositories/pedido.repository";
import { AppError } from "@/src/shared/lib/errors";
import { uploadFile, getPublicUrl } from "@/src/shared/lib/storage";
import { STORAGE_BUCKETS } from "@/src/shared/constants/storage";
import {
  RegistrarPagoInput,
  GestionarFacturaInput,
} from "../schemas/pago.schema";
import { Prisma } from "@/generated/prisma/client";

export async function obtenerResumenFinanciero(params?: {
  fechaDesde?: string;
  fechaHasta?: string;
}) {
  const filtros: repository.ResumenFinancieroFiltros = {};
  if (params?.fechaDesde) filtros.fechaDesde = new Date(params.fechaDesde);
  if (params?.fechaHasta) {
    const hasta = new Date(params.fechaHasta);
    hasta.setHours(23, 59, 59, 999);
    filtros.fechaHasta = hasta;
  }
  return repository.obtenerResumenFinanciero(filtros);
}

export async function listarHistorialPagos(opts?: {
  take?: number;
  pedidoId?: string;
}) {
  return repository.listarPagosGeneral({
    take: opts?.take ?? 100,
    pedidoId: opts?.pedidoId,
  });
}

export async function registrarPagoConComprobante(
  input: RegistrarPagoInput & {
    usuarioId?: string;
    comprobanteFile?: File | null;
  },
) {
  const pedido = await pedidoRepository.obtenerPedidoDetalleAdmin(
    input.pedidoId,
  );
  if (!pedido) {
    throw new AppError("Pedido no encontrado.", {
      statusCode: 404,
      code: "PEDIDO_NOT_FOUND",
    });
  }

  let comprobanteInput:
    | Prisma.ArchivoAdjuntoUncheckedCreateWithoutPagoComprobanteInput
    | undefined;

  if (input.comprobanteFile && input.comprobanteFile.size > 0) {
    const ref = await uploadFile({
      bucket: STORAGE_BUCKETS.PEDIDOS_COMPROBANTES,
      entityId: pedido.codigo,
      file: input.comprobanteFile,
    });
    comprobanteInput = {
      pedidoId: input.pedidoId,
      origen: "CLIENTE",
      tipo: input.comprobanteFile.type || "application/octet-stream",
      nombre: input.comprobanteFile.name,
      url: getPublicUrl(ref),
    };
  }

  return repository.registrarPagoConComprobante({
    pedidoId: input.pedidoId,
    tipo: input.tipo,
    monto: input.monto,
    metodo: input.metodo,
    notas: input.notas,
    fecha: input.fecha,
    usuarioId: input.usuarioId,
    comprobante: comprobanteInput,
  });
}

export async function obtenerFacturaPedido(pedidoId: string) {
  const pedido = await pedidoRepository.obtenerPedidoDetalleAdmin(pedidoId);
  if (!pedido) {
    throw new AppError("Pedido no encontrado.", {
      statusCode: 404,
      code: "PEDIDO_NOT_FOUND",
    });
  }
  return repository.obtenerFacturaPorPedido(pedidoId);
}

export async function gestionarFactura(
  input: GestionarFacturaInput & {
    usuarioId?: string;
    facturaFile?: File | null;
  },
) {
  const pedido = await pedidoRepository.obtenerPedidoDetalleAdmin(
    input.pedidoId,
  );
  if (!pedido) {
    throw new AppError("Pedido no encontrado.", {
      statusCode: 404,
      code: "PEDIDO_NOT_FOUND",
    });
  }

  let urlPdf: string | null | undefined;

  if (input.facturaFile && input.facturaFile.size > 0) {
    const ref = await uploadFile({
      bucket: STORAGE_BUCKETS.PEDIDOS_FACTURAS,
      entityId: pedido.codigo,
      file: input.facturaFile,
    });
    urlPdf = getPublicUrl(ref);
  }

  return repository.upsertFactura({
    pedidoId: input.pedidoId,
    numero: input.numero || null,
    estado: input.estado,
    notas: input.notas ?? null,
    urlPdf,
    usuarioId: input.usuarioId,
  });
}
