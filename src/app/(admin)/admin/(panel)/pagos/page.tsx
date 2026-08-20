import type { Metadata } from "next";
import { Suspense } from "react";
import { PagosPanel } from "@/src/frontend/modules/pagos/components/PagosPanel";
import { Loader } from "@/src/frontend/components/ui/Loader";

export const metadata: Metadata = {
  title: "Gestión de Pagos y Caja | Administración",
};

export default function PagosAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      }
    >
      <PagosPanel />
    </Suspense>
  );
}
