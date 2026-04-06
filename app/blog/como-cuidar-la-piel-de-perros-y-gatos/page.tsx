import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Clock3, Tag, Sparkles } from "lucide-react";
import { ARTICLES, type Article } from "@/lib/data/articles";

const ARTICLE_SLUG = "como-cuidar-la-piel-de-perros-y-gatos";
function getRequiredArticle(slug: string): Article {
  const found = ARTICLES.find((item) => item.slug === slug);
  if (!found) {
    throw new Error(`No se encontró el artículo con slug: ${slug}`);
  }
  return found;
}

const article = getRequiredArticle(ARTICLE_SLUG);

const articleParagraphs = article.body
  .split("\n\n")
  .map((paragraph) => paragraph.trim())
  .filter(Boolean);

const keyTakeaways = [
  "Usa champús hipoalergénicos y enjuaga completamente para evitar irritaciones.",
  "Mantén hidratación diaria y consulta suplementos como omega-3 con tu veterinario.",
  "Cepilla con frecuencia para distribuir aceites naturales y detectar anomalías a tiempo.",
];

export const metadata: Metadata = {
  title: `${article.title} | Blog`,
  description: article.excerpt,
  openGraph: {
    title: article.title,
    description: article.excerpt,
    images: [article.image],
  },
};

export default function BlogArticleSkinCarePage() {
  return (
    <>
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver al blog
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              <Tag className="size-3.5" />
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              <Clock3 className="size-3.5" />
              {article.readingTime}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {article.date}
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            {article.title}
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        </header>

        <div className="relative mb-12 aspect-video overflow-hidden rounded-3xl shadow-xl ring-1 ring-border/60">
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5 text-base leading-8 text-foreground/90 md:text-lg md:leading-9">
            {articleParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-muted/30 p-6">
            <h2 className="mb-4 inline-flex items-center gap-2 text-base font-extrabold tracking-tight">
              <Sparkles className="size-4 text-primary" />
              Resumen práctico
            </h2>
            <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {keyTakeaways.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/booking"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Reservar servicio
            </Link>
          </aside>
        </div>
      </article>
    </>
  );
}
