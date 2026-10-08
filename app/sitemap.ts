import type { MetadataRoute } from "next";
import { ROUTES, SITE_CONFIG } from "@/constants";
import { articleUrl, categoryUrl, getAllArticles, getCategoriesWithCount } from "@/lib/blog";

/**
 * Sitemap dinámico generado por Next.js.
 * Se expone en /sitemap.xml automáticamente.
 * Agregar nuevas rutas aquí a medida que se creen páginas.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;
  const articles = getAllArticles();

  // Blog: cada artículo con su fecha real, y cada categoría con la de su artículo más reciente
  const blogEntries: MetadataRoute.Sitemap = [
    ...articles.map((a) => ({
      url: `${baseUrl}${articleUrl(a.slug)}`,
      lastModified: new Date(a.updatedAt ?? a.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [a.image],
    })),
    ...getCategoriesWithCount().map((c) => ({
      url: `${baseUrl}${categoryUrl(c.slug)}`,
      lastModified: new Date(articles.find((a) => a.category === c.slug)!.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  return [
    ...blogEntries,
    {
      url: `${baseUrl}${ROUTES.HOME}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}${ROUTES.PAKU_SPA}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}${ROUTES.NOSOTROS}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}${ROUTES.BLOG}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}${ROUTES.BOOKING}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}${ROUTES.POLITICAS.TERMINOS}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}${ROUTES.POLITICAS.PRIVACIDAD}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}${ROUTES.POLITICAS.COOKIES}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}${ROUTES.ELIMINAR_CUENTA}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}${ROUTES.CONTACTO}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}${ROUTES.SOPORTE}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
