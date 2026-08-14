"use client";

import { ImageOff, Minus, Plus, Trash2, Tag } from "lucide-react";
import { formatCOP } from "@/src/shared/lib/pricing";
import { useCart } from "./CartContext";
import type { CartItem } from "./types";

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  const detalles = [
    ...item.opciones.map((o) => o.nombre),
    ...item.personalizaciones.map((p) => `${p.nombre}: ${p.valor}`),
  ];

  return (
    <div className="flex gap-3 py-3.5 px-1 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 rounded-lg transition-colors">
      <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-card bg-gray-100 border border-gray-200">
        {item.imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imagenUrl}
            alt={item.nombre}
            className="size-full object-cover"
          />
        ) : (
          <ImageOff className="size-6 text-gray-300" />
        )}
        <span className="absolute bottom-0 inset-x-0 bg-gray-900/70 py-0.5 text-center text-[9px] font-bold text-white">
          Personalizable
        </span>
      </div>

      <div className="min-w-0 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate text-xs sm:text-sm font-bold text-gray-900">
              {item.nombre}
            </h4>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              aria-label={`Quitar ${item.nombre} del carrito`}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          {detalles.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {detalles.map((d, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded bg-secondary-50 px-1.5 py-0.5 text-[10px] font-medium text-secondary-800"
                >
                  <Tag className="size-2.5 text-secondary-500" />
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-pill border border-gray-300 bg-white shadow-xs">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.cantidad - 1)}
              disabled={item.cantidad <= 1}
              aria-label="Disminuir cantidad"
              className="flex size-7 items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-pill disabled:opacity-30 transition-colors"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-gray-800">
              {item.cantidad}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.cantidad + 1)}
              aria-label="Aumentar cantidad"
              className="flex size-7 items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-pill transition-colors"
            >
              <Plus className="size-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-gray-900">
              {formatCOP(item.precioUnitario * item.cantidad)}
            </span>
            {item.cantidad > 1 && (
              <span className="block text-[10px] text-gray-400">
                {formatCOP(item.precioUnitario)} c/u
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
