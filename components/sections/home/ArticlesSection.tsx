import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ARTICLES, type Article } from "@/lib/data/articles";

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`} className="group flex flex-col">
      {/* Imagen */}
      <div className="relative mb-6 aspect-4/3 overflow-hidden rounded-xl shadow-md">
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Badge categoría */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-md">
            {article.category}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <h3
        className={cn(
          "mb-3 text-xl font-bold leading-snug",
          "text-foreground transition-colors group-hover:text-primary"
        )}
      >
        {article.title}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {article.excerpt}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span>{article.readingTime}</span>
        <span className="size-1 rounded-full bg-border" />
        <span>{article.date}</span>
      </div>
    </Link>
  );
}

export function ArticlesSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Consejos de Santuario
            </h2>
            <p className="text-muted-foreground">
              Aprende a cuidar el bienestar de tu mascota con nuestros expertos.
            </p>
          </div>

          <Link
            href="/blog"
            className="group flex shrink-0 items-center gap-2 text-sm font-bold text-primary transition-all hover:gap-3"
          >
            Ver todos los artículos
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid de artículos */}
        <div className="grid gap-8 md:grid-cols-3">
          {ARTICLES.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
