import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { ARTICLES } from "@/lib/data/articles";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Consejos, tips y guías de expertos para cuidar el bienestar de tu mascota.",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = ["Todos", ...Array.from(new Set(ARTICLES.map((a) => a.category)))];

const CATEGORY_COLORS: Record<string, string> = {
  Cuidado: "bg-primary/10 text-primary",
  Tips: "bg-green-500/10 text-green-700",
  Invierno: "bg-sky-500/10 text-sky-700",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-muted text-muted-foreground";
}

// ── Tarjeta de artículo (hero: primera) ──────────────────────────────────────

function FeaturedCard() {
  const article = ARTICLES[0];
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group relative col-span-1 flex min-h-105 flex-col justify-end overflow-hidden rounded-2xl shadow-xl md:col-span-2"
    >
      <Image
        src={article.image}
        alt={article.imageAlt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 66vw"
        priority
      />
      {/* Gradiente */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

      {/* Contenido */}
      <div className="relative p-8">
        <span
          className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${categoryColor(article.category)}`}
        >
          {article.category}
        </span>
        <h2 className="mb-3 text-2xl font-extrabold leading-snug text-white md:text-3xl">
          {article.title}
        </h2>
        <p className="mb-5 max-w-xl text-sm leading-relaxed text-white/80">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-3 text-xs font-semibold text-white/60">
          <Clock className="size-3.5" />
          <span>{article.readingTime}</span>
          <span className="size-1 rounded-full bg-white/40" />
          <span>{article.date}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Tarjeta estándar ─────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: (typeof ARTICLES)[number] }) {
  return (
    <Link href={`/blog/${article.slug}`} className="group flex flex-col">
      {/* Imagen */}
      <div className="relative mb-5 aspect-4/3 overflow-hidden rounded-2xl shadow-md">
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute left-4 top-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-md ${categoryColor(article.category)}`}
          >
            {article.category}
          </span>
        </div>
      </div>

      {/* Texto */}
      <h3 className="mb-2 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
        {article.title}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {article.excerpt}
      </p>
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Clock className="size-3" />
        <span>{article.readingTime}</span>
        <span className="size-1 rounded-full bg-border" />
        <span>{article.date}</span>
      </div>
    </Link>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const rest = ARTICLES.slice(1);

  return (
    <>
      {/* Hero de la página */}
      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver al inicio
          </Link>
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight md:text-6xl">
            Blog
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Consejos, tips y guías de expertos para que tu mascota viva su
            mejor vida.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Filtros por categoría */}
        <div className="mb-12 flex flex-wrap items-center gap-2">
          <Tag className="size-4 text-muted-foreground" />
          {ALL_CATEGORIES.map((cat) => (
            <span
              key={cat}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
                cat === "Todos"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Artículo destacado + grid */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <FeaturedCard />
          <div className="flex flex-col gap-8">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* Separador con total */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-bold text-muted-foreground">
            {ARTICLES.length} artículos publicados
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    </>
  );
}
