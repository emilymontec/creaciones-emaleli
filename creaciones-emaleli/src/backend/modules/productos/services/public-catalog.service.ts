import * as repository from "../repositories/public-catalog.repository";
import type { CatalogFilters } from "../repositories/public-catalog.repository";

export async function getFeaturedProducts(limit = 8) {
  return repository.findFeatured(limit);
}

export async function getCatalogProducts(
  filters: Omit<CatalogFilters, "page" | "perPage"> & {
    page?: number;
    perPage?: number;
  },
) {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = filters.perPage ?? 12;

  const { items, total } = await repository.findCatalog({
    ...filters,
    page,
    perPage,
  });

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductBySlugPublic(slug: string) {
  return repository.findBySlugPublic(slug);
}

export async function getRelatedProducts(
  productoId: string,
  categoriaIds: string[],
  limit = 4,
) {
  return repository.findRelated(productoId, categoriaIds, limit);
}
