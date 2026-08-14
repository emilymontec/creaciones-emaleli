import { HeroBanner } from "@/src/frontend/modules/public/components/HeroBanner";
import { CategoriesSection } from "@/src/frontend/modules/public/components/CategoriesSection";
import { FeaturedProductsSection } from "@/src/frontend/modules/public/components/FeaturedProductsSection";
import { mapProductCard } from "@/src/frontend/modules/public/lib/mapProductCard";
import { getFeaturedProducts } from "@/src/backend/modules/productos/services/public-catalog.service";
import { getPublicCategories } from "@/src/backend/modules/categorias/services/category.service";

export default async function HomePage() {
  const [productosDestacados, categorias] = await Promise.all([
    getFeaturedProducts(8),
    getPublicCategories(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-12 px-4 py-8 sm:px-6 sm:py-10">
      <HeroBanner />
      <CategoriesSection categorias={categorias} />
      <FeaturedProductsSection productos={productosDestacados.map(mapProductCard)} />
    </div>
  );
}
