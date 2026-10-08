import { WHY_PAKU } from "@/lib/data/home";
import { SectionHeading } from "./SectionHeading";

/** "¿Por qué los peludos aman Paku?": beneficios confirmados, con emojis. */
export function WhyPakuSection() {
  return (
    <section aria-labelledby="why-heading" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="why-heading"
          eyebrow="💙 ¿Por qué Paku?"
          title="¿Por qué los peludos aman Paku?"
          description="Lo cuidamos con el mismo cariño y paciencia que tú, sin jaulas ni trajines."
        />

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_PAKU.map((item) => (
            <li
              key={item.title}
              className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <span
                aria-hidden="true"
                className="flex size-14 items-center justify-center rounded-[46%_54%_58%_42%/48%_42%_58%_52%] bg-primary/10 text-3xl"
              >
                {item.emoji}
              </span>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
