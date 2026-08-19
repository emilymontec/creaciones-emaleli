import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { CatalogFilters } from "@/src/frontend/modules/public/components/CatalogFilters";
import { CatalogPagination } from "@/src/frontend/modules/public/components/CatalogPagination";
import {
  ProductCard,
  type ProductCardDTO,
} from "@/src/frontend/modules/public/components/ProductCard";
import { mapProductCard } from "@/src/frontend/modules/public/lib/mapProductCard";
import { EmptyState } from "@/src/frontend/components/ui/EmptyState";
import { getCatalogProducts } from "@/src/backend/modules/productos/services/public-catalog.service";
import { getPublicCategories } from "@/src/backend/modules/categorias/services/category.service";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explora camisetas, tazas, termos y más productos personalizados. Filtra por categoría y encuentra el regalo perfecto.",
};

type Categoria = Awaited<ReturnType<typeof getPublicCategories>>[number];
type ProductoCatalogo = Awaited<
  ReturnType<typeof getCatalogProducts>
>["items"][number];

const ORDEN_VALIDOS = [
  "precio_asc",
  "precio_desc",
  "recientes",
  "vendidos",
] as const;

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const orden = ORDEN_VALIDOS.includes(
    params.orden as (typeof ORDEN_VALIDOS)[number],
  )
    ? (params.orden as (typeof ORDEN_VALIDOS)[number])
    : "recientes";

  const [categorias, resultado] = await Promise.all([
    getPublicCategories(),
    getCatalogProducts({
      q: params.q || undefined,
      categoriaSlug: params.categoria || undefined,
      orden,
      page: params.page ? Number(params.page) : 1,
    }),
  ]);

  const productos: ProductCardDTO[] = resultado.items.map(
    (p: ProductoCatalogo) => mapProductCard(p),
  );

  return (
    <div className="mx-auto w-full max-w-page px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="mb-6 font-display text-2xl font-bold text-gray-900">
        Catálogo
      </h1>

      <CatalogFilters
        categorias={categorias.map((c: Categoria) => ({
          slug: c.slug,
          nombre: c.nombre,
        }))}
      />

      {productos.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="size-8 text-gray-300" />}
          title="No encontramos productos"
          description="Prueba con otra búsqueda o quita algunos filtros."
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">
            {resultado.total} producto{resultado.total !== 1 ? "s" : ""}{" "}
            encontrado{resultado.total !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>

          <div className="mt-8">
            <CatalogPagination
              page={resultado.page}
              totalPages={resultado.totalPages}
            />
          </div>
        </>
      )}
    </div>
  );
}
