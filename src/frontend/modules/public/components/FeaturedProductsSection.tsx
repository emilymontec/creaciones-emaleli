"use client";

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { ProductCard, type ProductCardDTO } from "./ProductCard";

export function FeaturedProductsSection({
  productos,
}: {
  productos: ProductCardDTO[];
}) {
  if (productos.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-coral-100 text-coral-600">
            <Flame className="size-5 fill-coral-500" />
          </div>
          <div>
            <h2 className="font-display text-xl font-extrabold text-gray-900">
              Productos Destacados
            </h2>
            <p className="text-xs text-gray-500">
              Los más solicitados por nuestros clientes
            </p>
          </div>
        </div>

        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1 text-xs font-bold text-accent-600 hover:text-accent-700 bg-accent-50 px-3 py-1.5 rounded-pill transition-all hover:bg-accent-100"
        >
          Ver todo el catálogo
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </section>
  );
}
