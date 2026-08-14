import type { ReactNode } from "react";
import { CartProvider } from "@/src/frontend/cart/CartContext";
import { PublicHeader } from "@/src/frontend/components/layout/PublicHeader";
import { PublicFooter } from "@/src/frontend/components/layout/PublicFooter";
import { ToastProvider } from "@/src/frontend/providers/ToastProvider";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col bg-white">
          <PublicHeader />
          <main className="flex-1">{children}</main>
          <PublicFooter />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
