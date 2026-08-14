"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Select } from "@/src/frontend/components/ui/Select";
import { Input } from "@/src/frontend/components/ui/Input";

const ORDEN_OPTIONS = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "vendidos", label: "Más vendidos" },
];

export function CatalogFilters({
  categorias,
}: {
  categorias: { slug: string; nombre: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  const categoriaActual = searchParams.get("categoria") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`/catalogo?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q);
  }

  return (
    <div className="mb-6 space-y-4 rounded-card bg-white p-4 shadow-card border border-gray-100">
      {/* Fila 1: Buscador y Ordenamiento */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, frase o diseño..."
            className="pl-9 rounded-pill border-gray-300 focus:border-accent-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-gray-500 hidden sm:block" />
          <Select
            value={searchParams.get("orden") ?? "recientes"}
            onChange={(e) => updateParam("orden", e.target.value)}
            options={ORDEN_OPTIONS}
          />
        </div>
      </div>

      {/* Fila 2: Pills de categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => updateParam("categoria", "")}
          className={`shrink-0 rounded-pill px-3.5 py-1.5 text-xs font-bold transition-all ${
            categoriaActual === ""
              ? "bg-accent-500 text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => updateParam("categoria", c.slug)}
            className={`shrink-0 rounded-pill px-3.5 py-1.5 text-xs font-bold transition-all ${
              categoriaActual === c.slug
                ? "bg-accent-500 text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-800"
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
