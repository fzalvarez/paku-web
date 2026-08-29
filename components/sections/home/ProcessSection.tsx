import Image from "next/image";
import Link from "next/link";

const STEPS = [
  {
    num: "01",
    label: "Registra tu mascota.",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 10.5c1.4 0 2.5-1.6 2.5-3.5S10.4 3.5 9 3.5 6.5 5.1 6.5 7s1.1 3.5 2.5 3.5Z" />
        <path d="M4 14.8c0-2.7 2.3-4.3 5-4.3s5 1.6 5 4.3c0 1.2-1 1.9-2.2 1.9-.7 0-1.2-.2-1.9-.2H8.1c-.7 0-1.2.2-1.9.2C5 16.7 4 16 4 14.8Z" />
        <path d="M17.5 8v6" />
        <path d="M14.5 11h6" />
      </svg>
    ),
  },
  {
    num: "02",
    label: "Agenda el servicio.",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="5" width="16" height="15" rx="2.5" />
        <path d="M4 9.5h16" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <circle cx="9" cy="14" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    num: "03",
    label: "Sigue el proceso en tiempo real.",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-6.5-4.4-6.5-10a6.5 6.5 0 0 1 13 0c0 5.6-6.5 10-6.5 10Z" />
        <circle cx="12" cy="11" r="2.3" />
      </svg>
    ),
  },
  {
    num: "04",
    label: "Recibe resultados.",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
        <path d="M4 8.5V16l8 4.5 8-4.5V8.5" />
        <path d="M12 13v7.5" />
      </svg>
    ),
  },
] as const;

const STORE_BUTTONS = [
  {
    id: "google-play",
    href: "#",
    src: "/assets/android-play-store.png",
    alt: "Disponible en Google Play",
  },
  {
    id: "app-store",
    href: "#",
    src: "/assets/apple-app-store.png",
    alt: "Consíguelo en el App Store",
  },
] as const;

export function ProcessSection() {
  return (
    <section aria-labelledby="process-heading" className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="process-heading" className="max-w-4xl mx-auto text-2xl md:text-4xl font-black text-primary text-center mb-14 md:mb-16 leading-[1.05] tracking-tight">
          Una nueva forma de cuidar a tu mascota empieza hoy
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-8 lg:gap-12">
          {/* Timeline de pasos + botones */}
          <div className="w-full md:w-[45%] flex flex-col items-center md:items-start gap-8 md:pl-12 lg:pl-16">
            <ul className="flex flex-col w-full max-w-xs md:max-w-none">
              {STEPS.map((step, idx) => (
                <li key={step.num} className="flex gap-3.5 items-stretch">
                  {/* Columna del número + conector */}
                  <div className="flex flex-col items-center w-8.5 shrink-0">
                    <span className="flex size-8.5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
                      {step.num}
                    </span>
                    {idx < STEPS.length - 1 && (
                      <span className="w-0.5 flex-1 my-1 bg-primary/15" />
                    )}
                  </div>

                  {/* Ícono + label */}
                  <div className={`flex items-center gap-2.5 ${idx < STEPS.length - 1 ? "pb-5" : ""}`}>
                    <span className="flex size-7.5 shrink-0 items-center justify-center rounded-[10px] bg-primary/8 text-primary">
                      {step.icon}
                    </span>
                    <span className="text-base font-extrabold leading-tight tracking-tight text-foreground lg:text-lg xl:text-xl">
                      {step.label}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Botones de descarga, en fila (centrados en mobile heredando el items-center del padre) */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              {STORE_BUTTONS.map((btn) => (
                <Link key={btn.id} href={btn.href} className="hover:opacity-90 transition-opacity">
                  <Image
                    src={btn.src}
                    alt={btn.alt}
                    width={180}
                    height={53}
                    className="h-11 sm:h-14 md:h-16 w-auto object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Imagen perro con fondo blob */}
          <div className="relative w-full md:w-[55%] flex justify-center">
            <div
              aria-hidden="true"
              className="absolute size-70 md:size-90 rounded-[46%_54%_58%_42%/48%_42%_58%_52%] bg-linear-to-br from-primary/12 to-tertiary/14"
            />
            <Image
              src="/assets/perro-dlmt.png"
              alt="Perro feliz listo para su servicio de grooming móvil con Paku"
              width={520}
              height={520}
              className="relative w-full max-w-90 md:max-w-115 h-auto object-contain"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
