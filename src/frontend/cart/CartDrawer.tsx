"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { Drawer } from "@/src/frontend/components/ui/Drawer";
import { Button } from "@/src/frontend/components/ui/Button";
import { EmptyState } from "@/src/frontend/components/ui/EmptyState";
import { formatCOP } from "@/src/shared/lib/pricing";
import { useCart } from "./CartContext";
import { CartLineItem } from "./CartLineItem";
import type { ContactoConfigInput } from "@/src/backend/modules/configuracion/schemas/configuracion.schema";

const FREE_SHIPPING_THRESHOLD = 60000;
const DEFAULT_WHATSAPP =
  process.env.NEXT_PUBLIC_EMPRESA_WHATSAPP ?? "573001234567";

export function CartDrawer({ contacto }: { contacto?: ContactoConfigInput }) {
  const { items, isDrawerOpen, closeDrawer, subtotal, totalItems } = useCart();
  const whatsapp = contacto?.whatsapp || DEFAULT_WHATSAPP;
  const mensajePrefijo = contacto?.mensajeCheckout?.trim();

  const faltanteEnvioGratis = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const porcentajeEnvioGratis = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  const buildWhatsAppLink = () => {
    let msg = `*Hola Creaciones Emaleli!* Quiero realizar este pedido:\n\n`;
    items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.nombre}* (x${item.cantidad})\n`;
      const opts = [
        ...item.opciones.map((o) => o.nombre),
        ...item.personalizaciones.map((p) => `${p.nombre}: ${p.valor}`),
      ];
      if (opts.length > 0) msg += `   Detalles: ${opts.join(", ")}\n`;
      msg += `   Subtotal: ${formatCOP(item.precioUnitario * item.cantidad)}\n\n`;
    });
    msg += `*Total Estimado:* ${formatCOP(subtotal)}\n`;
    msg +=
      mensajePrefijo || `Por favor ayúdame con los detalles de pago y envío.`;
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <Drawer
      open={isDrawerOpen}
      onClose={closeDrawer}
      side="right"
      size="md"
      title={
        <div className="flex items-center gap-2 text-gray-900">
          <div className="flex size-7 items-center justify-center rounded-full bg-accent-100 text-accent-600">
            <ShoppingBag className="size-4" />
          </div>
          <span className="font-display font-extrabold text-base">
            Tu Carrito
          </span>
          {totalItems > 0 && (
            <span className="rounded-pill bg-accent-500 px-2 py-0.5 text-xs font-bold text-white">
              {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
            </span>
          )}
        </div>
      }
      footer={
        items.length > 0 ? (
          <div className="space-y-3 bg-gray-50/70 -mx-5 -mb-4 p-5 border-t border-gray-200">
            {/* Desglose */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  {formatCOP(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío estimado:</span>
                <span className="font-semibold text-emerald-600">
                  {subtotal >= FREE_SHIPPING_THRESHOLD
                    ? "Gratis"
                    : "Calculado al pedir"}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-extrabold text-gray-900">
                <span>Total:</span>
                <span className="text-accent-600">{formatCOP(subtotal)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeDrawer}
                className="flex items-center justify-center gap-2 rounded-pill bg-emerald-600 py-3 text-sm font-extrabold text-white shadow-card transition-all hover:bg-emerald-700 hover:shadow-card-hover"
              >
                <MessageCircle className="size-4" />
                Coordinar pedido por WhatsApp
              </a>

              <Link href="/carrito" onClick={closeDrawer} className="w-full">
                <Button
                  variant="ghost"
                  fullWidth
                  size="sm"
                  className="rounded-pill border border-gray-300"
                >
                  Ver detalle completo del carrito
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-gray-500 pt-1">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>Coordinamos el pago directamente contigo</span>
            </div>
          </div>
        ) : undefined
      }
    >
      {/* Barra de Envío Gratis */}
      <div className="-mx-5 -mt-4 mb-4 bg-gradient-to-r from-primary-500 to-accent-500 p-3.5 text-white">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="flex items-center gap-1.5">
            <Truck className="size-4 text-yellow-300" />
            {subtotal >= FREE_SHIPPING_THRESHOLD
              ? "Calificás para envío gratis"
              : `Te faltan ${formatCOP(faltanteEnvioGratis)} para envío gratis`}
          </span>
          <span className="text-[11px]">{porcentajeEnvioGratis}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-black/20 overflow-hidden">
          <div
            className="h-full bg-yellow-300 transition-all duration-500 rounded-full"
            style={{ width: `${porcentajeEnvioGratis}%` }}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-10 text-primary-300" />}
          title="Tu carrito está vacío"
          description="Explora el catálogo y agrega tus productos favoritos."
        />
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </Drawer>
  );
}
