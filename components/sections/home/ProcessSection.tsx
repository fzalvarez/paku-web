import Image from "next/image";
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
    <section className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="max-w-4xl mx-auto text-4xl md:text-5xl font-extrabold text-primary text-center mb-14 md:mb-16 leading-[1.05] tracking-tight">
          Una nueva forma de cuidar a tu mascota empieza hoy
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-6">
          {/* Lista de pasos + botones */}
          <div className="w-full md:w-[45%] flex flex-col gap-8 md:pl-12 lg:pl-16">
            <ul className="flex flex-col gap-4 md:gap-3">
              {STEPS.map((step) => (
                <li key={step.num} className="flex gap-4 items-start">
                  <span className="text-xl font-extrabold text-primary leading-snug min-w-[2.5rem]">
                    {step.num}.
                  </span>
                  <span className="text-[2rem] md:text-[2.15rem] font-extrabold text-[#1f2165] leading-none tracking-tight">
                    {step.label}
                  </span>
                </li>
              ))}
            </ul>

            {/* Botones de descarga */}
            <div className="flex flex-col items-start gap-4 mt-3">
              {STORE_BUTTONS.map((btn) => (
                <Link
                  key={btn.id}
                  href="#"
                  className="bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-3 hover:opacity-90 transition-opacity min-w-[198px]"
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

          {/* Imagen perro + óvalo */}
          <div className="w-full md:w-[55%] flex justify-center relative min-h-[360px] md:min-h-[420px]">
            <div className="absolute w-[280px] h-[190px] md:w-[360px] md:h-[230px] bg-[#0f928f] rounded-[50%] bottom-8 md:bottom-6 right-4 md:right-8" />

            <div className="relative w-[280px] h-[330px] md:w-[360px] md:h-[420px] z-10 translate-x-2 md:translate-x-0">
              <Image
                src="/assets/pakuspa.png"
                alt="Mascota Paku"
                fill
                className="object-contain object-center"
                sizes="(max-width: 768px) 280px, 360px"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
