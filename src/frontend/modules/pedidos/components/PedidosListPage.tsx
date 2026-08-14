"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  PackageCheck,
  Truck as TruckIcon,
  Factory as FactoryIcon,
  Sparkles,
  Filter,
  Eye,
  RotateCcw,
  Search,
  LayoutGrid,
  List as ListIcon,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { Input } from "@/src/frontend/components/ui/Input";
import { Select } from "@/src/frontend/components/ui/Select";
import { Button } from "@/src/frontend/components/ui/Button";
import { Table, type TableColumn } from "@/src/frontend/components/ui/Table";
import { Pagination } from "@/src/frontend/components/ui/Pagination";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { EstadoPedidoBadge, estadoOptions } from "./EstadoPedidoBadge";
import { PedidosKanbanView } from "./PedidosKanbanView";
import { listarPedidosAction } from "@/src/backend/modules/pedidos/actions/managePedidos";
import type { ListadoPedidosState } from "@/src/backend/modules/pedidos/actions/managePedidos";
import { Loader } from "@/src/frontend/components/ui/Loader";

type PedidoRow = {
  id: string;
  codigo: string;
  estado: string;
  fechaPedido: Date | string;
  ciudad: string;
  total: number;
  saldoPendiente: number;
  cliente: { nombre: string; whatsapp: string; ciudad: string };
  _count: { items: number; pagos: number };
};

const METRICS_MAP: Record<string, { label: string; Icon: LucideIcon }> = {
  NUEVO: { label: "Nuevos", Icon: Sparkles },
  EN_PRODUCCION: { label: "En producción", Icon: FactoryIcon },
  ENVIADO: { label: "Enviados", Icon: TruckIcon },
  ENTREGADO: { label: "Entregados", Icon: PackageCheck },
};

export function PedidosListPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [list, setList] = useState<ListadoPedidosState>({ success: false });
  const [vistaMode, setVistaMode] = useState<"tabla" | "kanban">("tabla");
  const loading = isPending || !list.success;


  const filters = useMemo(
    () => ({
      estado: params.get("estado") ?? "",
      ciudad: params.get("ciudad") ?? "",
      cliente: params.get("cliente") ?? "",
      fechaDesde: params.get("fechaDesde") ?? "",
      fechaHasta: params.get("fechaHasta") ?? "",
      page: params.get("page") ?? "",
    }),
    [params],
  );

  function cargarDatos() {
    startTransition(async () => {
      const res = await listarPedidosAction({
        estado: filters.estado || null,
        ciudad: filters.ciudad || null,
        cliente: filters.cliente || null,
        fechaDesde: filters.fechaDesde || null,
        fechaHasta: filters.fechaHasta || null,
        page: filters.page || null,
      });
      setList(res);
    });
  }

  useEffect(cargarDatos, [filters.estado, filters.ciudad, filters.cliente, filters.fechaDesde, filters.fechaHasta, filters.page]);

  function submitFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const qs = new URLSearchParams();
    for (const [k, v] of fd.entries()) {
      if (v) qs.set(k, String(v));
    }
    router.push(`/admin/pedidos?${qs.toString()}`);
  }

  function limpiarFiltros() {
    router.push("/admin/pedidos");
  }

  function goPage(p: number) {
    const qs = new URLSearchParams(
      Array.from(params.entries()).filter(([k]) => k !== "page"),
    );
    if (p > 1) qs.set("page", String(p));
    router.push(`/admin/pedidos?${qs.toString()}`);
  }

  const pedidos = (list.data?.pedidos.items ?? []) as unknown as PedidoRow[];
  const { total = 0, pages = 0, page = 1 } = list.data?.pedidos ?? {};
  const conteos = list.data?.conteos ?? {};
  const ciudades = list.ciudades ?? [];

  const columns: TableColumn<PedidoRow>[] = [
    {
      key: "codigo",
      header: "Pedido",
      sortable: true,
      sortValue: (r) => r.codigo,
      render: (r) => (
        <div>
          <p className="font-semibold text-gray-900">{r.codigo}</p>
          <p className="text-xs text-gray-500">
            {new Date(r.fechaPedido).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      sortable: true,
      sortValue: (r) => r.cliente?.nombre ?? "",
      render: (r) => (
        <div>
          <p className="font-medium text-gray-800">{r.cliente?.nombre ?? "—"}</p>
          <p className="text-xs text-gray-500">{r.cliente?.whatsapp ?? ""}</p>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (r) => <EstadoPedidoBadge estado={r.estado} />,
    },
    {
      key: "ciudad",
      header: "Ciudad",
      render: (r) => <Badge variant="neutral">{r.ciudad || "—"}</Badge>,
    },
    {
      key: "items",
      header: "Ítems",
      className: "text-right",
      render: (r) => (
        <p className="text-sm tabular-nums text-gray-700">
          {r._count?.items ?? 0}
        </p>
      ),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      sortValue: (r) => Number(r.total),
      className: "text-right",
      render: (r) => (
        <div className="text-right">
          <p className="font-semibold text-gray-900 tabular-nums">
            ${Number(r.total).toLocaleString("es-CO")}
          </p>
          {Number(r.saldoPendiente) > 0 && (
            <p className="text-xs text-amber-700 tabular-nums">
              Saldo ${Number(r.saldoPendiente).toLocaleString("es-CO")}
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(METRICS_MAP).map(([estado, { label, Icon }]) => (
          <Card key={estado} className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className="font-display text-xl font-bold text-gray-900">
                {conteos[estado] ?? 0}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Filter className="size-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">
            Filtros de búsqueda
          </h3>
        </div>
        <form
          onSubmit={submitFilters}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <Select
            name="estado"
            label="Estado"
            defaultValue={filters.estado}
            options={estadoOptions(true)}
          />
          <Select
            name="ciudad"
            label="Ciudad"
            defaultValue={filters.ciudad}
            options={[
              { value: "", label: "Todas las ciudades" },
              ...ciudades.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Input
            name="cliente"
            label="Cliente / WhatsApp"
            placeholder="Nombre o teléfono"
            defaultValue={filters.cliente}
          />
          <Input
            name="fechaDesde"
            label="Desde"
            type="date"
            defaultValue={filters.fechaDesde}
          />
          <Input
            name="fechaHasta"
            label="Hasta"
            type="date"
            defaultValue={filters.fechaHasta}
          />
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5 lg:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={limpiarFiltros}
              disabled={isPending}
            >
              <RotateCcw className="size-4" />
              Limpiar
            </Button>
            <Button type="submit" loading={isPending}>
              <Search className="size-4" />
              Aplicar filtros
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 text-primary-600" />
            <h3 className="font-display text-base font-semibold text-gray-900">
              Pedidos
            </h3>
            <Badge variant="neutral">{total} en total</Badge>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs">
            <button
              type="button"
              onClick={() => setVistaMode("tabla")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                vistaMode === "tabla"
                  ? "bg-white text-primary-600 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <ListIcon className="size-3.5" />
              Tabla
            </button>
            <button
              type="button"
              onClick={() => setVistaMode("kanban")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                vistaMode === "kanban"
                  ? "bg-white text-primary-600 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              Kanban
            </button>
          </div>
        </div>

        {loading && !list.success ? (
          <div className="flex h-60 items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : vistaMode === "kanban" ? (
          <PedidosKanbanView pedidos={pedidos} />
        ) : (
          <>
            <Table
              columns={columns}
              data={pedidos}
              rowKey={(r) => r.id}
              actions={(r) => (
                <Link
                  href={`/admin/pedidos/${r.id}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-button bg-transparent px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <Eye className="size-4" />
                  Ver
                </Link>
              )}
              emptyTitle="No hay pedidos que coincidan"
              emptyDescription="Ajusta los filtros o espera a que lleguen nuevos pedidos desde el checkout público."
            />
            <div className="mt-4">
              <Pagination
                page={Number(page)}
                totalPages={Number(pages)}
                onPageChange={goPage}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
