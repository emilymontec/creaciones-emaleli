import { PageHeader } from "@/src/frontend/components/shared/PageHeader";
import { Card } from "@/src/frontend/components/ui/Card";
import { NewCategoryButton } from "@/src/frontend/modules/categorias/components/NewCategoryButton";
import { CategoriasTable } from "@/src/frontend/modules/categorias/components/CategoriasTable";
import { getCategories } from "@/src/backend/modules/categorias/services/category.service";

export default async function CategoriasPage() {
  const categorias = await getCategories();

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Organiza el catálogo de la tienda en categorías. Arrastra las filas para reordenarlas."
        action={<NewCategoryButton />}
      />

      <Card className="p-0">
        <CategoriasTable categorias={categorias} />
      </Card>
    </div>
  );
}
