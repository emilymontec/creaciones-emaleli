import { HeroBanner } from "@/src/frontend/modules/public/components/HeroBanner";
import { CategoriesSection } from "@/src/frontend/modules/public/components/CategoriesSection";
import { FeaturedProductsSection } from "@/src/frontend/modules/public/components/FeaturedProductsSection";
import { FaqSection } from "@/src/frontend/modules/public/components/FaqSection";
import { mapProductCard } from "@/src/frontend/modules/public/lib/mapProductCard";
import { getFeaturedProducts } from "@/src/backend/modules/productos/services/public-catalog.service";
import { getPublicCategories } from "@/src/backend/modules/categorias/services/category.service";
import {
  obtenerConfigBanner,
  obtenerConfigFaq,
} from "@/src/backend/modules/configuracion/services/configuracion.service";

// ISR: la home no depende de datos por-usuario (el carrito vive en el
// cliente vía CartContext/localStorage), así que puede cachearse y
// revalidarse cada 5 minutos en vez de consultar la base de datos en cada
// visita — reduce carga en Supabase para la página con más tráfico del sitio.
export const revalidate = 300;

export default async function HomePage() {
  const [productosDestacados, categorias, banner, faq] = await Promise.all([
    getFeaturedProducts(8),
    getPublicCategories(),
    obtenerConfigBanner(),
    obtenerConfigFaq(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-12 px-4 py-8 sm:px-6 sm:py-10">
      <HeroBanner banner={banner} />
      <CategoriesSection categorias={categorias} />
      <FeaturedProductsSection
        productos={productosDestacados.map(mapProductCard)}
      />
      <FaqSection items={faq.items} />
    </div>
  );
}
