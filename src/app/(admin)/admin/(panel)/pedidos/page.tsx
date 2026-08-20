import type { Metadata } from "next";
import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import { PedidosListPage } from "@/src/frontend/modules/pedidos/components/PedidosListPage";
import { PageHeader } from "@/src/frontend/components/shared/PageHeader";
import { Loader } from "@/src/frontend/components/ui/Loader";

export const metadata: Metadata = {
  title: "Pedidos | Administración",
};

export default function PedidosAdminPage() {
  return (
    <div>
      <PageHeader
        icon={ClipboardList}
        title="Gestión de pedidos"
        description="Administra el ciclo de vida completo de cada pedido: desde que llega nuevo, pasando por producción, hasta la entrega final."
      />

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader size="lg" />
          </div>
        }
      >
        <PedidosListPage />
      </Suspense>
    </div>
  );
}
