const PAW_PATH =
  "M8.5 9.5c1 0 1.8-1.1 1.8-2.5S9.5 4.5 8.5 4.5 6.7 5.6 6.7 7s.8 2.5 1.8 2.5Zm7 0c1 0 1.8-1.1 1.8-2.5s-.8-2.5-1.8-2.5S13.7 5.6 13.7 7s.8 2.5 1.8 2.5Zm-10.3 3c.9 0 1.6-1 1.6-2.2S6.1 8.1 5.2 8.1s-1.6 1-1.6 2.2 .7 2.2 1.6 2.2Zm13.6 0c.9 0 1.6-1 1.6-2.2s-.7-2.2-1.6-2.2-1.6 1-1.6 2.2 .7 2.2 1.6 2.2ZM12 12.2c-2.4 0-5 1.9-5 4.5 0 1.5 1.1 2.3 2.6 2.3.9 0 1.5-.3 2.4-.3s1.5.3 2.4.3c1.5 0 2.6-.8 2.6-2.3 0-2.6-2.6-4.5-5-4.5Z";

const FEATURES = [
  {
    id: "history",
    accent: "primary",
    blobClass: "rounded-[46%_54%_58%_42%/48%_42%_58%_52%]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-8.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
        <path d="M8.5 8.5h7" />
        <path d="M8.5 12h7" />
        <path d="M8.5 15.5h4" />
        <circle cx="16.5" cy="17" r="4" fill="currentColor" stroke="none" />
        <path d="M14.9 17l1 1 2-2" stroke="white" strokeWidth={1.6} />
      </svg>
    ),
    title: "Historial completo",
    description:
      "Accede a todos los servicios y evolución de tu mascota en un solo lugar.",
  },
  {
    id: "ai",
    accent: "tertiary",
    blobClass: "rounded-[58%_42%_46%_54%/42%_56%_44%_58%]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-8.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5 13.4 8l4.5 1.4-4.5 1.4-1.4 4.5-1.4-4.5L6.1 9.4 10.6 8Z" />
        <path d="M19 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z" />
        <path d="M5.2 15.2l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5Z" />
      </svg>
    ),
    title: "Recomendaciones IA",
    description:
      "Basadas en su tipo de pelo, piel y comportamiento para un bienestar óptimo.",
  },
  {
    id: "security",
    accent: "secondary",
    blobClass: "rounded-[42%_58%_54%_46%/56%_44%_58%_42%]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-8.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5 5 6v5.5c0 5 3 8.6 7 9.5 4-.9 7-4.5 7-9.5V6Z" />
        <path d="M9 12l2.2 2.2L15.5 9.5" />
      </svg>
    ),
    title: "Seguimiento seguro",
    description:
      "Información clara y transparente durante todo el proceso de grooming.",
  },
] as const;

const ACCENT_CLASSES: Record<
  (typeof FEATURES)[number]["accent"],
  { border: string; text: string; blobBg: string; shadow: string }
> = {
  primary: {
    border: "border-primary",
    text: "text-primary",
    blobBg: "bg-primary/10",
    shadow: "shadow-[0_20px_40px_-15px_rgba(29,42,216,0.14)]",
  },
  tertiary: {
    border: "border-tertiary",
    text: "text-tertiary",
    blobBg: "bg-tertiary/10",
    shadow: "shadow-[0_20px_40px_-15px_rgba(182,83,152,0.14)]",
  },
  secondary: {
    border: "border-secondary",
    text: "text-secondary",
    blobBg: "bg-secondary/10",
    shadow: "shadow-[0_20px_40px_-15px_rgba(118,104,210,0.14)]",
  },
};

export function FeaturesBentoSection() {
  return (
    <section aria-labelledby="features-heading" className="py-16 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-14">
          <h2 id="features-heading" className="text-2xl md:text-4xl font-extrabold md:font-black text-primary">
            Cuidado inteligente para tu mascota
          </h2>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {FEATURES.map((feat) => {
            const accent = ACCENT_CLASSES[feat.accent];
            return (
              <div
                key={feat.id}
                className={`relative overflow-hidden bg-card rounded-[1rem] md:rounded-[2rem] p-8 flex flex-col gap-6 border-b-4 ${accent.border} ${accent.shadow} hover:shadow-lg transition-shadow`}
              >
                {/* Paw print decorativo */}
                <svg
                  viewBox="0 0 24 24"
                  className={`absolute right-4 top-4 size-9 opacity-[0.08] ${accent.text}`}
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={PAW_PATH} />
                </svg>

                {/* Ícono en blob orgánico */}
                <div className="relative size-14 md:size-19 shrink-0">
                  <div className={`absolute inset-0 ${feat.blobClass} ${accent.blobBg}`} />
                  <div className={`absolute inset-0 flex items-center justify-center ${accent.text}`}>
                    {feat.icon}
                  </div>
                </div>

                {/* Texto */}
                <div>
                  <h3 className={`mb-2 text-xl font-extrabold ${accent.text} md:text-2xl`}>
                    {feat.title}
                  </h3>
                  <p className="text-sm font-medium md:leading-relaxed text-muted-foreground md:font-semibold md:text-lg">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
