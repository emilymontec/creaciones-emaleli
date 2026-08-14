import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Package, Tag, Wallet } from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { obtenerDashboardMetricas } from "@/src/backend/modules/dashboard/actions/getDashboard";

export const metadata: Metadata = {
  title: "Dashboard | Emaleli Admin",
};

export default async function DashboardPage() {
  const m = await obtenerDashboardMetricas();

  const METRICS = [
    {
      label: "Pedidos nuevos",
      value: m.pedidosNuevos.toString(),
      icon: ClipboardList,
      href: "/admin/pedidos?estado=NUEVO",
    },
    {
      label: "Productos activos",
      value: m.productosActivos.toString(),
      icon: Package,
      href: "/admin/productos",
    },
    {
      label: "Categorías",
      value: m.categoriasActivas.toString(),
      icon: Tag,
      href: "/admin/categorias",
    },
    {
      label: "Saldo por cobrar",
      value: `$${m.saldoPorCobrar.toLocaleString("es-CO")}`,
      icon: Wallet,
      href: "/admin/pagos",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen general de la operación de Creaciones Emaleli.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className="transition-transform hover:-translate-y-0.5"
          >
            <Card className="flex items-center gap-4 h-full">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-input bg-primary-50 text-primary-600">
                <metric.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {metric.label}
                </p>
                <p className="font-display text-xl font-bold text-gray-900">
                  {metric.value}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
