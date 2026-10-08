import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDay, type BathInfo } from "@/lib/pet-insights";
import { PanelCard } from "./PanelCard";

const BASIS_INTRO = {
  pet: "Por su tipo de pelo",
  breed: "Por el manto de su raza",
  default: "En general",
} as const;

const BASIS_TEXT = {
  pet: "por su tipo de pelo",
  breed: "por el manto de su raza",
  default: "en general",
} as const;

export function BathCard({ petName, bath, bookingHref }: { petName: string; bath: BathInfo; bookingHref: string }) {
  const weeks = Math.round(bath.interval.days / 7);
  return (
    <PanelCard icon={Sparkles} title="Su próximo baño">
      {bath.nextDay && bath.lastDay && bath.daysLeft != null ? (
        <div className="flex flex-col gap-3">
          <p className="text-3xl font-black tracking-tight text-foreground">
            {bath.daysLeft > 0
              ? `En ${bath.daysLeft} ${bath.daysLeft === 1 ? "día" : "días"}`
              : bath.daysLeft === 0
                ? "¡Hoy le toca!"
                : "¡Ya le toca su baño!"}
          </p>
          <p className="text-sm text-muted-foreground">
            Estimado para el {formatDay(bath.nextDay)}: su último baño fue el {formatDay(bath.lastDay)}
            {bath.source === "paku" ? " con Paku" : ""} y, {BASIS_TEXT[bath.interval.basis]}, conviene cada ~{weeks} semanas.
          </p>
          <Button asChild className="w-fit rounded-full font-bold">
            <Link href={bookingHref}>Reservar su baño</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Aún no tenemos registrado un baño de {petName}. {BASIS_INTRO[bath.interval.basis]}, le conviene cada ~{weeks}{" "}
            semanas; después de su primer servicio con Paku te diremos cuándo le toca el siguiente.
          </p>
          <Button asChild className="w-fit rounded-full font-bold">
            <Link href={bookingHref}>Reservar su primer baño</Link>
          </Button>
        </div>
      )}
    </PanelCard>
  );
}
