export interface OpcionPrecio {
  precioExtra: number;
}

export interface PersonalizacionSeleccionPrecio {
  /** Precio fijo del campo (ej. checkbox marcado, cargo por archivo). */
  precioExtra?: number;
  /** Precio de la opción elegida, para campos tipo LISTA. */
  opcionPrecioExtra?: number;
}

export interface CalcularPrecioUnitarioParams {
  precioBase: number;
  precioDescuento?: number | null;
  /** Precio propio de la combinación de variantes seleccionada, si tiene. */
  precioCombinacion?: number | null;
  opciones?: OpcionPrecio[];
  personalizaciones?: PersonalizacionSeleccionPrecio[];
}

/**
 * Precio de una unidad del producto con la selección actual de
 * variantes y personalizaciones. Se usa tanto en la ficha de producto
 * (cálculo en vivo) como al agregar/editar un ítem del carrito.
 *
 * Si la combinación seleccionada tiene un precio propio (`precioCombinacion`),
 * este reemplaza por completo precioBase/precioDescuento Y el precioExtra
 * de cada opción (se asume que ya está incluido en ese precio de SKU). Si
 * no lo tiene, se usa el modelo aditivo normal: base + suma de precioExtra
 * de cada opción seleccionada.
 */
export function calcularPrecioUnitario({
  precioBase,
  precioDescuento,
  precioCombinacion,
  opciones = [],
  personalizaciones = [],
}: CalcularPrecioUnitarioParams): number {
  const base =
    precioCombinacion ?? precioDescuento ?? precioBase;

  const extraOpciones =
    precioCombinacion != null
      ? 0
      : opciones.reduce((sum, o) => sum + o.precioExtra, 0);

  const extraPersonalizaciones = personalizaciones.reduce(
    (sum, p) => sum + (p.precioExtra ?? 0) + (p.opcionPrecioExtra ?? 0),
    0,
  );

  return base + extraOpciones + extraPersonalizaciones;
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
