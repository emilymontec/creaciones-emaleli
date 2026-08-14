import { prisma } from "@/src/backend/shared/prisma";
import { Prisma } from "@/generated/prisma/client";

const publicCardInclude = {
  imagenes: { where: { principal: true }, take: 1 },
  categorias: { select: { id: true, nombre: true, slug: true } },
} satisfies Prisma.ProductoInclude;

const publicDetailInclude = {
  imagenes: { orderBy: { orden: "asc" as const } },
  categorias: { select: { id: true, nombre: true, slug: true } },
  variantes: {
    where: { activo: true },
    orderBy: [{ tipo: "asc" as const }, { orden: "asc" as const }],
  },
  combinaciones: {
    where: { activo: true },
    include: { opciones: true },
  },
  personalizaciones: {
    where: { activo: true },
    orderBy: { orden: "asc" as const },
  },
} satisfies Prisma.ProductoInclude;

export async function findFeatured(limit: number) {
  return prisma.producto.findMany({
    where: { destacado: true, estado: { in: ["ACTIVO", "AGOTADO"] } },
    include: publicCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export interface CatalogFilters {
  q?: string;
  categoriaSlug?: string;
  precioMin?: number;
  precioMax?: number;
  orden?: "precio_asc" | "precio_desc" | "recientes" | "vendidos";
  page: number;
  perPage: number;
}

export async function findCatalog(filters: CatalogFilters) {
  const where: Prisma.ProductoWhereInput = {
    estado: { in: ["ACTIVO", "AGOTADO"] },
  };

  if (filters.q) {
    where.OR = [
      { nombre: { contains: filters.q, mode: "insensitive" } },
      { descripcionCorta: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.categoriaSlug) {
    where.categorias = { some: { slug: filters.categoriaSlug } };
  }

  if (filters.precioMin !== undefined || filters.precioMax !== undefined) {
    where.precioBase = {
      ...(filters.precioMin !== undefined ? { gte: filters.precioMin } : {}),
      ...(filters.precioMax !== undefined ? { lte: filters.precioMax } : {}),
    };
  }

  const orderBy: Prisma.ProductoOrderByWithRelationInput =
    filters.orden === "precio_asc"
      ? { precioBase: "asc" }
      : filters.orden === "precio_desc"
        ? { precioBase: "desc" }
        : // "vendidos" cae a "recientes" hasta que exista historial de
          // pedidos (Fase 7) para agregar unidades vendidas por producto.
          { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: publicCardInclude,
      orderBy,
      skip: (filters.page - 1) * filters.perPage,
      take: filters.perPage,
    }),
    prisma.producto.count({ where }),
  ]);

  return { items, total };
}

export async function findBySlugPublic(slug: string) {
  return prisma.producto.findFirst({
    where: { slug, estado: { in: ["ACTIVO", "AGOTADO"] } },
    include: publicDetailInclude,
  });
}

export async function findRelated(
  productoId: string,
  categoriaIds: string[],
  limit: number,
) {
  if (categoriaIds.length === 0) return [];

  return prisma.producto.findMany({
    where: {
      id: { not: productoId },
      estado: { in: ["ACTIVO", "AGOTADO"] },
      categorias: { some: { id: { in: categoriaIds } } },
    },
    include: publicCardInclude,
    take: limit,
  });
}
