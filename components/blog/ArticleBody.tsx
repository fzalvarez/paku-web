import { Lightbulb } from "lucide-react";
import { headingId, type ArticleBlock } from "@/lib/blog";

/** Cuerpo del artículo a partir de bloques. Los h2 llevan ancla para el índice. */
export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-5 text-base leading-8 text-foreground/90 md:text-lg md:leading-9">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={i}
                id={headingId(block.text)}
                className="scroll-mt-24 pt-4 text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-3xl"
              >
                {block.text}
              </h2>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2.5 pl-1">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="mt-3.5 size-1.5 shrink-0 rounded-full bg-primary md:mt-4" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "tip":
            return (
              <aside
                key={i}
                className="flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-5 text-base leading-relaxed text-foreground"
              >
                <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <p>
                  <strong className="font-extrabold text-primary">Tip Paku: </strong>
                  {block.text}
                </p>
              </aside>
            );
          default:
            return <p key={i}>{block.text}</p>;
        }
      })}
    </div>
  );
}

/** Índice del artículo (solo si hay 3 o más secciones). */
export function TableOfContents({ blocks }: { blocks: ArticleBlock[] }) {
  const headings = blocks.filter((b): b is Extract<ArticleBlock, { type: "h2" }> => b.type === "h2");
  if (headings.length < 3) return null;
  return (
    <nav aria-label="En este artículo" className="rounded-2xl border border-border/60 bg-card p-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">En este artículo</p>
      <ol className="space-y-2 text-sm">
        {headings.map((h) => (
          <li key={h.text}>
            <a
              href={`#${headingId(h.text)}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
