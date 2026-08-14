import type { Metadata } from "next";
import Link from "next/link";
import { Wallet, CreditCard, DollarSign, Eye, ArrowUpRight } from "lucide-react";
import { Card } from "@/src/frontend/components/ui/Card";
import { Table, type TableColumn } from "@/src/frontend/components/ui/Table";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { prisma } from "@/src/backend/shared/prisma";

export const metadata: Metadata = {
  title: "Gestión de Pagos y Caja | Emaleli Admin",
};

export default async function PagosAdminPage() {
  const [pagos, pedidosConSaldo] = await Promise.all([
    prisma.pago.findMany({
      take: 50,
      orderBy: { fecha: "desc" },
      include: {
        pedido: {
          select: { id: true, codigo: true, cliente: { select: { nombre: true } } },
        },
        usuario: { select: { nombre: true } },
      },
    }),
    prisma.pedido.aggregate({
      _sum: { saldoPendiente: true, total: true },
    }),
  ]);

  const totalRecaudado = pagos.reduce((sum, p) => sum + Number(p.monto), 0);
  const saldoPorCobrar = Number(pedidosConSaldo._sum.saldoPendiente ?? 0);
  const totalFacturado = Number(pedidosConSaldo._sum.total ?? 0);

  const columns: TableColumn<(typeof pagos)[0]>[] = [
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
      header: "Cliente",
      render: (r) => <span className="text-gray-800 font-medium">{r.pedido.cliente.nombre}</span>,
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (r) => (
        <Badge variant={r.tipo === "PAGO_FINAL" ? "success" : "info"}>
          {r.tipo === "ANTICIPO" ? "Anticipo" : r.tipo === "ABONO" ? "Abono" : "Pago Final"}
        </Badge>
      ),
    },
    {
      key: "metodo",
      header: "Método",
      render: (r) => <span className="text-gray-600 text-xs">{r.metodo}</span>,
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (r) => (
        <span className="text-xs text-gray-500">
          {new Date(r.fecha).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      key: "monto",
      header: "Monto",
      className: "text-right font-bold text-emerald-700 tabular-nums",
      render: (r) => `$${Number(r.monto).toLocaleString("es-CO")}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="size-6 text-primary-600" /> Control Financiero y Pagos
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Registro de abonos, anticipos, liquidaciones y control de saldos por cobrar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Facturado</p>
            <p className="font-display text-2xl font-bold text-gray-900">
              ${totalFacturado.toLocaleString("es-CO")}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CreditCard className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Saldo por Cobrar</p>
            <p className="font-display text-2xl font-bold text-amber-800">
              ${saldoPorCobrar.toLocaleString("es-CO")}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <ArrowUpRight className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Pagos Recibidos (Muestra)</p>
            <p className="font-display text-2xl font-bold text-primary-700">
              ${totalRecaudado.toLocaleString("es-CO")}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-gray-900">
            Historial General de Pagos
          </h3>
          <Badge variant="neutral">{pagos.length} registros</Badge>
        </div>

        <Table
          columns={columns}
          data={pagos}
          rowKey={(r) => r.id}
          actions={(r) => (
            <Link
              href={`/admin/pedidos/${r.pedidoId}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-button bg-transparent px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              <Eye className="size-4" /> Ver Pedido
            </Link>
          )}
          emptyTitle="No hay pagos registrados aún"
          emptyDescription="Los pagos registrados en los pedidos aparecerán en este historial."
        />
      </Card>
    </div>
  );
}
