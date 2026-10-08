import { TESTIMONIALS } from "@/lib/data/home";
import { SectionHeading } from "./SectionHeading";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** "Historias de colitas contentas". Los textos viven en `lib/data/home.ts`. */
export function TestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="border-y border-border/60 bg-muted/40 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="⭐ Amor comprobado"
          title="Historias de colitas contentas"
          description="Lo que cuentan las mamás y papás perrunos que ya probaron Paku."
        />

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <li
              key={i}
              className="flex flex-col justify-between gap-5 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-7"
            >
              <div className="flex flex-col gap-3">
                <span aria-hidden="true" className="text-sm tracking-widest text-amber-400">★★★★★</span>
                <blockquote className="text-sm italic leading-relaxed text-foreground/80">“{t.quote}”</blockquote>
              </div>
              <div className="flex items-center gap-3 border-t border-border/60 pt-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {initials(t.name)}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
