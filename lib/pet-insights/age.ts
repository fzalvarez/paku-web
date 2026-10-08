/** Tamaño, edad, etapa de vida y edad humana. */
import type { Pet, PetSize } from "@/types/pets";
import { breedReference } from "./breeds";
import { limaDay } from "./dates";
import {
  CAT_HUMAN_YEARS_PER_YEAR,
  CAT_SENIOR_FROM_YEARS,
  HUMAN_AGE,
  HUMAN_YEARS_PER_YEAR,
  PUPPY_UNTIL_YEARS,
  SENIOR_FROM_YEARS,
  SIZE_BY_WEIGHT_KG,
} from "./rules";

/** Tamaño: el que indicó el dueño; si no, el de su raza; si no, estimado por peso. */
export function effectiveSize(pet: Pet): PetSize | null {
  if (pet.size) return pet.size;
  const breed = breedReference(pet.breed_id);
  if (breed) return breed.size;
  if (pet.weight_kg == null) return null;
  if (pet.weight_kg < SIZE_BY_WEIGHT_KG.smallBelow) return "small";
  if (pet.weight_kg <= SIZE_BY_WEIGHT_KG.mediumUpTo) return "medium";
  return "large";
}

export interface Age {
  years: number;
  months: number;
  /** Edad en años con decimales, para los cálculos. */
  exact: number;
}

export function petAge(pet: Pet, today: string): Age | null {
  if (!pet.birth_date) return null;
  const [by, bm, bd] = limaDay(pet.birth_date).split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  if (months < 0) return null;
  return { years: Math.floor(months / 12), months: months % 12, exact: months / 12 };
}

export function ageLabel(age: Age): string {
  const y = age.years ? `${age.years} ${age.years === 1 ? "año" : "años"}` : "";
  const m = age.months ? `${age.months} ${age.months === 1 ? "mes" : "meses"}` : "";
  return [y, m].filter(Boolean).join(" y ") || "Menos de 1 mes";
}

export type LifeStage = "puppy" | "adult" | "senior";

export function lifeStage(pet: Pet, age: Age): LifeStage {
  if (age.exact < PUPPY_UNTIL_YEARS) return "puppy";
  const seniorFrom = pet.species === "cat" ? CAT_SENIOR_FROM_YEARS : SENIOR_FROM_YEARS[effectiveSize(pet) ?? "medium"];
  return age.exact >= seniorFrom ? "senior" : "adult";
}

export function lifeStageLabel(pet: Pet, stage: LifeStage): string {
  if (stage === "puppy") return pet.species === "cat" ? "Gatito" : "Cachorro";
  return stage === "senior" ? "Senior" : "Adulto";
}

/** Edad humana aproximada. */
export function humanAge(pet: Pet, age: Age): number {
  const t = age.exact;
  if (t <= 1) return Math.round(HUMAN_AGE.firstYear * t);
  if (t <= 2) return Math.round(HUMAN_AGE.firstYear + (HUMAN_AGE.secondYear - HUMAN_AGE.firstYear) * (t - 1));
  const perYear = pet.species === "cat" ? CAT_HUMAN_YEARS_PER_YEAR : HUMAN_YEARS_PER_YEAR[effectiveSize(pet) ?? "medium"];
  return Math.round(HUMAN_AGE.secondYear + perYear * (t - 2));
}
