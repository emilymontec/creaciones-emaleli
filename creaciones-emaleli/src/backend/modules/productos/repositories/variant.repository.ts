import { prisma } from "@/src/backend/shared/prisma";
import { Prisma } from "@/generated/prisma/client";

// ---- Opciones (ProductoVariante: una fila = una opción, ej. "Talla M") ----

export async function findOpcionesByProducto(productoId: string) {
  return prisma.productoVariante.findMany({
    where: { productoId },
    orderBy: [{ tipo: "asc" }, { orden: "asc" }],
  });
}

export async function findOpcionById(id: string) {
  return prisma.productoVariante.findUnique({ where: { id } });
}

export async function createOpcion(data: Prisma.ProductoVarianteCreateInput) {
  return prisma.productoVariante.create({ data });
}

export async function updateOpcion(
  id: string,
  data: Prisma.ProductoVarianteUpdateInput,
) {
  return prisma.productoVariante.update({ where: { id }, data });
}

export async function removeOpcion(id: string) {
  return prisma.productoVariante.delete({ where: { id } });
}

export async function nextOrdenOpcion(productoId: string, tipo: string) {
  const result = await prisma.productoVariante.aggregate({
    where: { productoId, tipo },
    _max: { orden: true },
  });
  return (result._max.orden ?? 0) + 1;
}

// ---- Combinaciones (matriz: ej. "Talla M" + "Color Rojo" = un SKU) ----

const combinacionInclude = {
  opciones: true,
} satisfies Prisma.CombinacionVarianteInclude;

export async function findCombinacionesByProducto(productoId: string) {
  return prisma.combinacionVariante.findMany({
    where: { productoId },
    include: combinacionInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function createCombinacion(
  productoId: string,
  opcionIds: string[],
  data: { sku?: string; precio?: number; stock?: number },
) {
  return prisma.combinacionVariante.create({
    data: {
      producto: { connect: { id: productoId } },
      opciones: { connect: opcionIds.map((id) => ({ id })) },
      sku: data.sku,
      precio: data.precio,
      stock: data.stock,
    },
    include: combinacionInclude,
  });
}

export async function updateCombinacion(
  id: string,
  data: Prisma.CombinacionVarianteUpdateInput,
) {
  return prisma.combinacionVariante.update({
    where: { id },
    data,
    include: combinacionInclude,
  });
}

export async function removeCombinacion(id: string) {
  return prisma.combinacionVariante.delete({ where: { id } });
}
