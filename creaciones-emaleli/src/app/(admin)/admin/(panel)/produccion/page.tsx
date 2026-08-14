import type { Metadata } from "next";
import Link from "next/link";
import { Factory, Clock, CheckCircle2, Eye, AlertCircle } from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { EstadoPedidoBadge } from "@/src/frontend/modules/pedidos/components/EstadoPedidoBadge";
import { prisma } from "@/src/backend/shared/prisma";

export const metadata: Metadata = {
  title: "Producción y Taller | Emaleli Admin",
};

export default async function ProduccionAdminPage() {
  const pedidosProduccion = await prisma.pedido.findMany({
    where: {
      estado: {
        in: ["EN_REVISION", "DISENO_APROBADO", "EN_PRODUCCION"],
      },
    },
    orderBy: { fechaPedido: "asc" },
    include: {
      cliente: { select: { nombre: true, whatsapp: true, ciudad: true } },
      items: true,
      _count: { select: { archivos: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Factory className="size-6 text-primary-600" /> Control de Producción y Taller
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Seguimiento de pedidos activos en etapa de diseño, aprobación y fabricación.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 border-l-4 border-amber-500">
          <p className="text-xs font-semibold text-gray-500 uppercase">En Revisión / Diseño</p>
          <p className="font-display text-2xl font-bold text-gray-900 mt-1">
            {pedidosProduccion.filter((p) => p.estado === "EN_REVISION").length}
          </p>
        </Card>
        <Card className="p-4 border-l-4 border-sky-500">
          <p className="text-xs font-semibold text-gray-500 uppercase">Diseño Aprobado</p>
          <p className="font-display text-2xl font-bold text-gray-900 mt-1">
            {pedidosProduccion.filter((p) => p.estado === "DISENO_APROBADO").length}
          </p>
        </Card>
        <Card className="p-4 border-l-4 border-purple-500">
          <p className="text-xs font-semibold text-gray-500 uppercase">En Fabricación</p>
          <p className="font-display text-2xl font-bold text-gray-900 mt-1">
            {pedidosProduccion.filter((p) => p.estado === "EN_PRODUCCION").length}
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-gray-900">
            Pedidos en Cola de Producción ({pedidosProduccion.length})
          </h3>
        </div>

        {pedidosProduccion.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center p-6">
            <CheckCircle2 className="size-10 text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-gray-800">¡Taller al día!</p>
            <p className="text-xs text-gray-500 mt-0.5">
              No hay pedidos pendientes en etapa de diseño o fabricación.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pedidosProduccion.map((p) => (
              <Card key={p.id} className="p-4 border border-gray-200/80 hover:border-primary-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-gray-900">{p.codigo}</span>
                  <EstadoPedidoBadge estado={p.estado} />
                </div>

                <p className="text-xs font-semibold text-gray-800">{p.cliente.nombre}</p>
                <p className="text-xs text-gray-500 mb-3">{p.cliente.ciudad}</p>

                <div className="border-t border-gray-100 pt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-700">Ítems a fabricar:</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                    {p.items.map((it) => (
                      <li key={it.id} className="truncate">
                        <strong>{it.cantidad}x</strong> {it.nombreProducto}
                      </li>
                    ))}
                  </ul>
                </div>

                {p.observaciones && (
                  <div className="mt-3 rounded-md bg-amber-50 p-2 text-xs text-amber-900">
                    <strong>Nota:</strong> {p.observaciones}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                  <span className="text-gray-400">
                    {new Date(p.fechaPedido).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                  </span>
                  <Link
                    href={`/admin/pedidos/${p.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:underline"
                  >
                    <Eye className="size-3.5" /> Ver en detalle
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
