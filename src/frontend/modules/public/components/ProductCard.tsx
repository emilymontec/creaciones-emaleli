"use client";

import Link from "next/link";
import { Clock, ImageOff, ShoppingBag, Sparkles, Flame } from "lucide-react";
import { formatCOP } from "@/src/shared/lib/pricing";
import { useCart } from "@/src/frontend/cart/CartContext";

export interface ProductCardDTO {
  id: string;
  nombre: string;
  slug: string;
  precioBase: number;
  precioDescuento: number | null;
  tiempoProduccion: number | null;
  estado: string;
  imagenUrl: string | null;
  categoriaNombre?: string;
}

export function ProductCard({ producto }: { producto: ProductCardDTO }) {
  const { addItem, openDrawer } = useCart();

  const tieneDescuento =
    producto.precioDescuento !== null &&
    producto.precioDescuento < producto.precioBase;

  const descuentoPct = tieneDescuento
    ? Math.round(
        (1 - (producto.precioDescuento as number) / producto.precioBase) * 100,
      )
    : 0;

  const agotado = producto.estado === "AGOTADO";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (agotado) return;

    addItem({
      productoId: producto.id,
      slug: producto.slug,
      nombre: producto.nombre,
      precioUnitario: producto.precioDescuento ?? producto.precioBase,
      imagenUrl: producto.imagenUrl,
      tiempoProduccion: producto.tiempoProduccion,
      combinacionId: null,
      opciones: [],
      personalizaciones: [],
      cantidad: 1,
    });
    openDrawer();
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover border border-gray-100">
      <Link href={`/producto/${producto.slug}`} className="flex flex-col flex-1">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {producto.imagenUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={producto.imagenUrl}
              alt={producto.nombre}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gray-100">
              <ImageOff className="size-8 text-gray-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
            {tieneDescuento && (
              <span className="rounded-pill bg-gradient-to-r from-coral-500 to-accent-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-md">
                -{descuentoPct}% OFF
              </span>
            )}
            {producto.tiempoProduccion && producto.tiempoProduccion <= 2 && (
              <span className="inline-flex items-center gap-0.5 rounded-pill bg-amber-400 px-1.5 py-0.5 text-[9px] font-extrabold text-gray-900 shadow-xs">
                <Flame className="size-2.5 text-coral-600 fill-coral-600" />
                Entrega rápida
              </span>
            )}
          </div>

          {agotado && (
            <span className="absolute right-2 top-2 rounded-pill bg-gray-900/85 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
              Agotado
            </span>
          )}

          {/* Botón añadir al carrito */}
          {!agotado && (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Añadir ${producto.nombre} al carrito`}
              className="absolute right-2 bottom-2 z-10 flex size-9 items-center justify-center rounded-full bg-accent-500 text-white shadow-md transition-all duration-200 hover:scale-110 hover:bg-accent-600 active:scale-95"
            >
              <ShoppingBag className="size-4" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          {producto.categoriaNombre && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-600">
              {producto.categoriaNombre}
            </span>
          )}

          <h3 className="line-clamp-2 text-xs font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {producto.nombre}
          </h3>

          {/* Precios */}
          <div className="mt-auto flex items-baseline gap-1.5 pt-1.5">
            {tieneDescuento ? (
              <>
                <span className="text-sm sm:text-base font-extrabold text-accent-600">
                  {formatCOP(producto.precioDescuento as number)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatCOP(producto.precioBase)}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-gray-900">
                {formatCOP(producto.precioBase)}
              </span>
            )}
          </div>

          {/* Tiempo de producción y badge Personalizable */}
          {producto.tiempoProduccion ? (
            <div className="mt-1 flex items-center justify-between gap-1 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-pill bg-secondary-50 px-2 py-0.5 text-[10px] font-semibold text-secondary-700">
                <Clock className="size-2.5" />
                {producto.tiempoProduccion}d producción
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent-600">
                <Sparkles className="size-2.5" />
                Personalizable
              </span>
            </div>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
