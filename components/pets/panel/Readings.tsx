import { BookOpen } from "lucide-react";
import { ArticleCard } from "@/components/blog/ArticleCard";
import type { Article } from "@/lib/blog";

export function Readings({ petName, articles }: { petName: string; articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground">
        <BookOpen className="size-5 text-primary" aria-hidden="true" />
        Lecturas para {petName}
      </h2>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {articles.map((a) => (
          <li key={a.slug}>
            <ArticleCard article={a} />
          </li>
        ))}
      </ul>
    </section>
  );
}
