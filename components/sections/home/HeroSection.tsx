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
    src: "https://images.unsplash.com/photo-1611003229107-4e7f8e0e5cb0?w=800&q=80",
    alt: "Interfaz moderna de la app Paku en un smartphone",
    containerClass: "col-span-12 md:col-span-4 h-80 -rotate-3 hover:rotate-0",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=900&q=80",
    alt: "Golden retriever siendo mimado en una van de grooming móvil",
    containerClass: "col-span-12 md:col-span-5 h-[500px] z-10 shadow-2xl",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    alt: "Van de grooming profesional en una calle suburbana",
    containerClass: "col-span-12 md:col-span-3 h-96 rotate-6 hover:rotate-0",
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
              "relative overflow-hidden rounded-xl shadow-xl transition-transform duration-500",
              img.containerClass
            )}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
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
