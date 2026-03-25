import type { MetadataRoute } from "next";
import { ROUTES, SITE_CONFIG } from "@/constants";

/**
 * Sitemap dinámico generado por Next.js.
 * Se expone en /sitemap.xml automáticamente.
 * Agregar nuevas rutas aquí a medida que se creen páginas.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;

  return [
    {
      url: `${baseUrl}${ROUTES.HOME}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
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
  ];
}
