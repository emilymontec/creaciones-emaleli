"use client";

import { useEffect, useState, useTransition } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  MessageSquare,
  Package,
  PackageOpen,
  Paperclip,
  Send,
  Truck,
  User as UserIcon,
  Upload,
  Download,
  FileCheck,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { Card, CardHeader } from "@/src/frontend/components/ui/Card";
import { Input } from "@/src/frontend/components/ui/Input";
import { Button } from "@/src/frontend/components/ui/Button";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { Select } from "@/src/frontend/components/ui/Select";
import { Textarea } from "@/src/frontend/components/ui/Textarea";
import { Loader } from "@/src/frontend/components/ui/Loader";
import { Modal } from "@/src/frontend/components/ui/Modal";
import { EstadoPedidoBadge } from "./EstadoPedidoBadge";
import {
  TRANSICIONES_PERMITIDAS,
  ESTADO_PEDIDO_LABEL,
} from "@/src/backend/modules/pedidos/schemas/pedido-admin.schema";
import {
  obtenerDetallePedidoAction,
  cambiarEstadoPedidoAction,
  agregarComentarioAction,
  actualizarEnvioAction,
  type DetallePedidoState,
  type ActionState,
} from "@/src/backend/modules/pedidos/actions/managePedidos";
import {
  registrarPagoConComprobanteAction,
  gestionarFacturaAction,
  type PagoActionState,
  type FacturaActionState,
} from "@/src/backend/modules/pagos/actions/managePagos";
import {
  ESTADO_FACTURA_COLOR,
  ESTADO_FACTURA_LABEL,
  TIPO_PAGO_LABEL,
} from "@/src/backend/modules/pagos/schemas/pago.schema";
import { useToast } from "@/src/frontend/providers/ToastProvider";
import type { EstadoPedido, TipoEventoTimeline } from "@/generated/prisma/client";
import { ProduccionSection } from "./ProduccionSection";

const TIPO_ICON: Record<string, any> = {
  CREACION_PEDIDO: Package,
  CAMBIO_ESTADO: CheckCircle2,
  PAGO_REGISTRADO: CreditCard,
  ARCHIVO_ADJUNTO: Paperclip,
  ENVIO_GENERADO: Truck,
  COMENTARIO_INTERNO: MessageSquare,
  PRODUCCION_AVANCE: PackageOpen,
};

const TIPO_EVENTO_LABEL: Record<string, string> = {
  CREACION_PEDIDO: "Pedido creado",
  CAMBIO_ESTADO: "Cambio de estado",
  PAGO_REGISTRADO: "Pago registrado",
  ARCHIVO_ADJUNTO: "Archivo adjunto",
  ENVIO_GENERADO: "Envío generado",
  COMENTARIO_INTERNO: "Comentario interno",
  PRODUCCION_AVANCE: "Avance de producción",
};

const initialDetalle: DetallePedidoState = { success: false };
const initialAction: ActionState = { success: false };
const initialPago: PagoActionState = { success: false };
const initialFactura: FacturaActionState = { success: false };

export function PedidoDetallePage({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [detalle, setDetalle] = useState<DetallePedidoState>(initialDetalle);
  const [isPending, startTransition] = useTransition();
  const [estadoState, estadoAction, estadoPending] = useActionState(
    cambiarEstadoPedidoAction,
    initialAction,
  );
  const [comentState, comentAction, comentPending] = useActionState(
    agregarComentarioAction,
    initialAction,
  );
  const [pagoState, pagoDispatch, pagoPending] = useActionState(
    registrarPagoConComprobanteAction,
    initialPago,
  );
  const [facturaState, facturaDispatch, facturaPending] = useActionState(
    gestionarFacturaAction,
    initialFactura,
  );
  const [envioState, envioDispatch, envioPending] = useActionState(
    actualizarEnvioAction,
    initialAction,
  );
  const [comentario, setComentario] = useState("");
  const [pagoModalOpen, setPagoModalOpen] = useState(false);
  const [envioModalOpen, setEnvioModalOpen] = useState(false);
  const [facturaModalOpen, setFacturaModalOpen] = useState(false);
  const [comprobantePreview, setComprobantePreview] = useState<File | null>(
    null,
  );
  const [facturaPdfPreview, setFacturaPdfPreview] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      const res = await obtenerDetallePedidoAction(pedidoId);
      if (!cancelled) {
        setDetalle(res);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  useEffect(() => {
    if (estadoState.success && estadoState.message) {
      toast({ title: estadoState.message, variant: "success" });
      router.refresh();
      startTransition(async () => {
        const res = await obtenerDetallePedidoAction(pedidoId);
        setDetalle(res);
      });
    } else if (estadoState.error) {
      toast({
        title: "No se pudo cambiar el estado",
        description: estadoState.error,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoState]);

  useEffect(() => {
    if (comentState.success) {
      toast({ title: comentState.message ?? "Comentario agregado", variant: "success" });
      setComentario("");
      startTransition(async () => {
        const res = await obtenerDetallePedidoAction(pedidoId);
        setDetalle(res);
      });
    } else if (comentState.error) {
      toast({
        title: "No se pudo agregar el comentario",
        description: comentState.error,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comentState]);

  useEffect(() => {
    if (pagoState.success) {
      toast({ title: pagoState.message ?? "Pago registrado", variant: "success" });
      setPagoModalOpen(false);
      setComprobantePreview(null);
      startTransition(async () => {
        const res = await obtenerDetallePedidoAction(pedidoId);
        setDetalle(res);
      });
    } else if (pagoState.error) {
      toast({ title: "Error en pago", description: pagoState.error, variant: "error" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagoState]);

  useEffect(() => {
    if (facturaState.success) {
      toast({
        title: facturaState.message ?? "Factura actualizada",
        variant: "success",
      });
      setFacturaModalOpen(false);
      setFacturaPdfPreview(null);
      startTransition(async () => {
        const res = await obtenerDetallePedidoAction(pedidoId);
        setDetalle(res);
      });
    } else if (facturaState.error) {
      toast({
        title: "Error al gestionar factura",
        description: facturaState.error,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facturaState]);

  useEffect(() => {
    if (envioState.success) {
      toast({ title: envioState.message ?? "Guía de envío guardada", variant: "success" });
      setEnvioModalOpen(false);
      startTransition(async () => {
        const res = await obtenerDetallePedidoAction(pedidoId);
        setDetalle(res);
      });
    } else if (envioState.error) {
      toast({ title: "Error en guía de envío", description: envioState.error, variant: "error" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envioState]);

  if (!loaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!detalle.success || !detalle.data) {
    return (
      <Card>
        <p className="text-sm text-error">
          {detalle.error ?? "No se pudo cargar el pedido."}
        </p>
        <div className="mt-4">
          <Link
            href="/admin/pedidos"
            className="inline-flex h-10 items-center gap-2 rounded-button bg-transparent px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="size-4" />
            Volver a pedidos
          </Link>
        </div>
      </Card>
    );
  }

  const p = detalle.data;
  const estadoActual = p.estado as EstadoPedido;
  const transiciones = TRANSICIONES_PERMITIDAS[estadoActual] ?? [];
  const estadoOptions = [
    { value: "", label: `Actual: ${ESTADO_PEDIDO_LABEL[estadoActual]}` },
    ...transiciones.map((e) => ({
      value: e,
      label: `→ ${ESTADO_PEDIDO_LABEL[e]}`,
    })),
  ];

  const saldoPagado = p.pagos.reduce(
    (sum, pago) => sum + Number(pago.monto),
    0,
  );
  const totalItems = p.items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/pedidos"
            className="-ml-2 mb-2 inline-flex h-8 items-center gap-1.5 rounded-button bg-transparent px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="size-4" />
            Volver a pedidos
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Pedido {p.codigo}
            </h1>
            <EstadoPedidoBadge estado={p.estado} size="md" />
            <Badge variant="info">
              <Calendar className="size-3" />
              {new Date(p.fechaPedido).toLocaleDateString("es-CO", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {totalItems} {totalItems === 1 ? "producto" : "productos"} · Método de
            envío: {p.metodoEnvio}
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary-600" />
                Cambiar estado
              </div>
            }
          />
          <form action={estadoAction} className="space-y-3">
            <input type="hidden" name="pedidoId" value={p.id} />
            <Select
              name="estado"
              label="Nuevo estado"
              options={estadoOptions}
              error={estadoState.errors?.estado?.[0]}
              disabled={transiciones.length === 0 || estadoPending}
              helperText={
                transiciones.length === 0
                  ? "Este estado no tiene transiciones disponibles."
                  : "Solo se muestran los destinos permitidos según la máquina de estados."
              }
            />
            <Textarea
              name="descripcion"
              label="Nota interna (opcional)"
              placeholder="Motivo del cambio, instrucciones para el equipo..."
              rows={2}
              error={estadoState.errors?.descripcion?.[0]}
            />
            {estadoState.error && (
              <p className="rounded-input bg-red-50 p-2 text-xs text-red-700">
                {estadoState.error}
              </p>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={estadoPending || isPending}
                disabled={transiciones.length === 0}
              >
                <Clock className="size-4" />
                Actualizar estado
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <UserIcon className="size-4 text-primary-600" />
                  Información del cliente
                </div>
              }
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Nombre</p>
                <p className="font-semibold text-gray-900">
                  {p.cliente.nombre}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">WhatsApp</p>
                <a
                  href={`https://wa.me/${p.cliente.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary-600 hover:underline"
                >
                  {p.cliente.whatsapp}
                </a>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Correo</p>
                <p className="text-gray-800">{p.cliente.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Empresa</p>
                <p className="text-gray-800">{p.cliente.empresa || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Ciudad</p>
                <p className="text-gray-800">{p.cliente.ciudad || "—"}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-primary-600" />
                  Productos del pedido
                </div>
              }
              action={
                <Badge variant="neutral">{totalItems} unidades</Badge>
              }
            />
            <div className="overflow-hidden rounded-input border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-2 font-semibold">Producto</th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Precio
                    </th>
                    <th className="px-4 py-2 text-center font-semibold">
                      Cant.
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {p.items.map((it: any) => (
                    <tr
                      key={it.id}
                      className="border-t border-gray-50 align-top"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {it.nombreProducto}
                        </p>
                        {it.personalizaciones && (
                          <ul className="mt-1 space-y-0.5 text-xs text-gray-500">
                            {Object.entries(
                              it.personalizaciones as Record<string, any>,
                            ).map(([k, v]) => (
                              <li key={k}>
                                <span className="font-medium">{k}:</span>{" "}
                                {typeof v === "object"
                                  ? JSON.stringify(v)
                                  : String(v)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                        ${Number(it.precioUnitario).toLocaleString("es-CO")}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums text-gray-700">
                        {it.cantidad}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                        ${Number(it.subtotal).toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-100 bg-gray-50/50 text-sm">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right font-medium text-gray-700"
                    >
                      Total del pedido
                    </td>
                    <td className="px-4 py-3 text-right font-display text-lg font-bold text-gray-900 tabular-nums">
                      ${Number(p.total).toLocaleString("es-CO")}
                    </td>
                  </tr>
                  <tr className="text-xs">
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-right text-gray-500"
                    >
                      Saldo pendiente
                    </td>
                    <td
                      className={clsx(
                        "px-4 py-2 text-right font-semibold tabular-nums",
                        Number(p.saldoPendiente) > 0
                          ? "text-amber-700"
                          : "text-emerald-700",
                      )}
                    >
                      ${Number(p.saldoPendiente).toLocaleString("es-CO")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {p.observaciones && (
              <div className="mt-4 rounded-input bg-amber-50 p-3 border border-amber-100">
                <p className="text-xs font-semibold text-amber-800 mb-1">
                  Observaciones del cliente
                </p>
                <p className="text-sm text-amber-900 whitespace-pre-wrap">
                  {p.observaciones}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-primary-600" />
                  Historial de pagos
                </div>
              }
              action={
                <div className="flex items-center gap-2">
                  <Badge variant="success">
                    ${saldoPagado.toLocaleString("es-CO")} pagados
                  </Badge>
                  <Button size="sm" onClick={() => setPagoModalOpen(true)}>
                    + Registrar Pago
                  </Button>
                </div>
              }
            />
            {p.pagos.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aún no hay pagos registrados para este pedido.
              </p>
            ) : (
              <ul className="space-y-2">
                {p.pagos.map((pago: any) => (
                  <li
                    key={pago.id}
                    className="rounded-input border border-gray-100 bg-gray-50/50 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {TIPO_PAGO_LABEL[pago.tipo] ?? pago.tipo}
                            <span className="ml-2 text-xs font-normal text-gray-500">
                              · {pago.metodo}
                            </span>
                          </p>
                          {pago.comprobante && (
                            <a
                              href={pago.comprobante.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-6 items-center gap-1 rounded-lg bg-primary-50 px-2 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                              title="Ver comprobante de pago"
                            >
                              <FileCheck className="size-3.5" />
                              Comprobante
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(pago.fecha).toLocaleString("es-CO")}
                          {pago.usuario?.nombre &&
                            ` · Registro: ${pago.usuario.nombre}`}
                        </p>
                        {pago.notas && (
                          <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                            {pago.notas}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 font-display font-bold text-emerald-700 tabular-nums">
                        ${Number(pago.monto).toLocaleString("es-CO")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Receipt className="size-4 text-primary-600" />
                  Facturación
                </div>
              }
              action={
                <Button size="sm" variant="secondary" onClick={() => setFacturaModalOpen(true)}>
                  Gestionar
                </Button>
              }
            />
            {p.factura ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500">Estado</p>
                  <span
                    className={clsx(
                      "rounded-full border px-2 py-0.5 text-xs font-semibold",
                      ESTADO_FACTURA_COLOR[p.factura.estado],
                    )}
                  >
                    {ESTADO_FACTURA_LABEL[p.factura.estado]}
                  </span>
                </div>
                {p.factura.numero && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500">Número</p>
                    <p className="font-mono font-semibold text-gray-900">{p.factura.numero}</p>
                  </div>
                )}
                {p.factura.fechaEmision && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500">Fecha emisión</p>
                    <p className="text-gray-800">
                      {new Date(p.factura.fechaEmision).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                )}
                {p.factura.urlPdf && (
                  <a
                    href={p.factura.urlPdf}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-input border border-primary-100 bg-primary-50/50 px-3 py-2 hover:bg-primary-50"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary-600" />
                      <p className="text-sm font-semibold text-primary-800">
                        {p.factura.numero ? `Factura ${p.factura.numero}.pdf` : "Factura PDF"}
                      </p>
                    </div>
                    <Download className="size-4 text-primary-700" />
                  </a>
                )}
                {p.factura.notas && (
                  <div className="rounded-input bg-gray-50 p-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Notas</p>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{p.factura.notas}</p>
                  </div>
                )}
                {p.factura.usuario?.nombre && (
                  <p className="text-xs text-gray-500">
                    Última actualización: {p.factura.usuario.nombre}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-input border border-dashed border-amber-200 bg-amber-50/50 px-3 py-2">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">
                      Sin factura registrada
                    </p>
                    <p className="text-xs text-amber-700">
                      El pedido aún no tiene estado de facturación definido.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {p.archivos.length > 0 && (
            <Card>
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <Paperclip className="size-4 text-primary-600" />
                    Archivos adjuntos ({p.archivos.length})
                  </div>
                }
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {p.archivos.map((a: any) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-input border border-gray-200 p-3 hover:bg-gray-50"
                  >
                    <FileText className="size-5 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {a.nombre || "Archivo adjunto"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {a.tipo} · {a.origen === "CLIENTE" ? "Cliente" : "Producción"}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Truck className="size-4 text-primary-600" />
                  Envío
                </div>
              }
              action={
                <Button size="sm" variant="secondary" onClick={() => setEnvioModalOpen(true)}>
                  Gestionar Guía
                </Button>
              }
            />
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500">Método</p>
                <p className="font-semibold text-gray-900">
                  {p.metodoEnvio === "RECOGER"
                    ? "Recoger en tienda"
                    : p.metodoEnvio === "DOMICILIO"
                      ? "Domicilio"
                      : "Transportadora"}
                </p>
              </div>
              {p.envios?.[0] ? (
                <>
                  {p.envios[0].numeroGuia && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Número de guía
                      </p>
                      <p className="font-mono text-sm text-gray-900 font-bold">
                        {p.envios[0].numeroGuia}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Destinatario
                    </p>
                    <p className="text-gray-800">
                      {p.envios[0].destinatario || p.cliente.nombre}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Dirección
                    </p>
                    <p className="text-gray-800">
                      {p.envios[0].direccion || p.direccion || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Ciudad de envío
                    </p>
                    <p className="text-gray-800">
                      {p.envios[0].ciudad || p.ciudad}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Información de envío pendiente.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-primary-600" />
                  Comentario interno
                </div>
              }
            />
            <form action={comentAction} className="space-y-2">
              <input type="hidden" name="pedidoId" value={p.id} />
              <Textarea
                name="descripcion"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Nota para el equipo interno (ej: cliente confirmó cambio de talla)"
                rows={3}
                error={
                  comentState.error
                    ? undefined
                    : comentState.errors?.descripcion?.[0]
                }
              />
              {comentState.error && (
                <p className="text-xs text-error">{comentState.error}</p>
              )}
              <div className="flex justify-end">
                <Button type="submit" size="sm" loading={comentPending}>
                  <Send className="size-3.5" />
                  Registrar nota
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary-600" />
                  Timeline del pedido
                </div>
              }
            />
            <ol className="relative space-y-5 pl-6 before:absolute before:left-[11px] before:top-1 before:h-[calc(100%-1rem)] before:w-px before:bg-gray-200">
              {p.timeline.length === 0 && (
                <p className="text-sm text-gray-500">Sin eventos todavía.</p>
              )}
              {p.timeline.map((ev: any) => {
                const Icono = TIPO_ICON[ev.tipo as TipoEventoTimeline] ?? Clock;
                return (
                  <li key={ev.id} className="relative">
                    <span
                      className={clsx(
                        "absolute -left-6 top-0.5 flex size-[22px] items-center justify-center rounded-full border-2 border-white shadow",
                        ev.tipo === "CREACION_PEDIDO" && "bg-gray-500",
                        ev.tipo === "CAMBIO_ESTADO" && "bg-primary-500",
                        ev.tipo === "PAGO_REGISTRADO" && "bg-emerald-500",
                        ev.tipo === "COMENTARIO_INTERNO" && "bg-violet-500",
                        ev.tipo === "ARCHIVO_ADJUNTO" && "bg-amber-500",
                        ev.tipo === "ENVIO_GENERADO" && "bg-sky-500",
                        ev.tipo === "PRODUCCION_AVANCE" && "bg-indigo-500",
                      )}
                    >
                      <Icono className="size-3 text-white" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                          {TIPO_EVENTO_LABEL[ev.tipo] ?? ev.tipo}
                        </p>
                        {ev.estadoNuevo && (
                          <EstadoPedidoBadge
                            estado={ev.estadoNuevo}
                          />
                        )}
                      </div>
                      {ev.descripcion && (
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                          {ev.descripcion}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(ev.createdAt).toLocaleString("es-CO")}
                        {ev.usuario?.nombre && ` · ${ev.usuario.nombre}`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>
      </div>

      {/* Modal Registrar Pago */}
      <Modal
        open={pagoModalOpen}
        onClose={() => {
          setPagoModalOpen(false);
          setComprobantePreview(null);
        }}
        title="Registrar Pago"
        description={`Saldo pendiente actual: $${Number(p.saldoPendiente).toLocaleString("es-CO")}`}
      >
        <form action={pagoDispatch} className="space-y-4" encType="multipart/form-data">
          <input type="hidden" name="pedidoId" value={p.id} />
          <div className="space-y-2">
            <Select
              name="tipo"
              label="Tipo de pago"
              defaultValue="ABONO"
              options={[
                { value: "ANTICIPO", label: "Anticipo" },
                { value: "ABONO", label: "Abono parcial" },
                { value: "PAGO_FINAL", label: "Pago final / Cancela saldo" },
              ]}
              error={pagoState.errors?.tipo?.[0]}
            />
            <p className="text-xs text-gray-500">
              <AlertTriangle className="size-3 inline align-text-bottom mr-1 text-amber-500" />
              <strong>Pago final</strong> valida que el monto coincida exactamente con el saldo pendiente.
            </p>
          </div>
          <Input
            name="monto"
            label="Monto ($ COP)"
            type="number"
            step="1"
            min={0.01}
            defaultValue={Number(p.saldoPendiente) > 0 ? Number(p.saldoPendiente) : undefined}
            placeholder="0"
            required
            error={pagoState.errors?.monto?.[0]}
          />
          <Select
            name="metodo"
            label="Método de pago"
            defaultValue="Transferencia Bancaria"
            options={[
              { value: "Transferencia Bancaria", label: "Transferencia Bancaria" },
              { value: "Nequi", label: "Nequi" },
              { value: "Daviplata", label: "Daviplata" },
              { value: "Efectivo", label: "Efectivo" },
              { value: "Tarjeta Débito/Crédito", label: "Tarjeta Débito / Crédito" },
              { value: "Cheque", label: "Cheque" },
            ]}
            error={pagoState.errors?.metodo?.[0]}
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Fecha (opcional, por defecto ahora)
            </label>
            <input
              type="datetime-local"
              name="fecha"
              className="h-10 w-full rounded-input border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <Textarea
            name="notas"
            label="Notas internas (opcional)"
            placeholder="Referencia de pago, número de transacción, observaciones..."
            rows={2}
            error={pagoState.errors?.notas?.[0]}
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Comprobante de pago (imagen o PDF · opcional)
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-input border-2 border-dashed border-gray-300 bg-gray-50/50 px-4 py-5 hover:border-primary-300 hover:bg-primary-50/30">
              <Upload className="size-5 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {comprobantePreview ? comprobantePreview.name : "Subir comprobante"}
                </p>
                <p className="text-xs text-gray-500">
                  Máximo 5 MB · JPG, PNG, WebP o PDF
                </p>
              </div>
              <input
                type="file"
                name="comprobante"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setComprobantePreview(file);
                }}
              />
            </label>
            {comprobantePreview && (
              <p className="mt-1 text-xs text-primary-700">
                ✓ Archivo seleccionado: {comprobantePreview.name} (
                {(comprobantePreview.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          {pagoState.error && (
            <div className="rounded-input bg-red-50 p-3 border border-red-200">
              <p className="text-xs font-semibold text-red-800">No se pudo registrar el pago</p>
              <p className="text-xs text-red-700 mt-0.5 whitespace-pre-wrap">{pagoState.error}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setPagoModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pagoPending}>
              Guardar Pago
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Gestionar Guía */}
      <Modal
        open={envioModalOpen}
        onClose={() => setEnvioModalOpen(false)}
        title="Gestionar Guía de Envío"
        description={`Registra o actualiza el número de guía para el pedido ${p.codigo}`}
      >
        <form action={envioDispatch} className="space-y-4">
          <input type="hidden" name="pedidoId" value={p.id} />
          <Input
            name="numeroGuia"
            label="Número de guía"
            defaultValue={p.envios?.[0]?.numeroGuia || ""}
            placeholder="Ej: 1234567890"
            required
          />
          <Select
            name="estadoGuia"
            label="Estado de la guía"
            defaultValue={p.envios?.[0]?.estadoGuia || "GENERADA"}
            options={[
              { value: "GENERADA", label: "Generada / Lista" },
              { value: "EN_TRANSITO", label: "En tránsito" },
              { value: "ENTREGADA", label: "Entregada" },
              { value: "DEVUELTA", label: "Devuelta" },
            ]}
          />
          <Input
            name="enlaceRastreo"
            label="Enlace de rastreo (opcional)"
            defaultValue={p.envios?.[0]?.enlaceRastreo || ""}
            placeholder="https://transportadora.com/rastreo?guia=..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEnvioModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={envioPending}>
              Guardar Guía
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Gestionar Factura */}
      <Modal
        open={facturaModalOpen}
        onClose={() => {
          setFacturaModalOpen(false);
          setFacturaPdfPreview(null);
        }}
        title="Gestionar Facturación"
        description={`Facturación del pedido ${p.codigo} · Total: $${Number(p.total).toLocaleString("es-CO")}`}
      >
        <form action={facturaDispatch} className="space-y-4" encType="multipart/form-data">
          <input type="hidden" name="pedidoId" value={p.id} />
          <Select
            name="estado"
            label="Estado de facturación"
            defaultValue={p.factura?.estado || "PENDIENTE"}
            options={[
              { value: "PENDIENTE", label: "Pendiente por emitir" },
              { value: "EMITIDA", label: "Emitida (factura enviada)" },
              { value: "ANULADA", label: "Anulada" },
            ]}
            error={facturaState.errors?.estado?.[0]}
          />
          <Input
            name="numero"
            label="Número de factura (opcional)"
            defaultValue={p.factura?.numero || ""}
            placeholder="Ej: FV-2026-00042"
            error={facturaState.errors?.numero?.[0]}
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              PDF de factura (solo PDF · opcional)
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-input border-2 border-dashed border-gray-300 bg-gray-50/50 px-4 py-5 hover:border-primary-300 hover:bg-primary-50/30">
              <Upload className="size-5 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {facturaPdfPreview ? facturaPdfPreview.name : p.factura?.urlPdf ? "Reemplazar PDF existente" : "Subir factura PDF"}
                </p>
                <p className="text-xs text-gray-500">
                  Máximo 10 MB · solo PDF
                </p>
              </div>
              <input
                type="file"
                name="facturaPdf"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setFacturaPdfPreview(file);
                }}
              />
            </label>
            {facturaPdfPreview && (
              <p className="mt-1 text-xs text-primary-700">
                ✓ Archivo seleccionado: {facturaPdfPreview.name} (
                {(facturaPdfPreview.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {!facturaPdfPreview && p.factura?.urlPdf && (
              <p className="mt-1 text-xs text-gray-500">
                Ya hay un PDF cargado. Si no seleccionas uno nuevo, se conservará el actual.
              </p>
            )}
          </div>
          <Textarea
            name="notas"
            label="Notas de facturación (opcional)"
            defaultValue={p.factura?.notas || ""}
            placeholder="Observaciones fiscales, retenciones, resolución DIAN..."
            rows={2}
            error={facturaState.errors?.notas?.[0]}
          />
          {facturaState.error && (
            <div className="rounded-input bg-red-50 p-3 border border-red-200">
              <p className="text-xs font-semibold text-red-800">No se pudo actualizar la factura</p>
              <p className="text-xs text-red-700 mt-0.5 whitespace-pre-wrap">{facturaState.error}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setFacturaModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={facturaPending}>
              Guardar Factura
            </Button>
          </div>
        </form>
      </Modal>

      <ProduccionSection pedidoId={p.id} />
    </div>
  );
}

