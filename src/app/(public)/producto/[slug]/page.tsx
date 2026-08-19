import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductPurchasePanel } from "@/src/frontend/modules/public/components/ProductPurchasePanel";
import { ProductCard } from "@/src/frontend/modules/public/components/ProductCard";
import { mapProductCard } from "@/src/frontend/modules/public/lib/mapProductCard";
import {
  getProductBySlugPublic,
  getRelatedProducts,
} from "@/src/backend/modules/productos/services/public-catalog.service";

// ISR: el precio/personalización en vivo se calcula en el cliente
// (ProductPurchasePanel), así que el contenido del producto en sí puede
// cachearse por 5 minutos sin afectar el cálculo de precio que ve el
// comprador — evita re-consultar la base de datos en cada visita a un
// producto ya popular.
export const revalidate = 300;

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductBySlugPublic(slug);

  if (!producto) {
    return { title: "Producto no encontrado" };
  }

  const titulo = producto.seoTitulo || producto.nombre;
  const descripcion =
    producto.seoDescripcion ||
    producto.descripcionCorta ||
    `${producto.nombre} — personalízalo a tu gusto en Creaciones Emaleli.`;
  const imagen =
    producto.seoImagen ||
    producto.imagenes[0]?.url ||
    "/brand/logo-emaleli.png";

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/producto/${producto.slug}` },
    openGraph: {
      title: titulo,
      description: descripcion,
      images: [imagen],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [imagen],
    },
  };
}

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

  const precioFinal = Number(producto.precioDescuento ?? producto.precioBase);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description:
      producto.seoDescripcion || producto.descripcionCorta || producto.nombre,
    image: producto.imagenes.map((i: Imagen) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "COP",
      price: precioFinal.toFixed(0),
      availability:
        producto.estado === "AGOTADO"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/producto/${producto.slug}`,
    },
  };

  return (
    <div className="mx-auto w-full max-w-page px-4 py-8 sm:px-6 sm:py-10">
      {/* Datos estructurados para resultados enriquecidos en buscadores */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
          imagenes:
            producto.imagenes.length > 0
              ? producto.imagenes.map((i: Imagen) => ({
                  id: i.id,
                  url: i.url,
                }))
              : producto.seoImagen
                ? [{ id: "seo", url: producto.seoImagen }]
                : [],
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
