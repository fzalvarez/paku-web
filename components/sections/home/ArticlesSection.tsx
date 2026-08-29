import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ARTICLES, type Article } from "@/lib/data/articles";

// Ciclo de acentos de marca por card, para que el badge, el borde inferior
// y el CTA "Leer más" varíen (mismo lenguaje visual que FeaturesBentoSection).
const ACCENTS = [
  { border: "border-tertiary", text: "text-tertiary", badgeText: "text-tertiary" },
  { border: "border-secondary", text: "text-secondary", badgeText: "text-secondary" },
  { border: "border-primary", text: "text-primary", badgeText: "text-primary" },
] as const;

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <Link
      href={`/blog/${article.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[1.625rem] bg-card border-b-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.10)] transition-shadow hover:shadow-lg",
        accent.border
      )}
    >
      {/* Imagen */}
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Badge categoría */}
        <div className="absolute left-4 top-4">
          <span className={cn("rounded-full bg-background/95 px-3 py-1 text-xs font-bold uppercase tracking-wide", accent.badgeText)}>
            {article.category}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col px-6 py-5">
        <h3 className="mb-2 text-xl font-extrabold leading-snug text-foreground md:text-2xl">
          {article.title}
        </h3>
        <p className="mb-4 flex-1 text-sm font-medium leading-relaxed text-muted-foreground md:text-base md:font-semibold">
          {article.excerpt}
        </p>

        {/* Meta + CTA */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>{article.readingTime}</span>
            <span className="size-1 rounded-full bg-border" />
            <span>{article.date}</span>
          </div>
          <span className={cn("flex shrink-0 items-center gap-1 text-sm font-extrabold transition-all group-hover:gap-1.5", accent.text)}>
            Leer más
            <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ArticlesSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-16 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h2 className="mb-3 text-3xl font-black tracking-tight text-primary md:text-4xl">
              Consejos de Santuario
            </h2>
            <p className="text-base font-medium leading-relaxed text-muted-foreground md:text-lg md:font-semibold">
              Aprende a cuidar el bienestar de tu mascota con nuestros expertos.
            </p>
          </div>

          <Link
            href="/blog"
            className="group flex shrink-0 items-center gap-2 rounded-full bg-primary/8 px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/12"
          >
            Ver todos los artículos
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid de artículos */}
        <div className="grid gap-8 md:grid-cols-3">
          {ARTICLES.map((article, index) => (
            <ArticleCard key={article.id} article={article} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
