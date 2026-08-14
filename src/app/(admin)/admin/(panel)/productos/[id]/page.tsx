import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/src/frontend/components/shared/PageHeader";
import { ProductManageTabs } from "@/src/frontend/modules/productos/components/manage/ProductManageTabs";
import { getProductById } from "@/src/backend/modules/productos/services/product.service";
import { getGaleria } from "@/src/backend/modules/productos/services/gallery.service";
import { getVariantes } from "@/src/backend/modules/productos/services/variant.service";
import { getPersonalizaciones } from "@/src/backend/modules/productos/services/personalization.service";

type Opcion = Awaited<ReturnType<typeof getVariantes>>["opciones"][number];
type Combinacion = Awaited<
  ReturnType<typeof getVariantes>
>["combinaciones"][number];
type PersonalizacionField = Awaited<
  ReturnType<typeof getPersonalizaciones>
>[number];

export default async function ProductoManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const producto = await getProductById(id);
  if (!producto) notFound();

  const [imagenes, { opciones, combinaciones }, campos] = await Promise.all([
    getGaleria(id),
    getVariantes(id),
    getPersonalizaciones(id),
  ]);

  // Serialización: Prisma.Decimal -> number para poder pasarlo a los
  // componentes cliente.
  const opcionesSerializadas = opciones.map((o: Opcion) => ({
    ...o,
    precioExtra: Number(o.precioExtra),
  }));

  const combinacionesSerializadas = combinaciones.map((c: Combinacion) => ({
    ...c,
    precio: c.precio ? Number(c.precio) : null,
    opciones: c.opciones.map((o: Opcion) => ({
      ...o,
      precioExtra: Number(o.precioExtra),
    })),
  }));

  const camposSerializados = campos.map((c: PersonalizacionField) => ({
    ...c,
    precioExtra: c.precioExtra ? Number(c.precioExtra) : null,
  }));

  return (
    <div>
      <Link
        href="/admin/productos"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="size-4" />
        Volver a productos
      </Link>

      <PageHeader
        title={producto.nombre}
        description="Gestiona la galería de imágenes, las variantes y los campos de personalización de este producto."
      />

      <ProductManageTabs
        productoId={id}
        imagenes={imagenes}
        opciones={opcionesSerializadas}
        combinaciones={combinacionesSerializadas}
        campos={camposSerializados}
      />
    </div>
  );
}
