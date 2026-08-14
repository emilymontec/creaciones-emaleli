import { prisma } from "@/src/backend/shared/prisma";

export async function findByProducto(productoId: string) {
  return prisma.productoImagen.findMany({
    where: { productoId },
    orderBy: { orden: "asc" },
  });
}

export async function findById(id: string) {
  return prisma.productoImagen.findUnique({ where: { id } });
}

export async function create(data: {
  productoId: string;
  url: string;
  principal: boolean;
  orden: number;
}) {
  return prisma.productoImagen.create({ data });
}

export async function remove(id: string) {
  return prisma.productoImagen.delete({ where: { id } });
}

export async function setPrincipal(productoId: string, imagenId: string) {
  return prisma.$transaction([
    prisma.productoImagen.updateMany({
      where: { productoId },
      data: { principal: false },
    }),
    prisma.productoImagen.update({
      where: { id: imagenId },
      data: { principal: true },
    }),
  ]);
}

export async function reorder(items: { id: string; orden: number }[]) {
  return prisma.$transaction(
    items.map((item) =>
      prisma.productoImagen.update({
        where: { id: item.id },
        data: { orden: item.orden },
      }),
    ),
  );
}

export async function nextOrden(productoId: string) {
  const result = await prisma.productoImagen.aggregate({
    where: { productoId },
    _max: { orden: true },
  });
  return (result._max.orden ?? 0) + 1;
}

export async function count(productoId: string) {
  return prisma.productoImagen.count({ where: { productoId } });
}
