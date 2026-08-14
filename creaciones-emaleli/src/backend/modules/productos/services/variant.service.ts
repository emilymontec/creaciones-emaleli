import * as repository from "../repositories/variant.repository";
import { AppError } from "@/src/shared/lib/errors";

export async function getVariantes(productoId: string) {
  const [opciones, combinaciones] = await Promise.all([
    repository.findOpcionesByProducto(productoId),
    repository.findCombinacionesByProducto(productoId),
  ]);
  return { opciones, combinaciones };
}

export async function createOpcion(data: {
  productoId: string;
  nombre: string;
  tipo: string;
  precioExtra: number;
  imagen?: string;
}) {
  const orden = await repository.nextOrdenOpcion(data.productoId, data.tipo);

  return repository.createOpcion({
    producto: { connect: { id: data.productoId } },
    nombre: data.nombre,
    tipo: data.tipo.toUpperCase(),
    precioExtra: data.precioExtra,
    imagen: data.imagen,
    orden,
  });
}

export async function updateOpcion(
  id: string,
  data: { nombre: string; precioExtra: number; imagen?: string },
) {
  return repository.updateOpcion(id, {
    nombre: data.nombre,
    precioExtra: data.precioExtra,
    imagen: data.imagen,
  });
}

export async function toggleOpcionActivo(id: string) {
  const opcion = await repository.findOpcionById(id);
  if (!opcion) {
    throw new AppError("La opción no existe.", {
      statusCode: 404,
      code: "VARIANT_OPTION_NOT_FOUND",
    });
  }
  return repository.updateOpcion(id, { activo: !opcion.activo });
}

export async function deleteOpcion(id: string) {
  try {
    return await repository.removeOpcion(id);
  } catch {
    throw new AppError(
      "No puedes eliminar esta opción porque ya está asociada a pedidos existentes. Desactívala en su lugar.",
      { statusCode: 409, code: "VARIANT_OPTION_HAS_DEPENDENCIES" },
    );
  }
}

/**
 * Genera el producto cartesiano de las opciones seleccionadas (agrupadas
 * por tipo, ej. Talla x Color) y crea las combinaciones que aún no
 * existan. Las que ya existen (mismo conjunto exacto de opciones) se
 * omiten para no duplicar filas de la matriz.
 */
export async function generateCombinaciones(
  productoId: string,
  gruposOpcionIds: string[][],
) {
  const grupos = gruposOpcionIds.filter((grupo) => grupo.length > 0);

  if (grupos.length === 0) {
    throw new AppError(
      "Selecciona al menos una opción para generar la matriz.",
      { statusCode: 400, code: "VARIANT_MATRIX_EMPTY_GROUP" },
    );
  }

  const combinacionesIds = cartesianProduct(grupos);

  const existentes = await repository.findCombinacionesByProducto(productoId);
  const existentesSets: Set<string>[] = existentes.map(
    (c: { opciones: { id: string }[] }) =>
      new Set(c.opciones.map((o: { id: string }) => o.id)),
  );

  const creadas = [];
  for (const ids of combinacionesIds) {
    const set = new Set(ids);
    const yaExiste = existentesSets.some(
      (s: Set<string>) => s.size === set.size && [...s].every((id) => set.has(id)),
    );
    if (yaExiste) continue;

    creadas.push(await repository.createCombinacion(productoId, ids, {}));
  }

  return creadas;
}

function cartesianProduct(grupos: string[][]): string[][] {
  return grupos.reduce<string[][]>(
    (acc, grupo) => acc.flatMap((combo) => grupo.map((id) => [...combo, id])),
    [[]],
  );
}

export async function updateCombinacion(
  id: string,
  data: { sku?: string; precio?: number | null; stock?: number | null; activo: boolean },
) {
  return repository.updateCombinacion(id, {
    sku: data.sku,
    precio: data.precio,
    stock: data.stock,
    activo: data.activo,
  });
}

export async function deleteCombinacion(id: string) {
  return repository.removeCombinacion(id);
}
