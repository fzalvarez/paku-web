import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { getAllArticles } from "@/lib/blog";
import { SectionHeading } from "./SectionHeading";

/** Últimos artículos del blog (home y dashboard). */
export function ArticlesSection({ limit = 3 }: { limit?: number }) {
  const articles = getAllArticles().slice(0, limit);

  return (
    <section aria-labelledby="articles-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="articles-heading"
          align="left"
          eyebrow="📖 El rincón perruno"
          title="Tips y chismes caninos 🐾"
          description="Consejos para que tu mascota viva su mejor vida."
          action={
            <Link
              href="/blog"
              className="group flex w-fit shrink-0 items-center gap-2 rounded-full bg-primary/8 px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/12"
            >
              Ver todos los artículos
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <ul className="grid gap-8 md:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
