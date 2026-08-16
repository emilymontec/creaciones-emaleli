"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  CreditCard,
  DollarSign,
  Eye,
  ArrowUpRight,
  FileCheck,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { Table, type TableColumn } from "@/src/frontend/components/ui/Table";
import { Badge } from "@/src/frontend/components/ui/Badge";
import {
  obtenerPanelPagosAction,
  type PagosGeneralState,
} from "@/src/backend/modules/pagos/actions/managePagos";
import { TIPO_PAGO_LABEL } from "@/src/backend/modules/pagos/schemas/pago.schema";
import clsx from "clsx";

export function PagosPanel() {
  const [panel, setPanel] = useState<PagosGeneralState>({ success: false });

  useEffect(() => {
    let cancelled = false;
    obtenerPanelPagosAction().then((res) => {
      if (!cancelled) setPanel(res);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!panel.success || !panel.resumen || !panel.pagos) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-sm text-error">
            {panel.error ?? "No se pudo cargar el panel de pagos."}
          </p>
        </Card>
      </div>
    );
  }

  const { resumen, pagos } = panel;

  const columns: TableColumn<(typeof pagos)[0]>[] = [
    {
      key: "codigo",
      header: "Pedido",
      render: (r) => (
        <div>
          <Link
            href={`/admin/pedidos/${r.pedidoId}`}
            className="font-semibold text-primary-600 hover:underline"
          >
            {r.pedido.codigo}
          </Link>
          <p className="text-xs text-gray-500 truncate max-w-[220px]">
            {r.pedido.cliente.nombre}
          </p>
        </div>
      ),
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (r) => (
        <Badge
          variant={
            r.tipo === "PAGO_FINAL"
              ? "success"
              : r.tipo === "ANTICIPO"
                ? "info"
                : "neutral"
          }
        >
          {TIPO_PAGO_LABEL[r.tipo]}
        </Badge>
      ),
    },
    {
      key: "metodo",
      header: "Método",
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
          {r.comprobante && (
            <Link
              href={r.comprobante.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary-600 hover:text-primary-800"
              title={`Comprobante: ${r.comprobante.nombre || "adjunto"}`}
            >
              <FileCheck className="size-3.5" />
            </Link>
          )}
          <span>{r.metodo}</span>
        </span>
      ),
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (r) => (
        <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">
          {new Date(r.fecha).toLocaleString("es-CO", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "monto",
      header: "Monto",
      className: "text-right font-bold text-emerald-700 tabular-nums",
      render: (r) => `$${Number(r.monto).toLocaleString("es-CO")}`,
    },
    {
      key: "saldo",
      header: "Saldo pedido",
      className: "text-right tabular-nums",
      render: (r) => {
        const saldo = Number(r.pedido.saldoPendiente);
        return (
          <span
            className={clsx(
              "text-xs font-semibold",
              saldo > 0 ? "text-amber-700" : "text-emerald-700",
            )}
          >
            ${saldo.toLocaleString("es-CO")}
          </span>
        );
      },
    },
  ];

  const anticipos = resumen.porTipo.ANTICIPO;
  const abonos = resumen.porTipo.ABONO;
  const pagofinal = resumen.porTipo.PAGO_FINAL;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="size-6 text-primary-600" /> Control Financiero y Pagos
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Registro de anticipos, abonos, liquidaciones, facturación y control de saldos por cobrar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500">Total Facturado</p>
            <p className="font-display text-2xl font-bold text-gray-900 tabular-nums truncate">
              ${resumen.totalFacturado.toLocaleString("es-CO")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {resumen.cantidadPedidos} pedidos
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <ArrowUpRight className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500">Pagos Recibidos</p>
            <p className="font-display text-2xl font-bold text-primary-700 tabular-nums truncate">
              ${resumen.totalPagado.toLocaleString("es-CO")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {pagos.length} movimientos
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CreditCard className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500">Saldo por Cobrar</p>
            <p className="font-display text-2xl font-bold text-amber-800 tabular-nums truncate">
              ${resumen.saldoPorCobrar.toLocaleString("es-CO")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {resumen.totalFacturado > 0
                ? `${((resumen.saldoPorCobrar / resumen.totalFacturado) * 100).toFixed(1)}% pendiente`
                : "—"}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <TrendingDown className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500">Cobro promedio / anticipo</p>
            <p className="font-display text-2xl font-bold text-violet-800 tabular-nums truncate">
              ${anticipos?.cantidad
                ? Math.round((anticipos.monto) / anticipos.cantidad).toLocaleString("es-CO")
                : "0"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {anticipos?.cantidad ?? 0} anticipos registrados
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 border-l-4 border-l-sky-400">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                Anticipos
              </p>
              <p className="font-display text-xl font-bold text-gray-900 mt-1 tabular-nums">
                ${(anticipos?.monto ?? 0).toLocaleString("es-CO")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-4 text-sky-600" />
              <Badge variant="info">{anticipos?.cantidad ?? 0}</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-400">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Abonos Parciales
              </p>
              <p className="font-display text-xl font-bold text-gray-900 mt-1 tabular-nums">
                ${(abonos?.monto ?? 0).toLocaleString("es-CO")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-4 text-indigo-600" />
              <Badge variant="neutral">{abonos?.cantidad ?? 0}</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-400">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Pagos Finales / Cancelados
              </p>
              <p className="font-display text-xl font-bold text-gray-900 mt-1 tabular-nums">
                ${(pagofinal?.monto ?? 0).toLocaleString("es-CO")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <Badge variant="success">{pagofinal?.cantidad ?? 0}</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-gray-900">
              Historial General de Pagos
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Cada pago puede tener un comprobante adjunto y queda ligado al pedido y saldo pendiente.
            </p>
          </div>
          <Badge variant="neutral">{pagos.length} registros</Badge>
        </div>

        <Table
          columns={columns}
          data={pagos}
          rowKey={(r) => r.id}
          actions={(r) => (
            <div className="flex items-center gap-1">
              {r.comprobante && (
                <Link
                  href={r.comprobante.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-button bg-transparent px-2.5 text-xs font-semibold text-primary-700 hover:bg-primary-50"
                  title={r.comprobante.nombre || "Ver comprobante"}
                >
                  <FileCheck className="size-3.5" />
                  Comprobante
                </Link>
              )}
              <Link
                href={`/admin/pedidos/${r.pedidoId}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-button bg-transparent px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                <Eye className="size-4" /> Ver Pedido
              </Link>
            </div>
          )}
          emptyTitle="No hay pagos registrados aún"
          emptyDescription="Los pagos registrados en los pedidos aparecerán en este historial."
        />
      </Card>
    </div>
  );
}
