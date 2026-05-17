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
    <section className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="max-w-4xl mx-auto text-4xl md:text-5xl font-black text-primary text-center mb-14 md:mb-16 leading-[1.05] tracking-tight">
          Una nueva forma de cuidar a tu mascota empieza hoy
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-8 lg:gap-12">
          {/* Lista de pasos + botones */}
          <div className="w-full md:w-[45%] flex flex-col gap-6 md:gap-8 md:pl-12 lg:pl-16">
            <ul className="flex flex-col gap-4 md:gap-5">
              {STEPS.map((step) => (
                <li key={step.num} className="flex gap-4 items-start">
                  <span className="text-xl font-extrabold text-primary leading-snug min-w-10">
                    {step.num}.
                  </span>
                  <span className="text-lg font-extrabold leading-tight tracking-tight text-foreground md:text-base lg:text-lg xl:text-2xl">
                    {step.label}
                  </span>
                </li>
              ))}
            </ul>

            {/* Botones de descarga */}
            <div className="flex flex-col items-start gap-3 mt-3">
              {STORE_BUTTONS.map((btn) => (
                <Link key={btn.id} href={btn.href} className="hover:opacity-90 transition-opacity">
                  <Image
                    src={btn.src}
                    alt={btn.alt}
                    width={180}
                    height={53}
                    className="h-16 w-auto object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Imagen perro */}
          <div className="w-full md:w-[55%] flex justify-center">
            <Image
              src="/assets/perro-dlmt.png"
              alt="Mascota Paku"
              width={520}
              height={520}
              className="w-full max-w-90 md:max-w-115 h-auto object-contain"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
