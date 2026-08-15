import { prisma } from "@/src/backend/shared/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function findByClave(clave: string) {
  return prisma.configuracion.findUnique({ where: { clave } });
}

export async function upsertByClave(
  clave: string,
  valor: Prisma.InputJsonValue,
  descripcion?: string,
) {
  return prisma.configuracion.upsert({
    where: { clave },
    update: { valor, ...(descripcion ? { descripcion } : {}) },
    create: { clave, valor, descripcion },
  });
}
