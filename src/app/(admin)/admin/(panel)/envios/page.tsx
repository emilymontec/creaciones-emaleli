import type { Metadata } from "next";
import { EnviosPanel } from "@/src/frontend/modules/envios/components/EnviosPanel";
import { listarEnviosAction } from "@/src/backend/modules/pedidos/actions/managePedidos";

export const metadata: Metadata = {
  title: "Gestión de Envíos y Logística | Administración",
};

export default async function EnviosAdminPage() {
  const envios = await listarEnviosAction(50);

  return <EnviosPanel envios={envios} />;
}
