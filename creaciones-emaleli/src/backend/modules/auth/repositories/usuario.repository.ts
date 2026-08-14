import { prisma } from "@/src/backend/shared/prisma";

export function findByEmail(email: string) {
  return prisma.usuario.findUnique({
    where: { email },
  });
}

export function findByNombre(nombre: string) {
  return prisma.usuario.findFirst({
    where: { nombre },
  });
}

export function findByUsername(username: string) {
  return prisma.usuario.findUnique({
    where: { username },
  });
}

export function findById(id: string) {
  return prisma.usuario.findUnique({
    where: { id },
  });
}

export function actualizarPerfil(
  id: string,
  data: {
    username?: string;
    nombre?: string;
    email?: string;
    telefono?: string | null;
    empresa?: string | null;
    cargo?: string | null;
  },
) {
  return prisma.usuario.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      nombre: true,
      email: true,
      telefono: true,
      empresa: true,
      cargo: true,
      rol: true,
    },
  });
}

export function actualizarPassword(id: string, passwordHash: string) {
  return prisma.usuario.update({
    where: { id },
    data: { passwordHash },
    select: { id: true },
  });
}
