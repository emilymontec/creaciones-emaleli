import type { Metadata } from "next";
import { EnviosPanel } from "@/src/frontend/modules/envios/components/EnviosPanel";
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

  return <EnviosPanel envios={envios} />;
}
