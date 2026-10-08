import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import {
  articleUrl,
  formatArticleDate,
  getCategory,
  readingTimeLabel,
  type Article,
} from "@/lib/blog";

/** Etiqueta de categoría sobre la imagen. */
export function CategoryPill({ article, className = "" }: { article: Article; className?: string }) {
  const category = getCategory(article.category);
  if (!category) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-background/95 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary shadow-xs ${className}`}
    >
      <span aria-hidden="true">{category.emoji}</span>
      {category.name}
    </span>
  );
}

export function ArticleMeta({ article, className = "" }: { article: Article; className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold text-muted-foreground ${className}`}>
      <Clock className="size-3.5" />
      <span>{readingTimeLabel(article)}</span>
      <span className="size-1 rounded-full bg-border" />
      <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
    </div>
  );
}

/** Tarjeta de artículo para listados (blog, categorías, relacionados y home). */
export function ArticleCard({ article, headingLevel = "h3" }: { article: Article; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <Link
      href={articleUrl(article.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <CategoryPill article={article} className="absolute left-4 top-4" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <ArticleMeta article={article} />
        <Heading className="text-lg font-extrabold leading-snug text-foreground transition-colors group-hover:text-primary md:text-xl">
          {article.title}
        </Heading>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
        <span className="flex items-center gap-1 text-sm font-extrabold text-primary transition-all group-hover:gap-1.5">
          Leer más
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
