import type { MetadataRoute } from "next";
import { getAllActiveProductSlugs } from "@/src/backend/modules/productos/services/public-catalog.service";
import { getPublicCategories } from "@/src/backend/modules/categorias/services/category.service";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productos, categorias] = await Promise.all([
    getAllActiveProductSlugs(),
    getPublicCategories(),
  ]);

  const estaticas: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${APP_URL}/catalogo`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const rutasCategorias: MetadataRoute.Sitemap = categorias.map(
    (categoria: Awaited<ReturnType<typeof getPublicCategories>>[number]) => ({
      url: `${APP_URL}/catalogo?categoria=${categoria.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  const rutasProductos: MetadataRoute.Sitemap = productos.map((producto) => ({
    url: `${APP_URL}/producto/${producto.slug}`,
    lastModified: producto.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...estaticas, ...rutasCategorias, ...rutasProductos];
}
