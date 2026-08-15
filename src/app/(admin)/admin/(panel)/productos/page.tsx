import { PageHeader } from "@/src/frontend/components/shared/PageHeader";
import { Card } from "@/src/frontend/components/ui/Card";
import { NewProductButton } from "@/src/frontend/modules/productos/components/NewProductButton";
import { ProductsTable } from "@/src/frontend/modules/productos/components/ProductsTable";
import { getProducts } from "@/src/backend/modules/productos/services/product.service";
import { getCategories } from "@/src/backend/modules/categorias/services/category.service";

type ProductosResult = Awaited<ReturnType<typeof getProducts>>;
type ProductoConCategorias = ProductosResult["items"][number];
type Categoria = Awaited<ReturnType<typeof getCategories>>[number];

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const [productosResult, categorias] = await Promise.all([
    getProducts({ page }),
    getCategories(),
  ]);

  // Prisma.Decimal no es serializable de servidor -> cliente: se convierte
  // a number antes de pasarlo al componente cliente de la tabla.
  const productos = productosResult.items.map((p: ProductoConCategorias) => ({
    ...p,
    precioBase: Number(p.precioBase),
    precioDescuento: p.precioDescuento ? Number(p.precioDescuento) : null,
  }));

  const categoriaOptions = categorias.map((c: Categoria) => ({
    id: c.id,
    nombre: c.nombre,
  }));

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Administra el catálogo completo: precios, descripciones, SEO y categorías."
        action={<NewProductButton categoriaOptions={categoriaOptions} />}
      />

      <Card className="p-0">
        <ProductsTable
          productos={productos}
          categoriaOptions={categoriaOptions}
          pagination={{
            page: productosResult.page,
            totalPages: productosResult.pages,
            total: productosResult.total,
          }}
        />
      </Card>
    </div>
  );
}
