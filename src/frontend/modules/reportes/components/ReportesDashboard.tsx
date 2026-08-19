"use client";

import { useState, useTransition } from "react";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  PackageX,
  MapPin,
  Clock,
  Users,
  UserPlus,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card } from "@/src/frontend/components/ui/Card";
import { Badge, type BadgeVariant } from "@/src/frontend/components/ui/Badge";
import { StatCard } from "@/src/frontend/components/ui/StatCard";
import { Input } from "@/src/frontend/components/ui/Input";
import { Select } from "@/src/frontend/components/ui/Select";
import { Button } from "@/src/frontend/components/ui/Button";
import {
  obtenerReportesAction,
  exportarReportesCsvAction,
} from "@/src/backend/modules/reportes/actions/manageReportes";
import type { ReportesFiltros } from "@/src/backend/modules/reportes/schemas/reportes.schema";
import type { ReportesData } from "@/src/backend/modules/reportes/services/reportes.service";
import { useToast } from "@/src/frontend/providers/ToastProvider";

const ESTADO_COLOR: Record<string, BadgeVariant> = {
  NUEVO: "info",
  EN_REVISION: "warning",
  ESPERANDO_CLIENTE: "warning",
  DISENO_APROBADO: "primary",
  EN_PRODUCCION: "primary",
  EMPACADO: "warning",
  ENVIADO: "info",
  ENTREGADO: "success",
  CANCELADO: "error",
};

function formatCOP(n: number) {
  return `$${Math.round(n).toLocaleString("es-CO")}`;
}

function formatPeriodo(iso: string, agrupacion: string) {
  const d = new Date(iso);
  if (agrupacion === "dia") {
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  }
  if (agrupacion === "mes") {
    return d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
  }
  return d.getFullYear().toString();
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ReportesDashboard({
  initialData,
  categorias,
}: {
  initialData: ReportesData;
  categorias: { id: string; nombre: string }[];
}) {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);
  const [filtros, setFiltros] = useState<ReportesFiltros>({});
  const [isPending, startTransition] = useTransition();
  const [exportando, setExportando] = useState(false);

  function aplicarFiltros(nuevos: ReportesFiltros) {
    setFiltros(nuevos);
    startTransition(async () => {
      const result = await obtenerReportesAction(nuevos);
      if (result.success) {
        setData(result.data);
      } else {
        toast({
          title: "No se pudieron cargar los reportes",
          description: result.error,
          variant: "error",
        });
      }
    });
  }

  async function handleExport() {
    setExportando(true);
    try {
      const result = await exportarReportesCsvAction(filtros);
      if (result.success) {
        downloadCsv(
          result.csv,
          `reportes-emaleli-${new Date().toISOString().slice(0, 10)}.csv`,
        );
      } else {
        toast({
          title: "No se pudo exportar",
          description: result.error,
          variant: "error",
        });
      }
    } finally {
      setExportando(false);
    }
  }

  const chartData = data.ventas.map((v) => ({
    periodo: formatPeriodo(v.periodo, data.agrupacion),
    total: v.total,
    pedidos: v.pedidos,
  }));

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
          <Input
            label="Desde"
            type="date"
            className="max-w-[180px]"
            onChange={(e) =>
              aplicarFiltros({
                ...filtros,
                fechaInicio: e.target.value || undefined,
              })
            }
          />
          <Input
            label="Hasta"
            type="date"
            className="max-w-[180px]"
            onChange={(e) =>
              aplicarFiltros({
                ...filtros,
                fechaFin: e.target.value || undefined,
              })
            }
          />
          <Select
            label="Categoría"
            className="max-w-[220px]"
            options={[
              { value: "", label: "Todas las categorías" },
              ...categorias.map((c) => ({ value: c.id, label: c.nombre })),
            ]}
            onChange={(e) =>
              aplicarFiltros({
                ...filtros,
                categoriaId: e.target.value || undefined,
              })
            }
          />
          <div className="flex-1" />
          <Button
            type="button"
            variant="secondary"
            onClick={handleExport}
            disabled={exportando}
          >
            <Download className="size-4" />
            {exportando ? "Generando..." : "Exportar CSV"}
          </Button>
        </div>
        {isPending && (
          <p className="mt-2 text-xs text-gray-400">Actualizando reportes...</p>
        )}
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Ventas en el período"
          value={formatCOP(data.resumen.ventasTotales)}
          hint={`Agrupado por ${data.agrupacion}`}
          icon={TrendingUp}
          iconClass="bg-gradient-to-br from-emerald-100 to-secondary-100 text-emerald-600"
        />
        <StatCard
          label="Pedidos en el período"
          value={data.resumen.pedidosTotales}
          hint="Pedidos registrados"
          icon={ShoppingBag}
          iconClass="bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 text-primary-700"
        />
        <StatCard
          label="Ticket promedio"
          value={formatCOP(data.resumen.ticketPromedio)}
          hint="Valor medio por pedido"
          icon={DollarSign}
          iconClass="bg-gradient-to-br from-violet-100 to-primary-100 text-violet-600"
        />
      </div>

      {/* Tendencia de ventas */}
      <Card className="p-5">
        <h3 className="mb-4 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="size-5 text-primary-600" /> Tendencia de ventas
        </h3>
        {chartData.length === 0 ? (
          <p className="text-xs text-gray-400">
            Sin ventas en el período seleccionado.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ left: 0, right: 10, top: 5, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="periodo"
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const numeric =
                      typeof value === "number" ? value : Number(value ?? 0);
                    return name === "total"
                      ? [formatCOP(numeric), "Ventas"]
                      : [numeric, "Pedidos"];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-primary-500, #6d5ce7)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Productos más vendidos */}
        <RankingCard
          title="Productos más vendidos"
          icon={Package}
          items={data.productosMasVendidos}
          emptyText="Sin ventas registradas en el período."
        />
        {/* Productos menos vendidos */}
        <RankingCard
          title="Productos menos vendidos"
          icon={PackageX}
          items={data.productosMenosVendidos}
          emptyText="Sin ventas registradas en el período."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Pedidos por estado */}
        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary-600" /> Pedidos por
            estado
          </h3>
          {data.pedidosEstado.length === 0 ? (
            <p className="text-xs text-gray-400">Sin pedidos en el período.</p>
          ) : (
            <div className="space-y-2">
              {data.pedidosEstado.map((e) => (
                <div
                  key={e.estado}
                  className="flex items-center justify-between rounded-input border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-2.5 text-xs"
                >
                  <span className="font-bold text-gray-700">{e.estado}</span>
                  <Badge variant={ESTADO_COLOR[e.estado] ?? "neutral"}>
                    {e.cantidad} pedidos
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pedidos por ciudad */}
        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="size-5 text-primary-600" /> Pedidos por ciudad
          </h3>
          {data.pedidosCiudad.length === 0 ? (
            <p className="text-xs text-gray-400">Sin pedidos en el período.</p>
          ) : (
            <ul className="space-y-2">
              {data.pedidosCiudad.map((c) => (
                <li
                  key={c.ciudad}
                  className="flex items-center justify-between text-xs border-b border-gray-50 pb-2 last:border-0"
                >
                  <span className="font-medium text-gray-700">
                    {c.ciudad || "Sin especificar"}
                  </span>
                  <span className="font-bold text-gray-900">{c.cantidad}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Tiempo promedio por etapa */}
      <Card className="p-5">
        <h3 className="mb-4 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="size-5 text-primary-600" /> Tiempo promedio por
          etapa
        </h3>
        {data.tiempoPorEtapa.length === 0 ? (
          <p className="text-xs text-gray-400">
            Aún no hay suficiente historial de cambios de estado para calcular
            tiempos.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.tiempoPorEtapa.map((t) => (
              <div
                key={t.estado}
                className="rounded-input border border-gray-100 p-3 text-center"
              >
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  {t.estado}
                </p>
                <p className="mt-1 text-lg font-extrabold text-gray-900">
                  {t.horasPromedio < 24
                    ? `${t.horasPromedio.toFixed(1)}h`
                    : `${(t.horasPromedio / 24).toFixed(1)}d`}
                </p>
                <p className="text-[10px] text-gray-400">
                  {t.muestras} muestra(s)
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Clientes frecuentes */}
        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
            <Users className="size-5 text-primary-600" /> Clientes frecuentes
          </h3>
          {data.clientesFrecuentes.length === 0 ? (
            <p className="text-xs text-gray-400">
              Sin datos suficientes en el período.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.clientesFrecuentes.map((c, idx) => (
                <li
                  key={c.cliente?.id ?? `sin-cliente-${idx}`}
                  className="flex items-center justify-between text-xs border-b border-gray-50 pb-2 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-800">
                      {c.cliente?.nombre ?? "Cliente eliminado"}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {c.cliente?.ciudad}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">
                      {c.pedidos} pedidos
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {formatCOP(c.totalGastado)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Clientes nuevos */}
        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus className="size-5 text-primary-600" /> Clientes nuevos en
            el período
          </h3>
          <p className="mb-3 text-2xl font-extrabold text-gray-900">
            {data.clientesNuevos.total}
          </p>
          {data.clientesNuevos.ultimos.length > 0 && (
            <ul className="space-y-1.5">
              {data.clientesNuevos.ultimos.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-gray-700">{c.nombre}</span>
                  <span className="text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("es-CO")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function RankingCard({
  title,
  icon: Icon,
  items,
  emptyText,
}: {
  title: string;
  icon: typeof Package;
  items: { nombreProducto: string; cantidad: number; total: number }[];
  emptyText: string;
}) {
  const maxCantidad = Math.max(...items.map((p) => p.cantidad), 1);

  return (
    <Card className="p-5">
      <h3 className="mb-4 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
        <Icon className="size-5 text-primary-600" /> {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, idx) => {
            const pct = Math.round((item.cantidad / maxCantidad) * 100);
            return (
              <li
                key={item.nombreProducto}
                className="border-b border-gray-100 pb-2 text-sm last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 text-xs font-bold text-primary-700">
                      {idx + 1}
                    </span>
                    <span className="truncate font-medium text-gray-900">
                      {item.nombreProducto}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-gray-900">
                      {item.cantidad} unid.
                    </span>
                    <p className="text-[11px] text-gray-400">
                      {formatCOP(item.total)}
                    </p>
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-gray-100">
                  <div
                    className="h-full rounded-pill bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
