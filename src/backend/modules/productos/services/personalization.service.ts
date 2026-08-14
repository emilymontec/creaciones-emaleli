import * as repository from "../repositories/personalization.repository";
import { AppError } from "@/src/shared/lib/errors";
import type { PersonalizationConfig } from "../schemas/personalization.schema";
import type { Prisma } from "@/generated/prisma/client";

type FieldData = {
  productoId: string;
  nombre: string;
  tipo: string;
  obligatorio: boolean;
  precioExtra?: number;
  config?: PersonalizationConfig;
};

export async function getPersonalizaciones(productoId: string) {
  return repository.findByProducto(productoId);
}

export async function createField(data: FieldData) {
  const orden = await repository.nextOrden(data.productoId);

  return repository.create({
    producto: { connect: { id: data.productoId } },
    nombre: data.nombre,
    tipo: data.tipo as Prisma.PersonalizacionCreateInput["tipo"],
    obligatorio: data.obligatorio,
    precioExtra: data.precioExtra,
    opciones: (data.config ?? undefined) as Prisma.InputJsonValue | undefined,
    orden,
  });
}

export async function updateField(
  id: string,
  data: Omit<FieldData, "productoId" | "tipo">,
) {
  return repository.update(id, {
    nombre: data.nombre,
    obligatorio: data.obligatorio,
    precioExtra: data.precioExtra,
    opciones: (data.config ?? undefined) as Prisma.InputJsonValue | undefined,
  });
}

export async function toggleActivo(id: string) {
  const field = await repository.findById(id);
  if (!field) {
    throw new AppError("El campo no existe.", {
      statusCode: 404,
      code: "PERSONALIZATION_NOT_FOUND",
    });
  }
  return repository.update(id, { activo: !field.activo });
}

export async function deleteField(id: string) {
  try {
    return await repository.remove(id);
  } catch {
    throw new AppError(
      "No puedes eliminar este campo porque ya está asociado a pedidos existentes. Desactívalo en su lugar.",
      { statusCode: 409, code: "PERSONALIZATION_HAS_DEPENDENCIES" },
    );
  }
}

export async function reorderFields(orderedIds: string[]) {
  const items = orderedIds.map((id, index) => ({ id, orden: index + 1 }));
  return repository.reorder(items);
}
