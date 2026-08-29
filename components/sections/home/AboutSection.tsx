const ACCENT_CLASSES = {
  primary: { text: "text-primary", blobBg: "bg-primary/10", chipBg: "bg-primary/8" },
  tertiary: { text: "text-tertiary", blobBg: "bg-tertiary/10", chipBg: "bg-tertiary/8" },
  secondary: { text: "text-secondary", blobBg: "bg-secondary/10", chipBg: "bg-secondary/8" },
} as const;

const PILLARS = [
  {
    id: "purpose",
    accent: "primary",
    blobClass: "rounded-[46%_54%_58%_42%/48%_42%_58%_52%]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: "Nuestro propósito",
    description:
      "Brindar un cuidado más confiable y personalizado, integrando tecnología y servicio en una sola experiencia.",
  },
  {
    id: "vision",
    accent: "tertiary",
    blobClass: "rounded-[58%_42%_46%_54%/42%_56%_44%_58%]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5 13.4 8l4.5 1.4-4.5 1.4-1.4 4.5-1.4-4.5L6.1 9.4 10.6 8Z" />
        <path d="M19 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z" />
      </svg>
    ),
    title: "Hacia dónde vamos",
    description:
      "Construir un ecosistema digital donde salud, grooming y tecnología convivan de forma simple y conectada.",
  },
] as const;

const VALUES = ["Empatía", "Confianza", "Innovación", "Profesionalismo"] as const;

export function AboutSection() {
  return (
    <section id="quienes-somos" aria-labelledby="about-heading" className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-[3rem] p-8 md:p-12 border-b-4 border-primary shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)]">
          <h2 id="about-heading" className="text-3xl md:text-4xl font-black text-primary mb-4">
            ¿Quiénes somos?
          </h2>
          <p className="max-w-4xl mb-12 text-base font-medium leading-relaxed text-muted-foreground md:text-lg md:font-semibold xl:text-xl">
            PAKU es un ecosistema inteligente que combina tecnología y servicio
            para transformar el cuidado de tu mascota. Una experiencia más
            segura, conectada y personalizada en cada etapa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Propósito y Visión */}
            {PILLARS.map((pillar) => {
              const accent = ACCENT_CLASSES[pillar.accent];
              return (
                <div key={pillar.id}>
                  <div className="relative size-14 shrink-0 mb-4">
                    <div className={`absolute inset-0 ${pillar.blobClass} ${accent.blobBg}`} />
                    <div className={`absolute inset-0 flex items-center justify-center ${accent.text}`}>
                      {pillar.icon}
                    </div>
                  </div>
                  <h3 className={`mb-3 text-xl font-extrabold ${accent.text} md:text-2xl`}>
                    {pillar.title}
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-muted-foreground md:font-semibold">
                    {pillar.description}
                  </p>
                </div>
              );
            })}

            {/* Valores */}
            <div>
              <div className="relative size-14 shrink-0 mb-4">
                <div className={`absolute inset-0 rounded-[42%_58%_54%_46%/56%_44%_58%_42%] ${ACCENT_CLASSES.secondary.blobBg}`} />
                <div className={`absolute inset-0 flex items-center justify-center ${ACCENT_CLASSES.secondary.text}`}>
                  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20.5s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.5a4.5 4.5 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10Z" />
                  </svg>
                </div>
              </div>
              <h3 className={`mb-3 text-xl font-extrabold ${ACCENT_CLASSES.secondary.text}`}>
                Lo que nos define
              </h3>
              <div className="flex flex-wrap gap-2">
                {VALUES.map((v) => (
                  <span
                    key={v}
                    className={`rounded-full ${ACCENT_CLASSES.secondary.chipBg} px-3.5 py-1.5 text-sm font-bold ${ACCENT_CLASSES.secondary.text}`}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
