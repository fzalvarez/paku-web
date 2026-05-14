import Link from "next/link";

const STEPS = [
  { num: "01", label: "Registra tu mascota." },
  { num: "02", label: "Agenda el servicio." },
  { num: "03", label: "Sigue el proceso en tiempo real." },
  { num: "04", label: "Recibe resultados." },
] as const;

const STORE_BUTTONS = [
  {
    id: "google-play",
    topLabel: "Disponible en",
    name: "Google Play",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
        <path d="M3.18 23.76c.3.17.64.24.98.2l.1-.04L13.84 12 4.26.08l-.1-.03a1.54 1.54 0 0 0-.98.2C2.86.63 2.5 1.28 2.5 2.08v19.84c0 .8.36 1.45.68 1.84Z" />
        <path d="m15.27 10.57-2.8-2.8L5.3.52l9.35 5.4 2.54 1.47-1.92 3.18ZM5.3 23.48l7.17-7.17 2.8-2.8 1.92 3.18-2.54 1.47L5.3 23.48ZM20.1 10.3l-1.93-1.12-2.07 3.43 2.07 3.43 1.93-1.12c.83-.48 1.4-1.35 1.4-2.31s-.57-1.83-1.4-2.31Z" />
      </svg>
    ),
  },
  {
    id: "app-store",
    topLabel: "Consíguelo en el",
    name: "App Store",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.16 1.26-2.14 3.76.03 2.98 2.62 3.97 2.65 3.98l-.06.18c-.24.75-.57 1.47-.99 2.13ZM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
      </svg>
    ),
  },
] as const;

export function ProcessSection() {
  return (
    <section className="py-16 md:py-28 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-16 md:mb-24">
          Una nueva forma de cuidar a tu mascota empieza hoy
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-16">
          {/* Lista de pasos + botones */}
          <div className="w-full md:w-1/2 flex flex-col gap-8">
            <ul className="flex flex-col gap-6">
              {STEPS.map((step) => (
                <li key={step.num} className="flex gap-4 items-start">
                  <span className="text-xl font-extrabold text-primary leading-snug min-w-[2.5rem]">
                    {step.num}.
                  </span>
                  <span className="text-xl font-bold text-foreground leading-snug">
                    {step.label}
                  </span>
                </li>
              ))}
            </ul>

            {/* Botones de descarga */}
            <div className="flex flex-wrap gap-4 mt-2">
              {STORE_BUTTONS.map((btn) => (
                <Link
                  key={btn.id}
                  href="#"
                  className="bg-foreground text-background px-4 py-2.5 rounded-xl flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  {btn.icon}
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold tracking-wider leading-none">
                      {btn.topLabel}
                    </span>
                    <span className="text-sm font-bold leading-snug">
                      {btn.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Imagen circular */}
          <div className="w-full md:w-1/2 flex justify-center relative">
            {/* Glow teal decorativo */}
            <div className="absolute inset-0 bg-teal-500 rounded-full scale-90 translate-x-10 translate-y-10 opacity-20 blur-3xl pointer-events-none" />

            <div className="relative w-72 h-72 md:w-80 md:h-80 bg-teal-600 rounded-full overflow-hidden border-[12px] border-background shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWSI27sXUhh2sMGkBAba-XY1-xshPRSxDAtXUzahnROPe2h-HqOd53o0hfpY-4TaQ2YQnF_p0fD3onlmgcDUg4Ng-pR6ekSpVZ8yyvsXkYiQvYyPBJMDcdTwX1NeREUVOu0ZdW19C54PWm5A27xWuE0yv6qpfhoM9xDh44aKiv_eSvRBzqekf9EtCd641mi-C9GPxdrDgH7oSsOoXBRAYQ47U9lMvOAWeYzdDceICCbKnKZYSNmJRPj51r_yvbJkNr-RFBDEXdjCxg"
                alt="Mascota Paku"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
