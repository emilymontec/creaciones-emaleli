import { notFound } from "next/navigation";
import { ProductPurchasePanel } from "@/src/frontend/modules/public/components/ProductPurchasePanel";
import { ProductCard } from "@/src/frontend/modules/public/components/ProductCard";
import { mapProductCard } from "@/src/frontend/modules/public/lib/mapProductCard";
import {
  getProductBySlugPublic,
  getRelatedProducts,
} from "@/src/backend/modules/productos/services/public-catalog.service";

type ProductoDetalle = NonNullable<
  Awaited<ReturnType<typeof getProductBySlugPublic>>
>;
type Categoria = ProductoDetalle["categorias"][number];
type Imagen = ProductoDetalle["imagenes"][number];
type Variante = ProductoDetalle["variantes"][number];
type Combinacion = ProductoDetalle["combinaciones"][number];
type Opcion = Combinacion["opciones"][number];
type Personalizacion = ProductoDetalle["personalizaciones"][number];
type Relacionado = Awaited<ReturnType<typeof getRelatedProducts>>[number];

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const producto = await getProductBySlugPublic(slug);
  if (!producto) notFound();

  const relacionados = await getRelatedProducts(
    producto.id,
    producto.categorias.map((c: Categoria) => c.id),
    4,
  );

  return (
    <div className="mx-auto w-full max-w-page px-4 py-8 sm:px-6 sm:py-10">
      <ProductPurchasePanel
        producto={{
          id: producto.id,
          nombre: producto.nombre,
          slug: producto.slug,
          descripcionLarga: producto.descripcionLarga,
          precioBase: Number(producto.precioBase),
          precioDescuento:
            producto.precioDescuento !== null
              ? Number(producto.precioDescuento)
              : null,
          tiempoProduccion: producto.tiempoProduccion,
          estado: producto.estado,
          imagenes: producto.imagenes.map((i: Imagen) => ({
            id: i.id,
            url: i.url,
          })),
          variantes: producto.variantes.map((v: Variante) => ({
            id: v.id,
            nombre: v.nombre,
            tipo: v.tipo,
            imagen: v.imagen,
            precioExtra: Number(v.precioExtra),
          })),
          combinaciones: producto.combinaciones.map((c: Combinacion) => ({
            id: c.id,
            precio: c.precio !== null ? Number(c.precio) : null,
            stock: c.stock,
            opcionIds: c.opciones.map((o: Opcion) => o.id),
          })),
          personalizaciones: producto.personalizaciones.map(
            (p: Personalizacion) => ({
              id: p.id,
              nombre: p.nombre,
              tipo: p.tipo as never,
              obligatorio: p.obligatorio,
              precioExtra:
                p.precioExtra !== null ? Number(p.precioExtra) : null,
              opciones: p.opciones as never,
            }),
          ),
        }}
      />

      {relacionados.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 font-display text-xl font-bold text-gray-900">
            Productos relacionados
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relacionados.map((p: Relacionado) => (
              <ProductCard key={p.id} producto={mapProductCard(p)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
