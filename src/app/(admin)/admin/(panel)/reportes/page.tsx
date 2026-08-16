import type { Metadata } from "next";
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Package } from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { Badge, type BadgeVariant } from "@/src/frontend/components/ui/Badge";
import { StatCard } from "@/src/frontend/components/ui/StatCard";
import { PageHeader } from "@/src/frontend/components/shared/PageHeader";
import { prisma } from "@/src/backend/shared/prisma";

export const metadata: Metadata = {
  title: "Reportes y Analíticas | Emaleli Admin",
};

export default async function ReportesAdminPage() {
  const [totalVentas, totalPedidos, productosMasVendidos, pedidosPorEstado] = await Promise.all([
    prisma.pedido.aggregate({
      _sum: { total: true },
      _avg: { total: true },
    }),
    prisma.pedido.count(),
    prisma.itemPedido.groupBy({
      by: ["nombreProducto"],
      _sum: { cantidad: true, subtotal: true },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 5,
    }),
    prisma.pedido.groupBy({
      by: ["estado"],
      _count: { estado: true },
    }),
  ]);

  const ventasTotales = Number(totalVentas._sum.total ?? 0);
  const ticketPromedio = Number(totalVentas._avg.total ?? 0);

  const maxCantidad = Math.max(
    ...productosMasVendidos.map((p) => Number(p._sum.cantidad ?? 0)),
    1,
  );

  const ESTADO_COLOR: Record<string, BadgeVariant> = {
    NUEVO: "info",
    EN_REVISION: "warning",
    EN_PRODUCCION: "primary",
    EMPACADO: "warning",
    ENVIADO: "info",
    ENTREGADO: "success",
    CANCELADO: "error",
    DEVUELTO: "error",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Reportes de Negocio"
        description="Métricas clave de rendimiento, ventas acumuladas y análisis de catálogo."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Ventas Acumuladas"
          value={`$${ventasTotales.toLocaleString("es-CO")}`}
          hint="Total histórico"
          icon={TrendingUp}
          iconClass="bg-gradient-to-br from-emerald-100 to-secondary-100 text-emerald-600"
        />

        <StatCard
          label="Total de Pedidos"
          value={totalPedidos}
          hint="Pedidos registrados"
          icon={ShoppingBag}
          iconClass="bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 text-primary-700"
        />

        <StatCard
          label="Ticket Promedio"
          value={`$${Math.round(ticketPromedio).toLocaleString("es-CO")}`}
          hint="Valor medio por pedido"
          icon={DollarSign}
          iconClass="bg-gradient-to-br from-violet-100 to-primary-100 text-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
            <Package className="size-5 text-primary-600" /> Productos Más Solicitados
          </h3>
          {productosMasVendidos.length === 0 ? (
            <p className="text-xs text-gray-400">Sin ventas registradas aún.</p>
          ) : (
            <ul className="space-y-3">
              {productosMasVendidos.map((item, idx) => {
                const cantidad = Number(item._sum.cantidad ?? 0);
                const pct = Math.round((cantidad / maxCantidad) * 100);
                return (
                  <li key={item.nombreProducto} className="border-b border-gray-100 pb-2 text-sm last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 text-xs font-bold text-primary-700">
                          {idx + 1}
                        </span>
                        <span className="truncate font-medium text-gray-900">
                          {item.nombreProducto}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{cantidad} unid.</span>
                        <p className="text-[11px] text-gray-400">
                          ${Number(item._sum.subtotal ?? 0).toLocaleString("es-CO")}
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

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="size-5 text-primary-600" /> Pedidos por Estado
          </h3>
          <div className="space-y-2">
            {pedidosPorEstado.map((e) => (
              <div
                key={e.estado}
                className="flex items-center justify-between rounded-input border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-2.5 text-xs"
              >
                <span className="font-bold text-gray-700">{e.estado}</span>
                <Badge variant={ESTADO_COLOR[e.estado] ?? "neutral"}>
                  {e._count.estado} pedidos
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
