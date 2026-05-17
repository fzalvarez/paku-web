import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account/",
          "/dashboard/",
          "/booking/",
          "/api/",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
