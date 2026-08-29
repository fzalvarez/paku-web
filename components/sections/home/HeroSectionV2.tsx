import Image from "next/image";
import Link from "next/link";

const APP_STORE_BUTTONS = [
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

export function HeroSectionV2() {
  return (
    <section aria-label="Inicio — El futuro del grooming es móvil" className="relative min-h-125 sm:min-h-150 md:min-h-200 flex items-center overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/home-perro-paku.png"
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          className="w-full h-full object-cover object-[30%_center] md:object-center"
        />
        {/* Overlay: degradado vertical solo en la mitad inferior */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 via-black/25 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full md:w-3/5 flex flex-col gap-4 sm:gap-6 text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-8xl font-extrabold leading-tight xl:leading-[1.05] tracking-tight drop-shadow-lg">
            El futuro del grooming es{" "}
            <span className="italic">móvil</span>
          </h1>
          <p className="text-lg md:text-xl max-w-lg leading-relaxed drop-shadow-md text-white/90">
            Sigue en tiempo real el cuidado de tu mascota, con total seguridad
            y tranquilidad.
          </p>

          {/* Botones de descarga */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 sm:mt-2">
            {APP_STORE_BUTTONS.map((btn) => (
              <Link key={btn.id} href={btn.href} className="hover:opacity-90 hover:scale-105 transition-all">
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
      </div>
    </section>
  );
}
