"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/common/AuthDialog";
import { useState } from "react";

const HERO_IMAGES = [
  {
    id: 1,
    src: "/assets/home-1.png",
    alt: "Imagen home 1 - Paku",
    // Contenedores más altos para imágenes verticales y responsivas
    containerClass: "col-span-12 md:col-span-4 h-[420px] md:h-[420px] -rotate-3 hover:rotate-0",
  },
  {
    id: 2,
    src: "/assets/home-2.png",
    alt: "Imagen home 2 - Paku",
    containerClass: "col-span-12 md:col-span-4 h-[420px] md:h-[420px] z-10 shadow-2xl",
  },
  {
    id: 3,
    src: "/assets/home-3.png",
    alt: "Imagen home 3 - Paku",
    containerClass: "col-span-12 md:col-span-4 h-[420px] md:h-[420px] rotate-6 hover:rotate-0",
  },
] as const;

export function HeroSection() {
  const { isAuthenticated, user } = useAuthContext();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-4 pb-32 pt-20 sm:px-6 lg:px-8">
      {/* ── Texto central ── */}
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Badge */}
        <span className="hidden mb-6 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          Próxima Generación
        </span>

        {/* Título */}
        <h1 className="mb-8 text-5xl font-extrabold leading-[1.1] tracking-tighter text-foreground md:text-7xl">
          Paku: El futuro del grooming es{" "}
          <span className="italic text-primary">móvil</span>.
        </h1>

        {/* Descripción */}
        <p className="mb-12 max-w-2xl text-xl leading-relaxed text-muted-foreground">
          Sin salas de espera. Sin estrés. Agenda en segundos y deja que los
          mejores expertos cuiden de tu mascota en la puerta de tu hogar.
        </p>

        {/* CTA — cambia según el estado de sesión */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {isAuthenticated ? (
            <Button
              size="lg"
              className="rounded-full px-10 py-6 text-lg font-extrabold shadow-xl"
              asChild
            >
              <a href="/dashboard">
                Ir a mi panel, {user?.first_name ?? ""}
              </a>
            </Button>
          ) : (
            <Button
              size="lg"
              className="rounded-full px-10 py-6 text-lg font-extrabold shadow-xl"
              onClick={() => setAuthOpen(true)}
            >
              Registrarse
            </Button>
          )}
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ShieldCheck className="size-5 text-primary" />
            <span>Satisfacción garantizada</span>
          </div>
        </div>
      </div>

      {/* ── Grid de imágenes asimétricas ── */}
      <div className="mt-20 grid grid-cols-12 items-end gap-6">
        {HERO_IMAGES.map((img) => (
          <div
            key={img.id}
            className={cn(
              // Añadir fondo uniforme al contenedor para que las imágenes verticales no muestren espacios distintos
              "relative overflow-hidden rounded-xl shadow-xl transition-transform duration-500 bg-muted",
              img.containerClass
            )}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              // Usar object-contain para mostrar la imagen completa (vertical) sin recortes
              className="object-contain object-center bg-muted"
              /* sizes="(max-width: 768px) 100vw, 33vw" */
              priority={img.id === 2}
            />
          </div>
        ))}
      </div>

      {/* Dialog de auth */}
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab="register"
      />
    </section>
  );
}
