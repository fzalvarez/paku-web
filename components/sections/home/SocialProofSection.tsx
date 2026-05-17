const BULLETS = [
  {
    id: "realtime",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-white" aria-hidden="true">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5ZM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5Zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3Z" />
      </svg>
    ),
    text: "Seguimiento en tiempo real.",
  },
  {
    id: "mobile",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-white" aria-hidden="true">
        <path d="M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99ZM17 19H7V5h10v14Z" />
      </svg>
    ),
    text: "Experiencia optimizada para mobile.",
  },
] as const;

export function SocialProofSection() {
  return (
    <section aria-labelledby="socialproof-heading" className="py-16 md:py-24 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-[2.5rem] p-6 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] flex flex-col gap-10">
          {/* Título */}
          <h2 id="socialproof-heading" className="max-w-2xl text-3xl font-black text-primary md:text-4xl">
            No es solo grooming, es control y confianza
          </h2>

          {/* Imagen + stats */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-12 items-center">
            {/* Imagen */}
            <div className="w-full md:w-1/2 relative rounded-3xl overflow-hidden group shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/pakuspa.png"
                alt="PAKU Spa — Grooming inteligente"
                className="w-full h-80 sm:h-90 md:h-105 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-8 left-8 text-white drop-shadow-lg">
                <p className="text-3xl font-extrabold leading-tight">PAKU Spa</p>
                <p className="text-lg opacity-90">Grooming inteligente.</p>
              </div>
            </div>

            {/* Stats y bullets */}
            <div className="w-full md:w-1/2 flex flex-col gap-8">
              {/* Stat principal */}
              <div className="flex items-center gap-4">
                <span className="text-5xl font-extrabold leading-none text-primary md:text-6xl">
                  +95%
                </span>
                <p className="text-base font-medium leading-snug text-muted-foreground md:font-semibold md:text-lg">
                  de satisfacción
                  <br />
                  en servicio.
                </p>
              </div>

              {/* Bullets */}
              <div className="flex flex-col gap-5">
                {BULLETS.map((b) => (
                  <div key={b.id} className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shrink-0">
                      {b.icon}
                    </div>
                    <p className="text-lg font-extrabold leading-snug text-foreground md:text-xl">
                      {b.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
