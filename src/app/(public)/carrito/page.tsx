"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ShoppingBag } from "lucide-react";
import { Button } from "@/src/frontend/components/ui/Button";
import { EmptyState } from "@/src/frontend/components/ui/EmptyState";
import { Card } from "@/src/frontend/components/ui/Card";
import { formatCOP } from "@/src/shared/lib/pricing";
import { useCart } from "@/src/frontend/cart/CartContext";
import { CartLineItem } from "@/src/frontend/cart/CartLineItem";

export default function CarritoPage() {
  const router = useRouter();
  const { items, isReady, subtotal, tiempoProduccionMax } = useCart();

  if (!isReady) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-page px-4 py-16 sm:px-6">
        <EmptyState
          icon={<ShoppingBag className="size-8 text-gray-300" />}
          title="Tu carrito está vacío"
          description="Explora el catálogo y agrega productos personalizados."
          action={
            <Link href="/catalogo">
              <Button>Ir al catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-page px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="mb-6 font-display text-2xl font-bold text-gray-900">
        Tu carrito
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <Card className="divide-y divide-gray-50 p-0 px-5">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </Card>

        <Card className="h-fit space-y-4">
          <h2 className="font-display text-base font-semibold text-gray-900">
            Resumen
          </h2>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold text-gray-900">
              {formatCOP(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-base">
            <span className="font-semibold text-gray-900">Total (sin envío)</span>
            <span className="font-bold text-gray-900">
              {formatCOP(subtotal)}
            </span>
          </div>

          {tiempoProduccionMax !== null && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="size-3.5" />
              Tiempo estimado de producción: {tiempoProduccionMax} día(s)
            </p>
          )}

          <Button
            fullWidth
            onClick={() => router.push("/checkout")}
          >
            Continuar al checkout
          </Button>
          <p className="text-center text-xs text-gray-400">
            Irás a completar tus datos y confirmar el pedido.
          </p>
        </Card>
      </div>
    </div>
  );
}
