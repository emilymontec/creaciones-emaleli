import { prisma } from "@/src/backend/shared/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function create(data: Prisma.CategoriaCreateInput) {
  return prisma.categoria.create({
    data,
  });
}

export async function findAll() {
  return prisma.categoria.findMany({
    orderBy: {
      orden: "asc",
    },
  });
}

export async function findById(id: string) {
  return prisma.categoria.findUnique({
    where: { id },
  });
}

export async function findBySlug(slug: string) {
  return prisma.categoria.findUnique({
    where: {
      slug,
    },
  });
}

export async function findWithProductCount(id: string) {
  return prisma.categoria.findUnique({
    where: { id },
    include: {
      _count: { select: { productos: true } },
    },
  });
}

export async function update(id: string, data: Prisma.CategoriaUpdateInput) {
  return prisma.categoria.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  return prisma.categoria.delete({
    where: { id },
  });
}

export async function nextOrden() {
  const result = await prisma.categoria.aggregate({
    _max: { orden: true },
  });
  return (result._max.orden ?? 0) + 1;
}

/** Persiste un nuevo orden para varias categorías en una sola transacción. */
export async function reorder(items: { id: string; orden: number }[]) {
  return prisma.$transaction(
    items.map((item) =>
      prisma.categoria.update({
        where: { id: item.id },
        data: { orden: item.orden },
      }),
    ),
  );
}
