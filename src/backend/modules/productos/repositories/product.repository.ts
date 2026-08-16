import { prisma } from "@/src/backend/shared/prisma";
import { Prisma } from "@/generated/prisma/client";

const listInclude = {
  categorias: { select: { id: true, nombre: true } },
  imagenes: {
    orderBy: [{ principal: "desc" as const }, { orden: "asc" as const }],
    take: 1,
  },
} satisfies Prisma.ProductoInclude;

const DEFAULT_PAGE_SIZE = 20;

export interface FindAllProductosParams {
  page?: number;
  perPage?: number;
}

export async function create(data: Prisma.ProductoCreateInput) {
  return prisma.producto.create({ data, include: listInclude });
}

export async function findAll(params: FindAllProductosParams = {}) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const perPage = params.perPage ?? DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * perPage;

  const [items, total] = await Promise.all([
    prisma.producto.findMany({
      include: listInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
    }),
    prisma.producto.count(),
  ]);

  return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function findById(id: string) {
  return prisma.producto.findUnique({
    where: { id },
    include: listInclude,
  });
}

export async function findBySlug(slug: string) {
  return prisma.producto.findUnique({ where: { slug } });
}

export async function update(id: string, data: Prisma.ProductoUpdateInput) {
  return prisma.producto.update({
    where: { id },
    data,
    include: listInclude,
  });
}

export async function remove(id: string) {
  return prisma.producto.delete({ where: { id } });
}

export async function setEstado(
  id: string,
  estado: "ACTIVO" | "INACTIVO" | "AGOTADO",
) {
  return prisma.producto.update({ where: { id }, data: { estado } });
}
