"use client";

import Link from "next/link";
import { getCategoryIcon } from "../lib/getCategoryIcon";

export interface CategoriaGridDTO {
  id: string;
  nombre: string;
  slug: string;
}

export function CategoriesSection({
  categorias,
}: {
  categorias: CategoriaGridDTO[];
}) {
  if (categorias.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-extrabold text-gray-900">
            Categorías
          </h2>
          <p className="text-xs text-gray-500">
            Encuentra el regalo perfecto por tipo de producto
          </p>
        </div>
        <Link
          href="/catalogo"
          className="text-xs font-bold text-accent-600 hover:text-accent-700 hover:underline"
        >
          Explorar todo
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {categorias.map((categoria) => {
          const Icon = getCategoryIcon(categoria.nombre);
          return (
            <Link
              key={categoria.id}
              href={`/catalogo?categoria=${categoria.slug}`}
              className="group flex flex-col items-center gap-2 rounded-card bg-white p-3.5 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover border border-gray-100/80"
            >
              <div className="relative flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 text-accent-600 shadow-inner ring-2 ring-transparent transition-all group-hover:ring-accent-400 group-hover:scale-110">
                <Icon className="size-7 transition-transform group-hover:rotate-6" />
              </div>
              <span className="line-clamp-1 text-xs font-bold text-gray-800 group-hover:text-accent-600">
                {categoria.nombre}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
