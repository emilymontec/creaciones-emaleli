import type { Metadata } from "next";
import { Suspense } from "react";
import { PedidosListPage } from "@/src/frontend/modules/pedidos/components/PedidosListPage";
import { Loader } from "@/src/frontend/components/ui/Loader";

export const metadata: Metadata = {
  title: "Pedidos | Emaleli Admin",
};

export default function PedidosAdminPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Gestión de pedidos
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra el ciclo de vida completo de cada pedido: desde que llega
          nuevo, pasando por producción, hasta la entrega final.
        </p>
      </div>

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
