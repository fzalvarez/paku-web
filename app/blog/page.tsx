import type { Metadata } from "next";
import { BlogListing } from "@/components/blog/BlogListing";
import { JsonLd } from "@/components/blog/JsonLd";
import { SITE_CONFIG } from "@/constants";
import { RSS_ALTERNATE, articleUrl, getAllArticles } from "@/lib/blog";

const TITLE = "Tips y chismes caninos";
const DESCRIPTION =
  "Consejos para cuidar a tu perro o gato: baño, piel, dientes, sueño, comportamiento y más. El rincón perruno de Paku.";

export const metadata: Metadata = {
  title: `${TITLE} — Blog`,
  description: DESCRIPTION,
  alternates: { canonical: "/blog", types: RSS_ALTERNATE },
  openGraph: { title: `${TITLE} — Blog de Paku`, description: DESCRIPTION, url: "/blog", type: "website" },
};

export default function BlogPage() {
  const articles = getAllArticles();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "El rincón perruno de Paku",
          description: DESCRIPTION,
          url: `${SITE_CONFIG.url}/blog`,
          blogPost: articles.map((a) => ({
            "@type": "BlogPosting",
            headline: a.title,
            url: `${SITE_CONFIG.url}${articleUrl(a.slug)}`,
            datePublished: a.publishedAt,
          })),
        }}
      />
      <BlogListing
        articles={articles}
        eyebrow="📖 El rincón perruno"
        title={`${TITLE} 🐾`}
        description="Consejos para que tu mascota viva su mejor vida: cuidado, salud, comportamiento y más."
      />
    </>
  );
}
