import type { Metadata } from "next";
import { Suspense } from "react";
import { PedidoDetallePage } from "@/src/frontend/modules/pedidos/components/PedidoDetallePage";
import { Loader } from "@/src/frontend/components/ui/Loader";

export const metadata: Metadata = {
  title: "Detalle de pedido | Emaleli Admin",
};

export default function PedidoDetalleRoute({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      }
    >
      <PedidoDetallePage pedidoId={id} />
    </Suspense>
  );
}
