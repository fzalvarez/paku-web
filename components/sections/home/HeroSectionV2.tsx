import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

const TRUST_CHIPS = ["🛁 Una mascota a la vez", "🔌 Agua y luz propias", "📍 Síguelo en vivo"] as const;

export function HeroSectionV2() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-130 items-center overflow-hidden sm:min-h-150 md:min-h-180"
    >
      {/* Imagen de fondo (fondo celeste claro: el texto va oscuro) */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/home-perro-paku.png"
          alt=""
          loading="eager"
          fetchPriority="high"
          className="h-full w-full object-cover object-[70%_center] md:object-center"
        />
        {/* Velo claro a la izquierda para que el texto se lea sobre el perro en mobile */}
        <div className="absolute inset-0 bg-linear-to-r from-white/75 via-white/40 to-transparent md:from-white/50 md:via-white/10" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col items-start gap-5 md:w-3/5 lg:w-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-xs">
            ✨ Spa móvil para tu mascota
          </span>

          <h1
            id="hero-heading"
            className="text-4xl font-black leading-[1.05] tracking-tight text-[#171954] sm:text-5xl md:text-6xl"
          >
            El spa de tu peludo, <span className="text-primary">directo a tu puerta</span>
          </h1>

          <p className="max-w-lg text-lg font-medium leading-relaxed text-[#171954]/80 md:text-xl">
            Lo bañamos y engreímos en nuestra van, frente a tu casa. Y tú lo sigues en vivo desde
            el celular.
          </p>

          <div className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="h-12 gap-2 rounded-full px-7 text-base font-bold shadow-md">
              <Link href={ROUTES.BOOKING}>
                <span aria-hidden="true" className="inline-block origin-bottom motion-safe:animate-wag">🐶</span>
                Agenda su baño
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 gap-2 rounded-full border-primary/20 bg-white/80 px-6 text-base font-bold text-primary hover:bg-white"
            >
              <Link href="/#como-funciona">
                ¿Cómo funciona?
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <ul className="mt-1 flex flex-wrap gap-2">
            {TRUST_CHIPS.map((chip) => (
              <li
                key={chip}
                className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[#171954] shadow-xs sm:text-sm"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
