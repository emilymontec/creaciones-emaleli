"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  DollarSign,
  ArrowUpRight,
  CreditCard,
  TrendingDown,
  Eye,
  FileCheck,
  CircleDollarSign,
  Banknote,
  BadgeCheck,
} from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { Table, type TableColumn } from "@/src/frontend/components/ui/Table";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { StatCard } from "@/src/frontend/components/ui/StatCard";
import { PageHeader } from "@/src/frontend/components/shared/PageHeader";
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
      <PageHeader
        icon={Wallet}
        title="Control Financiero y Pagos"
        description="Registro de anticipos, abonos, liquidaciones, facturación y control de saldos por cobrar."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Facturado"
          value={`$${resumen.totalFacturado.toLocaleString("es-CO")}`}
          hint={`${resumen.cantidadPedidos} pedidos`}
          icon={DollarSign}
          iconClass="bg-gradient-to-br from-emerald-100 to-secondary-100 text-emerald-600"
        />
        <StatCard
          label="Pagos Recibidos"
          value={`$${resumen.totalPagado.toLocaleString("es-CO")}`}
          hint={`${pagos.length} movimientos`}
          icon={ArrowUpRight}
          iconClass="bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 text-primary-700"
        />
        <StatCard
          label="Saldo por Cobrar"
          value={`$${resumen.saldoPorCobrar.toLocaleString("es-CO")}`}
          hint={
            resumen.totalFacturado > 0
              ? `${((resumen.saldoPorCobrar / resumen.totalFacturado) * 100).toFixed(1)}% pendiente`
              : "—"
          }
          icon={CreditCard}
          iconClass="bg-gradient-to-br from-amber-100 to-coral-100 text-amber-600"
        />
        <StatCard
          label="Cobro promedio / anticipo"
          value={
            anticipos?.cantidad
              ? Math.round(anticipos.monto / anticipos.cantidad).toLocaleString(
                  "es-CO",
                )
              : "0"
          }
          hint={`${anticipos?.cantidad ?? 0} anticipos registrados`}
          icon={TrendingDown}
          iconClass="bg-gradient-to-br from-violet-100 to-primary-100 text-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Anticipos"
          value={`$${(anticipos?.monto ?? 0).toLocaleString("es-CO")}`}
          hint={`${anticipos?.cantidad ?? 0} registrados`}
          icon={CircleDollarSign}
          iconClass="bg-gradient-to-br from-sky-100 to-primary-100 text-sky-600"
        />
        <StatCard
          label="Abonos Parciales"
          value={`$${(abonos?.monto ?? 0).toLocaleString("es-CO")}`}
          hint={`${abonos?.cantidad ?? 0} registrados`}
          icon={Banknote}
          iconClass="bg-gradient-to-br from-indigo-100 to-primary-100 text-indigo-600"
        />
        <StatCard
          label="Pagos Finales / Cancelados"
          value={`$${(pagofinal?.monto ?? 0).toLocaleString("es-CO")}`}
          hint={`${pagofinal?.cantidad ?? 0} registrados`}
          icon={BadgeCheck}
          iconClass="bg-gradient-to-br from-emerald-100 to-secondary-100 text-emerald-600"
        />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-gray-900">
              Historial General de Pagos
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Cada pago puede tener un comprobante adjunto y queda ligado al
              pedido y saldo pendiente.
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
