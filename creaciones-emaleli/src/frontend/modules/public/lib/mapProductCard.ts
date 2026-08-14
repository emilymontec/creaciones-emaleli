import type { ProductCardDTO } from "../components/ProductCard";

interface ProductoConTarjeta {
  id: string;
  nombre: string;
  slug: string;
  precioBase: unknown;
  precioDescuento: unknown;
  tiempoProduccion: number | null;
  estado: string;
  imagenes: { url: string }[];
  categorias: { nombre: string }[];
}

export function mapProductCard(producto: ProductoConTarjeta): ProductCardDTO {
  return {
    id: producto.id,
    nombre: producto.nombre,
    slug: producto.slug,
    precioBase: Number(producto.precioBase),
    precioDescuento:
      producto.precioDescuento !== null && producto.precioDescuento !== undefined
        ? Number(producto.precioDescuento)
        : null,
    tiempoProduccion: producto.tiempoProduccion,
    estado: producto.estado,
    imagenUrl: producto.imagenes[0]?.url ?? null,
    categoriaNombre: producto.categorias[0]?.nombre,
  };
}
