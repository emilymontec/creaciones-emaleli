import type { Metadata } from "next";
import { ClientesPanel } from "@/src/frontend/modules/clientes/components/ClientesPanel";
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

  const [rawClientes, total] = await Promise.all([
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

  // Prisma.Decimal no es serializable de servidor -> cliente: se convierte
  // a number antes de pasarlo al componente cliente.
  const clientes = rawClientes.map((c) => ({
    ...c,
    pedidos: c.pedidos.map((p) => ({ ...p, total: Number(p.total) })),
  }));

  return (
    <ClientesPanel
      clientes={clientes}
      page={page}
      totalPages={totalPages}
      total={total}
    />
  );
}
