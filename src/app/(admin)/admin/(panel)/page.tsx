import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Package,
  Tag,
  Wallet,
  LayoutDashboard,
  Plus,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/src/frontend/components/ui/StatCard";
import { obtenerDashboardMetricas } from "@/src/backend/modules/dashboard/actions/getDashboard";

export const metadata: Metadata = {
  title: "Dashboard Administrativo",
};

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function DashboardPage() {
  const m = await obtenerDashboardMetricas();

  const METRICS = [
    {
      label: "Pedidos nuevos",
      value: m.pedidosNuevos.toString(),
      hint: "En cola de atención",
      icon: ClipboardList,
      href: "/admin/pedidos?estado=NUEVO",
      iconClass:
        "bg-gradient-to-br from-coral-100 to-accent-100 text-coral-600",
    },
    {
      label: "Productos activos",
      value: m.productosActivos.toString(),
      hint: "En catálogo",
      icon: Package,
      href: "/admin/productos",
      iconClass:
        "bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 text-primary-700",
    },
    {
      label: "Categorías",
      value: m.categoriasActivas.toString(),
      hint: "Activas en tienda",
      icon: Tag,
      href: "/admin/categorias",
      iconClass:
        "bg-gradient-to-br from-secondary-100 to-primary-100 text-secondary-700",
    },
    {
      label: "Saldo por cobrar",
      value: `$${m.saldoPorCobrar.toLocaleString("es-CO")}`,
      hint: "Pendiente de liquidar",
      icon: Wallet,
      href: "/admin/pagos",
      iconClass: "bg-gradient-to-br from-amber-100 to-coral-100 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de bienvenida con degradado de marca */}
      <section className="relative overflow-hidden rounded-modal bg-gradient-to-r from-accent-600 via-primary-600 to-secondary-600 px-6 py-7 text-white shadow-elevated sm:px-8">
        <div
          className="absolute -right-16 -top-20 size-60 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-white/5 blur-2xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest backdrop-blur">
              <LayoutDashboard className="size-3.5" />
              Creaciones Emaleli | Administración
            </span>
            <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
              Resumen de tu operación
            </h1>
            <p className="mt-1 text-sm capitalize text-white/80">
              {dateFormatter.format(new Date())}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/pedidos?estado=NUEVO"
              className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-white px-5 text-sm font-bold text-accent-700 shadow-card transition-transform hover:scale-105 active:scale-95"
            >
              <Plus className="size-4" /> Atender pedidos
            </Link>
            <Link
              href="/admin/productos"
              className="inline-flex h-10 items-center gap-1.5 rounded-pill border-2 border-white/40 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              Catálogo <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            icon={metric.icon}
            href={metric.href}
            iconClass={metric.iconClass}
          />
        ))}
      </div>
    </div>
  );
}
