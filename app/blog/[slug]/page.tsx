import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleBody, TableOfContents } from "@/components/blog/ArticleBody";
import { ArticleCard, ArticleMeta } from "@/components/blog/ArticleCard";
import { JsonLd } from "@/components/blog/JsonLd";
import { ShareLinks } from "@/components/blog/ShareLinks";
import { FinalCtaSection } from "@/components/sections/home/FinalCtaSection";
import { SITE_CONFIG } from "@/constants";
import {
  articleUrl,
  categoryUrl,
  getAllArticles,
  getArticle,
  getCategory,
  getRelatedArticles,
  readingMinutes,
  RSS_ALTERNATE,
} from "@/lib/blog";

// Solo existen los artículos de lib/data/articles.ts; cualquier otro slug da 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return {};
  const url = articleUrl(article.slug);
  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
    authors: [{ name: article.author }],
    alternates: { canonical: url, types: RSS_ALTERNATE },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image, alt: article.imageAlt }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author],
      section: getCategory(article.category)?.name,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  const category = getCategory(article.category);
  const related = getRelatedArticles(article);
  const absoluteUrl = `${SITE_CONFIG.url}${articleUrl(article.slug)}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.excerpt,
          image: [article.image],
          datePublished: article.publishedAt,
          dateModified: article.updatedAt ?? article.publishedAt,
          author: { "@type": "Organization", name: article.author, url: SITE_CONFIG.url },
          publisher: {
            "@type": "Organization",
            name: "Paku",
            logo: { "@type": "ImageObject", url: `${SITE_CONFIG.url}/assets/imagotipo.png` },
          },
          mainEntityOfPage: absoluteUrl,
          articleSection: category?.name,
          keywords: article.tags.join(", "),
          inLanguage: "es-PE",
          timeRequired: `PT${readingMinutes(article)}M`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_CONFIG.url },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_CONFIG.url}/blog` },
            ...(category
              ? [{ "@type": "ListItem", position: 3, name: category.name, item: `${SITE_CONFIG.url}${categoryUrl(category.slug)}` }]
              : []),
            { "@type": "ListItem", position: category ? 4 : 3, name: article.title, item: absoluteUrl },
          ],
        }}
      />

      <article className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Migas de pan */}
        <nav aria-label="Migas de pan" className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-primary">Inicio</Link>
          <ChevronRight className="size-3" aria-hidden="true" />
          <Link href="/blog" className="transition-colors hover:text-primary">Blog</Link>
          {category && (
            <>
              <ChevronRight className="size-3" aria-hidden="true" />
              <Link href={categoryUrl(category.slug)} className="font-semibold text-primary">
                {category.name}
              </Link>
            </>
          )}
        </nav>

        <header className="mb-10 max-w-3xl">
          {category && (
            <Link
              href={categoryUrl(category.slug)}
              className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/15"
            >
              <span aria-hidden="true">{category.emoji}</span>
              {category.name}
            </Link>
          )}
          <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
            {article.title}
          </h1>
          <p className="mb-5 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-xs font-bold text-foreground">Por {article.author}</span>
            <ArticleMeta article={article} />
          </div>
        </header>

        <div className="relative mb-12 aspect-video overflow-hidden rounded-3xl shadow-lg ring-1 ring-border/60">
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1152px) 100vw, 1152px"
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <ArticleBody blocks={article.blocks} />

            <p className="mt-10 rounded-2xl bg-muted/60 p-4 text-sm leading-relaxed text-muted-foreground">
              Este artículo es informativo y no reemplaza la consulta veterinaria. Si notas cambios en la salud
              o el comportamiento de tu mascota, consulta con tu veterinario.
            </p>

            <div className="mt-8 flex flex-col gap-5 border-t border-border/60 pt-6">
              {article.tags.length > 0 && (
                <ul aria-label="Etiquetas" className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <li key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      #{tag}
                    </li>
                  ))}
                </ul>
              )}
              <ShareLinks url={absoluteUrl} title={article.title} />
            </div>
          </div>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:h-fit">
            <TableOfContents blocks={article.blocks} />

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
              <h2 className="mb-4 inline-flex items-center gap-2 text-base font-extrabold tracking-tight">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                Resumen práctico
              </h2>
              <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {article.takeaways.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-5 w-full rounded-full font-bold">
                <Link href="/booking">🐶 Agenda su baño</Link>
              </Button>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-border/60 bg-muted/40 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 id="related-heading" className="mb-8 text-2xl font-black tracking-tight text-primary md:text-3xl">
              Sigue leyendo 🐾
            </h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <li key={a.slug}>
                  <ArticleCard article={a} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <FinalCtaSection />
    </>
  );
}
