import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { safePhotoUrl } from "@/lib/utils/pets";
import { ageLabel, lifeStageLabel, type Age, type BreedReference, type LifeStage } from "@/lib/pet-insights";
import type { Pet } from "@/types/pets";

export function PanelHeader({
  pet,
  age,
  stage,
  human,
  breed,
  bookingHref,
  fichaHref,
}: {
  pet: Pet;
  age: Age | null;
  stage: LifeStage | null;
  human: number | null;
  breed: BreedReference | null;
  bookingHref: string;
  fichaHref: string;
}) {
  const photoUrl = safePhotoUrl(pet.photo_url);
  const isCat = pet.species === "cat";

  return (
    <header className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-primary/10 text-5xl shadow-md ring-4 ring-white">
          {photoUrl ? (
            <Image src={photoUrl} alt={`Foto de ${pet.name}`} fill sizes="96px" className="object-cover" />
          ) : (
            <span aria-hidden="true">{isCat ? "🐱" : "🐶"}</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-primary md:text-4xl">{pet.name}</h1>
            {stage && <Badge>{lifeStageLabel(pet, stage)}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground md:text-base">
            {[isCat ? "Gato" : "Perro", pet.breed_name].filter(Boolean).join(" · ")}
          </p>
          {age ? (
            <p className="text-base font-semibold text-foreground">
              {ageLabel(age)}
              {human != null && <span className="font-normal text-muted-foreground"> · ≈ {human} años humanos</span>}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Agrega su fecha de nacimiento para conocer su etapa y edad humana.
            </p>
          )}
          {breed && (
            <p className="text-sm text-muted-foreground">
              🕰️ Su raza vive en promedio entre {breed.lifespanYears[0]} y {breed.lifespanYears[1]} años.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
          <Button asChild className="gap-2 rounded-full font-bold">
            <Link href={bookingHref}>🐶 Reservar su baño</Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 rounded-full">
            <Link href={fichaHref}>
              <Pencil className="size-3.5" />
              Ver ficha
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
