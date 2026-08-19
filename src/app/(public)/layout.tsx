import type { ReactNode } from "react";
import { CartProvider } from "@/src/frontend/cart/CartContext";
import { PublicHeader } from "@/src/frontend/components/layout/PublicHeader";
import { PublicFooter } from "@/src/frontend/components/layout/PublicFooter";
import { ToastProvider } from "@/src/frontend/providers/ToastProvider";
import {
  obtenerConfigEmpresa,
  obtenerConfigContacto,
} from "@/src/backend/modules/configuracion/services/configuracion.service";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [empresa, contacto] = await Promise.all([
    obtenerConfigEmpresa(),
    obtenerConfigContacto(),
  ]);

  return (
    <ToastProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col bg-white">
          <PublicHeader empresa={empresa} contacto={contacto} />
          <main className="flex-1">{children}</main>
          <PublicFooter empresa={empresa} contacto={contacto} />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
