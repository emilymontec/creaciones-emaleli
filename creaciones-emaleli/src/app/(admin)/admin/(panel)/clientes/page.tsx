import type { Metadata } from "next";
import { Users, MessageCircle, MapPin, Building, ShoppingBag } from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { Table, type TableColumn } from "@/src/frontend/components/ui/Table";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { AdminListPagination } from "@/src/frontend/components/shared/AdminListPagination";
import { prisma } from "@/src/backend/shared/prisma";

export const metadata: Metadata = {
  title: "Directorio de Clientes | Emaleli Admin",
};

const PER_PAGE = 20;

export default async function ClientesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;
  const skip = (page - 1) * PER_PAGE;

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PER_PAGE,
      include: {
        pedidos: {
          select: { id: true, total: true, estado: true },
        },
      },
    }),
    prisma.cliente.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const columns: TableColumn<(typeof clientes)[0]>[] = [
    {
      key: "nombre",
      header: "Cliente",
      render: (r) => (
        <div>
          <p className="font-semibold text-gray-900">{r.nombre}</p>
          <p className="text-xs text-gray-500">{r.email || "Sin correo"}</p>
        </div>
      ),
    },
    {
      key: "whatsapp",
      header: "WhatsApp",
      render: (r) => (
        <a
          href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald-600 hover:underline"
        >
          <MessageCircle className="size-3.5" />
          {r.whatsapp}
        </a>
      ),
    },
    {
      key: "ciudad",
      header: "Ciudad / Empresa",
      render: (r) => (
        <div>
          <p className="text-xs font-medium text-gray-800">{r.ciudad || "—"}</p>
          {r.empresa && <p className="text-[11px] text-gray-500">{r.empresa}</p>}
        </div>
      ),
    },
    {
      key: "pedidos",
      header: "Pedidos",
      className: "text-center",
      render: (r) => <Badge variant="neutral">{r.pedidos.length} pedidos</Badge>,
    },
    {
      key: "total",
      header: "Total Compras",
      className: "text-right font-bold text-gray-900 tabular-nums",
      render: (r) => {
        const sum = r.pedidos.reduce((acc, p) => acc + Number(p.total), 0);
        return `$${sum.toLocaleString("es-CO")}`;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="size-6 text-primary-600" /> Directorio de Clientes
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Base de datos de clientes registrados desde la tienda y el checkout.
        </p>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-gray-900">
            Clientes Registrados
          </h3>
          <Badge variant="info">{total} clientes</Badge>
        </div>

        <Table
          columns={columns}
          data={clientes}
          rowKey={(r) => r.id}
          emptyTitle="No hay clientes aún"
          emptyDescription="Los clientes que realicen pedidos en la tienda aparecerán aquí."
        />

        <AdminListPagination
          page={page}
          totalPages={totalPages}
          total={total}
          itemLabel="cliente"
        />
      </Card>
    </div>
  );
}
