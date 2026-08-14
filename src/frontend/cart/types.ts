export interface CartItemOpcion {
  opcionId: string;
  nombre: string;
  tipo: string;
  precioExtra: number;
}

export interface CartItemPersonalizacion {
  personalizacionId: string;
  nombre: string;
  tipo: string;
  /** Texto legible del valor elegido (para mostrar en el carrito). */
  valor: string;
  precioExtra: number;
}

export interface CartItem {
  /** Id de línea: permite tener el mismo producto dos veces con distinta configuración. */
  id: string;
  productoId: string;
  nombre: string;
  slug: string;
  imagenUrl: string | null;
  precioUnitario: number;
  cantidad: number;
  tiempoProduccion: number | null;
  combinacionId: string | null;
  opciones: CartItemOpcion[];
  personalizaciones: CartItemPersonalizacion[];
  addedAt: number;
}

export type NewCartItem = Omit<CartItem, "id" | "addedAt">;
