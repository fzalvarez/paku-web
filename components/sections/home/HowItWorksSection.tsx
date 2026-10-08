import { HOW_IT_WORKS } from "@/lib/data/home";
import { SectionHeading } from "./SectionHeading";

/** "¿Cómo llega la felicidad a tu puerta?": los 3 pasos del servicio. */
export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="how-heading"
      className="scroll-mt-20 border-y border-border/60 bg-muted/40 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="how-heading"
          eyebrow="🛵 ¡Más fácil que pedir delivery!"
          title="¿Cómo llega la felicidad a tu puerta?"
          description="Sin colas, sin trasladarlo y sin mojar tu baño."
        />

        <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, idx) => (
            <li
              key={step.title}
              className="relative flex flex-col items-center gap-3 rounded-3xl border border-border/60 bg-card p-7 text-center shadow-sm transition-colors hover:border-primary/30"
            >
              <span className="flex size-16 items-center justify-center gap-1 rounded-full bg-primary text-xl font-black text-primary-foreground shadow-md">
                {idx + 1} <span aria-hidden="true">{step.emoji}</span>
              </span>
              <h3 className="text-xl font-extrabold tracking-tight text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              <span className="mt-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {step.tag}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
