const BULLETS = [
  {
    id: "realtime",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-white">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5ZM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5Zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3Z" />
      </svg>
    ),
    text: "Seguimiento en tiempo real.",
  },
  {
    id: "mobile",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-white">
        <path d="M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99ZM17 19H7V5h10v14Z" />
      </svg>
    ),
    text: "Experiencia optimizada para mobile.",
  },
] as const;

export function SocialProofSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 max-w-2xl">
          No es solo grooming, es control y confianza
        </h2>

        <div className="bg-card rounded-[2.5rem] p-6 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-10 md:gap-16 items-center">
          {/* Imagen */}
          <div className="w-full md:w-3/5 relative rounded-3xl overflow-hidden group flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbhZJMzi-Z_0jzywklGk6_jXR47NHq1q-5HjqavFKXxEVGMntAwYRCwZ3nNY-NhtLLeedvrM5Oiz4srvocK4cvZbXcbJPsCp2BEXRRRd0j3rZ1vXnkq3y6dQeLgL3tFTba9EGF6-Ktkn3COAkkQEGDdBntW19XYseB6u6HTCCBBqNYuk_dmUmwRrNwOveaDLhjocu11f3VbMzeuV5ncL-ftHIRAz_WcdUNextoyfI3tSkFL1O8qUXGU71uQroXi4L0VT485eYwaNiN"
              alt="PAKU Spa — Grooming inteligente"
              className="w-full h-[380px] md:h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-8 left-8 text-white drop-shadow-lg">
              <p className="text-3xl font-extrabold leading-tight">PAKU Spa</p>
              <p className="text-lg opacity-90">Grooming inteligente.</p>
            </div>
          </div>

          {/* Stats y bullets */}
          <div className="w-full md:w-2/5 flex flex-col gap-8">
            {/* Stat principal */}
            <div className="flex items-center gap-4">
              <span className="text-5xl md:text-6xl font-extrabold text-primary leading-none">
                +95%
              </span>
              <p className="text-base font-semibold text-muted-foreground leading-snug">
                de satisfacción
                <br />
                en servicio.
              </p>
            </div>

            {/* Bullets */}
            <div className="flex flex-col gap-5">
              {BULLETS.map((b) => (
                <div key={b.id} className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    {b.icon}
                  </div>
                  <p className="text-lg font-bold text-primary leading-snug">
                    {b.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
