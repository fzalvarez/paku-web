const FEATURES = [
  {
    id: "history",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7 text-white" aria-hidden="true">
        <path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-2.05-4.95L15 9h5V4l-1.81 1.81A8.96 8.96 0 0 0 13 3Zm-1 5v5l4 2.4-.74 1.24-4.76-2.84V8H12Z" />
      </svg>
    ),
    title: "Historial completo",
    description:
      "Accede a todos los servicios y evolución de tu mascota en un solo lugar.",
  },
  {
    id: "ai",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7 text-white" aria-hidden="true">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Zm-7 12-1-2-2-1 2-1 1-2 1 2 2 1-2 1-1 2Zm3.5-6-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2Z" />
      </svg>
    ),
    title: "Recomendaciones IA",
    description:
      "Basadas en su tipo de pelo, piel y comportamiento para un bienestar óptimo.",
  },
  {
    id: "security",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7 text-white" aria-hidden="true">
        <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 4 5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5Z" />
      </svg>
    ),
    title: "Seguimiento seguro",
    description:
      "Información clara y transparente durante todo el proceso de grooming.",
  },
] as const;

export function FeaturesBentoSection() {
  return (
    <section aria-labelledby="features-heading" className="py-16 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-14">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-black text-primary">
            Cuidado inteligente para tu mascota
          </h2>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feat) => (
            <div
              key={feat.id}
              className="bg-card rounded-[2rem] p-8 flex flex-col gap-6 border-b-4 border-primary shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-lg transition-shadow"
            >
              {/* Ícono */}
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shrink-0">
                {feat.icon}
              </div>

              {/* Texto */}
              <div>
                <h3 className="mb-2 text-xl font-extrabold text-primary md:text-2xl">
                  {feat.title}
                </h3>
                <p className="text-base font-medium leading-relaxed text-muted-foreground md:font-semibold md:text-lg">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
