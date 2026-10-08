import { SITE_CONFIG } from "@/constants";
import { articleUrl, getAllArticles, getCategory } from "@/lib/blog";

// Se genera una vez en build.
export const dynamic = "force-static";

function escapeXml(text: string) {
  return text.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}

export function GET() {
  const items = getAllArticles()
    .map((a) => {
      const url = `${SITE_CONFIG.url}${articleUrl(a.slug)}`;
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(a.excerpt)}</description>
      <category>${escapeXml(getCategory(a.category)?.name ?? a.category)}</category>
      <pubDate>${new Date(`${a.publishedAt}T12:00:00-05:00`).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Paku — Tips y chismes caninos</title>
    <link>${SITE_CONFIG.url}/blog</link>
    <description>Consejos para cuidar a tu perro o gato.</description>
    <language>es-PE</language>
    <atom:link href="${SITE_CONFIG.url}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
