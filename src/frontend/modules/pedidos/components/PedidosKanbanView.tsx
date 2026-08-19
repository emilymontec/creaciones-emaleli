"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";

type PedidoItem = {
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

const KANBAN_COLUMNS: { estado: string; label: string; color: string }[] = [
  { estado: "NUEVO", label: "Nuevos", color: "border-sky-500 bg-sky-50/30" },
  {
    estado: "EN_REVISION",
    label: "En revisión",
    color: "border-amber-500 bg-amber-50/30",
  },
  {
    estado: "EN_PRODUCCION",
    label: "En producción",
    color: "border-purple-500 bg-purple-50/30",
  },
  {
    estado: "EMPACADO",
    label: "Empacado",
    color: "border-indigo-500 bg-indigo-50/30",
  },
  {
    estado: "ENVIADO",
    label: "Enviados",
    color: "border-blue-500 bg-blue-50/30",
  },
  {
    estado: "ENTREGADO",
    label: "Entregados",
    color: "border-emerald-500 bg-emerald-50/30",
  },
];

export function PedidosKanbanView({ pedidos }: { pedidos: PedidoItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-4 md:grid-cols-3 lg:grid-cols-6 min-w-[1000px]">
      {KANBAN_COLUMNS.map((col) => {
        const colPedidos = pedidos.filter((p) => p.estado === col.estado);
        return (
          <div
            key={col.estado}
            className={`flex flex-col rounded-xl border-t-4 ${col.color} border-x border-b border-gray-200/80 p-3 bg-white shadow-xs`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-gray-700">
                {col.label}
              </h4>
              <span className="flex size-5 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">
                {colPedidos.length}
              </span>
            </div>

            <div className="flex-1 space-y-3">
              {colPedidos.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
                  Sin pedidos
                </div>
              ) : (
                colPedidos.map((p) => (
                  <Card
                    key={p.id}
                    className="p-3 shadow-xs hover:shadow-card transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-gray-900">
                        {p.codigo}
                      </span>
                      <Link
                        href={`/admin/pedidos/${p.id}`}
                        className="text-gray-400 hover:text-primary-600 p-0.5"
                        title="Ver detalle"
                      >
                        <Eye className="size-3.5" />
                      </Link>
                    </div>

                    <p className="text-xs font-medium text-gray-800 truncate">
                      {p.cliente?.nombre ?? "—"}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {p.ciudad}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px]">
                      <span className="font-semibold text-gray-900">
                        ${Number(p.total).toLocaleString("es-CO")}
                      </span>
                      {Number(p.saldoPendiente) > 0 ? (
                        <span className="text-amber-700 font-medium">
                          Saldo: $
                          {Number(p.saldoPendiente).toLocaleString("es-CO")}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          Pagado
                        </span>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
