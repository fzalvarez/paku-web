import Link from "next/link";

const APP_STORE_BUTTONS = [
  {
    id: "google-play",
    label: "Disponible en",
    name: "Google Play",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7">
        <path d="M3.18 23.76c.3.17.64.24.98.2l.1-.04L13.84 12 4.26.08l-.1-.03a1.54 1.54 0 0 0-.98.2C2.86.63 2.5 1.28 2.5 2.08v19.84c0 .8.36 1.45.68 1.84Z" />
        <path d="m15.27 10.57-2.8-2.8L5.3.52l9.35 5.4 2.54 1.47-1.92 3.18ZM5.3 23.48l7.17-7.17 2.8-2.8 1.92 3.18-2.54 1.47L5.3 23.48ZM20.1 10.3l-1.93-1.12-2.07 3.43 2.07 3.43 1.93-1.12c.83-.48 1.4-1.35 1.4-2.31s-.57-1.83-1.4-2.31Z" />
      </svg>
    ),
  },
  {
    id: "app-store",
    label: "Consíguelo en el",
    name: "App Store",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.16 1.26-2.14 3.76.03 2.98 2.62 3.97 2.65 3.98l-.06.18c-.24.75-.57 1.47-.99 2.13ZM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
      </svg>
    ),
  },
] as const;

export function HeroSectionV2() {
  return (
    <section className="relative min-h-[600px] md:min-h-[800px] flex items-center overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZoCUp2zrGDoMmFP7X8RSYR-ticd6DmWS4gYLtDuwi7lfod2x5eUTWPoldiiYC4lnd_XNLLJnDF0daFv75zLLTPOwUPIxCP1Qw1JSpKSFGNxMHIc_YWjDWhAk-U6RBvHPMZ68OpVVr4kDm5zNEcOwyrQXCd0bH7ZLSoCrxD8Ktk92oF8cGAFcVFI1tDW2Rm4cYPZJzhj5KD6R3SOzOl5JTZC_HQef8nEAGbwrH_hAl4b7q7qf0ME9T42zR2ueXZCGv92aZGJBTxKh0"
          alt="Paku hero background"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay mobile: oscuro uniforme / desktop: degradado lateral */}
        <div className="absolute inset-0 bg-black/40 md:bg-gradient-to-r md:from-black/65 md:via-black/30 md:to-transparent" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full md:w-3/5 flex flex-col gap-6 text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
            El futuro del grooming es{" "}
            <span className="italic">móvil</span>
          </h1>
          <p className="text-lg md:text-xl max-w-lg leading-relaxed drop-shadow-md text-white/90">
            Sigue en tiempo real el cuidado de tu mascota, con total seguridad
            y tranquilidad.
          </p>

          {/* Botones de descarga */}
          <div className="flex flex-wrap gap-4 mt-2">
            {APP_STORE_BUTTONS.map((btn) => (
              <Link
                key={btn.id}
                href="#"
                className="bg-black/80 backdrop-blur-sm text-white px-5 py-3 rounded-xl flex items-center gap-3 hover:bg-black hover:scale-105 transition-all border border-white/20"
              >
                {btn.icon}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider leading-none">
                    {btn.label}
                  </span>
                  <span className="text-base font-bold leading-snug">
                    {btn.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
