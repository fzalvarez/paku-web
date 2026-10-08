import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  articleUrl,
  categoryUrl,
  getCategoriesWithCount,
  type Article,
  type CategorySlug,
} from "@/lib/blog";
import { ArticleCard, ArticleMeta, CategoryPill } from "./ArticleCard";

/** Filtro de categorías: son enlaces a páginas reales (indexables), no un filtro en el cliente. */
export function CategoryFilter({ active }: { active?: CategorySlug }) {
  const categories = getCategoriesWithCount();
  const pill = "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors";
  const on = "bg-primary text-primary-foreground shadow-xs";
  const off = "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary";

  return (
    <nav aria-label="Categorías del blog" className="flex flex-wrap items-center gap-2">
      <Tag className="size-4 text-muted-foreground" aria-hidden="true" />
      <Link href="/blog" className={cn(pill, !active ? on : off)} aria-current={!active ? "page" : undefined}>
        Todos
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={categoryUrl(c.slug)}
          className={cn(pill, active === c.slug ? on : off)}
          aria-current={active === c.slug ? "page" : undefined}
        >
          <span aria-hidden="true">{c.emoji}</span>
          {c.name}
          <span className="opacity-60">({c.count})</span>
        </Link>
      ))}
    </nav>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <Link
      href={articleUrl(article.slug)}
      className="group relative flex min-h-105 flex-col justify-end overflow-hidden rounded-3xl shadow-lg lg:col-span-2"
    >
      <Image
        src={article.image}
        alt={article.imageAlt}
        fill
        priority
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 1024px) 100vw, 66vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
      <div className="relative flex flex-col items-start gap-3 p-6 sm:p-8">
        <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-950">
          ✨ Lo más nuevo
        </span>
        <h2 className="max-w-2xl text-2xl font-extrabold leading-snug text-white md:text-3xl">{article.title}</h2>
        <p className="max-w-xl text-sm leading-relaxed text-white/80 md:text-base">{article.excerpt}</p>
        <div className="flex flex-wrap items-center gap-3">
          <CategoryPill article={article} />
          <ArticleMeta article={article} className="text-white/70 [&_.bg-border]:bg-white/40" />
        </div>
      </div>
    </Link>
  );
}

/**
 * Listado del blog (portada y páginas de categoría). El primer artículo va
 * destacado solo en la portada; en categorías todos van en grilla.
 */
export function BlogListing({
  articles,
  activeCategory,
  title,
  description,
  eyebrow,
}: {
  articles: Article[];
  activeCategory?: CategorySlug;
  title: string;
  description: string;
  eyebrow: string;
}) {
  const featured = !activeCategory ? articles[0] : undefined;
  const sideArticles = featured ? articles.slice(1, 2) : [];
  const gridArticles = featured ? articles.slice(2) : articles;

  return (
    <>
      <header className="border-b border-border/60 bg-muted/40">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-4 py-14 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            {eyebrow}
          </span>
          <h1 className="text-4xl font-black tracking-tight text-primary md:text-5xl">{title}</h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{description}</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <CategoryFilter active={activeCategory} />
        </div>

        {featured && (
          <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <FeaturedArticle article={featured} />
            {sideArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} headingLevel="h2" />
            ))}
          </div>
        )}

        {gridArticles.length > 0 && (
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {gridArticles.map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} headingLevel="h2" />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-14 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-bold text-muted-foreground">
            {articles.length} {articles.length === 1 ? "artículo" : "artículos"}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    </>
  );
}
