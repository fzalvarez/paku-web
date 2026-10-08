import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT, ROUTES } from "@/constants";

const PROMISES = ["🛁 Una mascota a la vez", "🔌 Agua y luz propias", "📍 Síguelo en vivo"] as const;

/** Cierre de página: "¡Dale a tu peludo el spa que se merece!". Se usa en home y páginas internas. */
export function FinalCtaSection() {
  return (
    <section aria-labelledby="final-cta-heading" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-[2.5rem] bg-primary p-8 text-primary-foreground shadow-lg sm:p-12 lg:flex-row lg:p-14">
          <div aria-hidden="true" className="absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-1 flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            <span className="rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              📍 Atención a domicilio en Lima
            </span>
            <h2 id="final-cta-heading" className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              ¡Dale a tu peludo el spa que se merece! 💙
            </h2>
            <p className="max-w-xl text-base text-white/80 sm:text-lg">
              Sin jaulas, sin estrés y en la puerta de tu casa. Reserva en minutos y nosotros nos
              encargamos del resto.
            </p>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 gap-2 rounded-full bg-white px-7 text-base font-bold text-primary hover:bg-white/90"
              >
                <Link href={ROUTES.BOOKING}>
                  <span aria-hidden="true" className="inline-block origin-bottom motion-safe:animate-wag">🐶</span>
                  Agenda su baño
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 gap-2 rounded-full border-white/30 bg-white/10 px-6 text-base font-bold text-white hover:bg-white/20 hover:text-white"
              >
                <a href={CONTACT.whatsappBookingUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  Escríbenos por WhatsApp
                </a>
              </Button>
            </div>

            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs font-semibold text-white/80 sm:text-sm lg:justify-start">
              {PROMISES.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="relative aspect-[790/860] w-56 shrink-0 overflow-hidden rounded-3xl border-4 border-white/20 shadow-xl sm:w-64 lg:w-72">
            <Image
              src="/assets/home-1.png"
              alt="Groomer de Paku recogiendo a un golden retriever en la puerta de su casa"
              fill
              sizes="288px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
