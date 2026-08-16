"use client";

import Link from "next/link";
import { Truck, PackageCheck, MapPin, Eye, ExternalLink } from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { Table, type TableColumn } from "@/src/frontend/components/ui/Table";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { StatCard } from "@/src/frontend/components/ui/StatCard";
import { PageHeader } from "@/src/frontend/components/shared/PageHeader";
import { EstadoPedidoBadge } from "@/src/frontend/modules/pedidos/components/EstadoPedidoBadge";

type Envio = {
  id: string;
  pedidoId: string;
  destinatario: string | null;
  ciudad: string | null;
  metodo: string;
  numeroGuia: string | null;
  enlaceRastreo: string | null;
  pedido: {
    id: string;
    codigo: string;
    estado: string;
    ciudad: string | null;
    direccion: string | null;
    cliente: { nombre: string; whatsapp: string };
  };
};

export function EnviosPanel({ envios }: { envios: Envio[] }) {
  const columns: TableColumn<Envio>[] = [
    {
      key: "codigo",
      header: "Pedido",
      render: (r) => (
        <Link href={`/admin/pedidos/${r.pedidoId}`} className="font-semibold text-primary-600 hover:underline">
          {r.pedido.codigo}
        </Link>
      ),
    },
    {
      key: "cliente",
      header: "Destinatario / Ciudad",
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.destinatario || r.pedido.cliente.nombre}</p>
          <p className="text-xs text-gray-500">{r.ciudad || r.pedido.ciudad}</p>
        </div>
      ),
    },
    {
      key: "metodo",
      header: "Método",
      render: (r) => (
        <Badge variant={r.metodo === "TRANSPORTADORA" ? "info" : "neutral"}>
          {r.metodo === "RECOGER" ? "Recoger en Tienda" : r.metodo === "DOMICILIO" ? "Domicilio" : "Transportadora"}
        </Badge>
      ),
    },
    {
      key: "guia",
      header: "Número de Guía",
      render: (r) =>
        r.numeroGuia ? (
          <span className="font-mono text-xs font-bold text-gray-900">{r.numeroGuia}</span>
        ) : (
          <span className="text-xs text-gray-400 font-italic">Sin guía</span>
        ),
    },
    {
      key: "estadoPedido",
      header: "Estado Pedido",
      render: (r) => <EstadoPedidoBadge estado={r.pedido.estado} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Truck}
        title="Logística y Envíos"
        description="Control de despachos, guías de transportadoras y estados de entrega."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Guías Registradas"
          value={envios.filter((e) => e.numeroGuia).length}
          icon={Truck}
          iconClass="bg-gradient-to-br from-sky-100 to-primary-100 text-sky-600"
        />
        <StatCard
          label="Pendientes de Guía"
          value={envios.filter((e) => !e.numeroGuia && e.metodo === "TRANSPORTADORA").length}
          icon={MapPin}
          iconClass="bg-gradient-to-br from-amber-100 to-coral-100 text-amber-600"
        />
        <StatCard
          label="Total Despachos"
          value={envios.length}
          icon={PackageCheck}
          iconClass="bg-gradient-to-br from-emerald-100 to-secondary-100 text-emerald-600"
        />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-gray-900">
            Despachos y Envíos
          </h3>
          <Badge variant="neutral">{envios.length} envíos</Badge>
        </div>

        <Table
          columns={columns}
          data={envios}
          rowKey={(r) => r.id}
          actions={(r) => (
            <div className="flex items-center gap-2">
              {r.enlaceRastreo && (
                <a
                  href={r.enlaceRastreo}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="size-3" /> Rastreo
                </a>
              )}
              <Link
                href={`/admin/pedidos/${r.pedidoId}`}
                className="inline-flex h-8 items-center gap-1 rounded-button bg-transparent px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                <Eye className="size-3.5" /> Ver
              </Link>
            </div>
          )}
          emptyTitle="No hay datos de envíos"
          emptyDescription="Los pedidos con datos de despacho aparecerán en esta lista."
        />
      </Card>
    </div>
  );
}
