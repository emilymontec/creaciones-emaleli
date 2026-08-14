import { prisma } from "@/src/backend/shared/prisma";
import { Prisma } from "@/generated/prisma/client";

const listInclude = {
  categorias: { select: { id: true, nombre: true } },
} satisfies Prisma.ProductoInclude;

export async function create(data: Prisma.ProductoCreateInput) {
  return prisma.producto.create({ data, include: listInclude });
}

export async function findAll() {
  return prisma.producto.findMany({
    include: listInclude,
    orderBy: { createdAt: "desc" },
  });
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
