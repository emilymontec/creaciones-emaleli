import { prisma } from "@/src/backend/shared/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function findByProducto(productoId: string) {
  return prisma.personalizacion.findMany({
    where: { productoId },
    orderBy: { orden: "asc" },
  });
}

export async function findById(id: string) {
  return prisma.personalizacion.findUnique({ where: { id } });
}

export async function create(data: Prisma.PersonalizacionCreateInput) {
  return prisma.personalizacion.create({ data });
}

export async function update(
  id: string,
  data: Prisma.PersonalizacionUpdateInput,
) {
  return prisma.personalizacion.update({ where: { id }, data });
}

export async function remove(id: string) {
  return prisma.personalizacion.delete({ where: { id } });
}

export async function reorder(items: { id: string; orden: number }[]) {
  return prisma.$transaction(
    items.map((item) =>
      prisma.personalizacion.update({
        where: { id: item.id },
        data: { orden: item.orden },
      }),
    ),
  );
}

export async function nextOrden(productoId: string) {
  const result = await prisma.personalizacion.aggregate({
    where: { productoId },
    _max: { orden: true },
  });
  return (result._max.orden ?? 0) + 1;
}
