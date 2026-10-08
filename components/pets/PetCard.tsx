"use client";

import Image from "next/image";
import Link from "next/link";
import { FileText, Mars, Pencil, Trash2, Venus, Weight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { safePhotoUrl } from "@/lib/utils/pets";
import { todayLima } from "@/lib/utils/dates";
import { ageLabel, lifeStage, lifeStageLabel, petAge } from "@/lib/pet-insights";
import type { Pet } from "@/types/pets";

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (pet: Pet) => void;
  onWeight: (pet: Pet) => void;
  mutating: boolean;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-muted/60 px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-bold text-foreground" title={value}>{value}</dd>
    </div>
  );
}

/** Tarjeta de una mascota en "Mis mascotas". */
export function PetCard({ pet, onEdit, onDelete, onWeight, mutating }: PetCardProps) {
  const isCat = pet.species === "cat";
  const photoUrl = safePhotoUrl(pet.photo_url);
  const age = petAge(pet, todayLima());
  const stage = age ? lifeStage(pet, age) : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Franja de color + foto superpuesta */}
      <div
        aria-hidden="true"
        className={cn(
          "h-16 bg-linear-to-r",
          isCat ? "from-secondary/25 via-secondary/10 to-tertiary/10" : "from-primary/20 via-primary/10 to-secondary/10",
        )}
      />
      <div className="-mt-10 flex flex-1 flex-col gap-4 px-5 pb-5">
        <div className="flex items-end gap-3">
          <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-card text-4xl shadow-md ring-4 ring-card">
            {photoUrl ? (
              <Image src={photoUrl} alt={`Foto de ${pet.name}`} fill sizes="80px" className="object-cover" />
            ) : (
              <span aria-hidden="true">{isCat ? "🐱" : "🐶"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-lg font-extrabold tracking-tight text-foreground">{pet.name}</h3>
              {pet.sex === "male" && <Mars className="size-4 shrink-0 text-blue-500" aria-label="Macho" />}
              {pet.sex === "female" && <Venus className="size-4 shrink-0 text-pink-500" aria-label="Hembra" />}
            </div>
            {pet.breed_name && <p className="truncate text-sm text-muted-foreground">{pet.breed_name}</p>}
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge variant={isCat ? "secondary" : "default"}>{isCat ? "Gato" : "Perro"}</Badge>
              {stage && <Badge variant="muted">{lifeStageLabel(pet, stage)}</Badge>}
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2">
          <Stat label="Edad" value={age ? ageLabel(age) : "Sin fecha"} />
          <Stat label="Peso" value={pet.weight_kg != null ? `${pet.weight_kg.toLocaleString("es-PE")} kg` : "Sin registrar"} />
        </dl>

        {(pet.sterilized || pet.vaccines_up_to_date) && (
          <div className="flex flex-wrap gap-1.5">
            {pet.sterilized && <Badge variant="success">Esterilizado</Badge>}
            {pet.vaccines_up_to_date && <Badge variant="info">Vacunas al día</Badge>}
          </div>
        )}

        {pet.notes && <p className="line-clamp-2 text-xs text-muted-foreground">{pet.notes}</p>}

        {/* Acciones: principal a la izquierda, rápidas como íconos a la derecha */}
        <div className="mt-auto flex items-center gap-2 border-t border-border/60 pt-4">
          <Button asChild size="sm" className="gap-1.5 rounded-full font-bold">
            <Link href={`/account/pets/${pet.id}/panel`}>📊 Ver panel</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1.5 rounded-full">
            <Link href={`/account/pets/${pet.id}`}>
              <FileText className="size-3.5" />
              Ficha
            </Link>
          </Button>
          <div className="ml-auto flex items-center gap-0.5">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onWeight(pet)}
              disabled={mutating}
              aria-label={`Registrar peso de ${pet.name}`}
              title="Registrar peso"
            >
              <Weight />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onEdit(pet)}
              disabled={mutating}
              aria-label={`Editar a ${pet.name}`}
              title="Editar"
            >
              <Pencil />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onDelete(pet)}
              disabled={mutating}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Eliminar a ${pet.name}`}
              title="Eliminar"
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
