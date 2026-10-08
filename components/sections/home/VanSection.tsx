import Image from "next/image";
import { VAN_FEATURES } from "@/lib/data/home";

/** "¿Cómo es por dentro la furgoneta de Paku?" con fotos de la van. */
export function VanSection() {
  return (
    <section id="la-van" aria-labelledby="van-heading" className="scroll-mt-20 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 rounded-[2.5rem] border border-border/60 bg-card p-6 shadow-sm sm:p-10 lg:flex-row lg:gap-14 lg:p-12">
          {/* Texto */}
          <div className="flex max-w-xl flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
              🚐 Un spa sobre ruedas
            </span>
            <h2 id="van-heading" className="text-3xl font-black tracking-tight text-primary md:text-4xl">
              ¿Cómo es por dentro la furgoneta de Paku?
            </h2>
            <p className="text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
              Es un salón de grooming completo, pero en una van: tu mascota se baña, se seca y se pone
              guapa a pocos pasos de tu casa, sin trasladarse ni compartir espacio con otros perros.
            </p>

            <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {VAN_FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3 rounded-2xl bg-primary/5 p-3.5">
                  <span aria-hidden="true" className="text-2xl leading-none">{f.emoji}</span>
                  <div>
                    <p className="text-sm font-extrabold text-foreground">{f.title}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{f.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Fotos */}
          <div className="relative w-full max-w-md lg:max-w-none lg:flex-1">
            <div className="relative aspect-[790/860] w-4/5 overflow-hidden rounded-3xl border-4 border-white shadow-lg rotate-[-2deg]">
              <Image
                src="/assets/home-2.png"
                alt="Groomer de Paku bañando a un bulldog en la tina de acero de la van"
                fill
                sizes="(max-width: 1024px) 80vw, 35vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-4 right-0 aspect-[790/860] w-1/2 overflow-hidden rounded-3xl border-4 border-white shadow-lg rotate-3">
              <Image
                src="/assets/home-3.png"
                alt="Groomer de Paku secando a un husky sobre la mesa elevable de la van"
                fill
                sizes="(max-width: 1024px) 50vw, 22vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
