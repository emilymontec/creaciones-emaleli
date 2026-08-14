import type { Metadata } from "next";
import Link from "next/link";
import { Truck, PackageCheck, MapPin, Eye, ExternalLink } from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { Table, type TableColumn } from "@/src/frontend/components/ui/Table";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { EstadoPedidoBadge } from "@/src/frontend/modules/pedidos/components/EstadoPedidoBadge";
import { prisma } from "@/src/backend/shared/prisma";

export const metadata: Metadata = {
  title: "Gestión de Envíos y Logística | Emaleli Admin",
};

export default async function EnviosAdminPage() {
  const envios = await prisma.envio.findMany({
    take: 50,
    orderBy: { id: "desc" },
    include: {
      pedido: {
        select: {
          id: true,
          codigo: true,
          estado: true,
          ciudad: true,
          direccion: true,
          cliente: { select: { nombre: true, whatsapp: true } },
        },
      },
    },
  });

  const columns: TableColumn<(typeof envios)[0]>[] = [
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
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Truck className="size-6 text-primary-600" /> Logística y Envíos
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Control de despachos, guías de transportadoras y estados de entrega.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <Truck className="size-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Guías Registradas</p>
            <p className="font-display text-xl font-bold text-gray-900">
              {envios.filter((e) => e.numeroGuia).length}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <MapPin className="size-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pendientes de Guía</p>
            <p className="font-display text-xl font-bold text-amber-800">
              {envios.filter((e) => !e.numeroGuia && e.metodo === "TRANSPORTADORA").length}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <PackageCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Despachos</p>
            <p className="font-display text-xl font-bold text-emerald-800">{envios.length}</p>
          </div>
        </Card>
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
