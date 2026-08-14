import type { Metadata } from "next";
import { BarChart3, TrendingUp, ShoppingBag, MapPin, DollarSign, Package } from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { Badge } from "@/src/frontend/components/ui/Badge";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="size-6 text-primary-600" /> Reportes de Negocio
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Métricas clave de rendimiento, ventas acumuladas y análisis de catálogo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Ventas Acumuladas</p>
            <p className="font-display text-2xl font-bold text-gray-900">
              ${ventasTotales.toLocaleString("es-CO")}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <ShoppingBag className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total de Pedidos</p>
            <p className="font-display text-2xl font-bold text-gray-900">{totalPedidos}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <DollarSign className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Ticket Promedio</p>
            <p className="font-display text-2xl font-bold text-gray-900">
              ${Math.round(ticketPromedio).toLocaleString("es-CO")}
            </p>
          </div>
        </Card>
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
              {productosMasVendidos.map((item, idx) => (
                <li key={item.nombreProducto} className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-900">{item.nombreProducto}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{item._sum.cantidad} unid.</span>
                    <p className="text-[11px] text-gray-400">${Number(item._sum.subtotal ?? 0).toLocaleString("es-CO")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="size-5 text-primary-600" /> Pedidos por Estado
          </h3>
          <div className="space-y-2">
            {pedidosPorEstado.map((e) => (
              <div key={e.estado} className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5 text-xs">
                <span className="font-bold text-gray-700">{e.estado}</span>
                <Badge variant="info">{e._count.estado} pedidos</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
