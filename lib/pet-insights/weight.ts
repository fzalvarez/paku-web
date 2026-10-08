/** Peso: serie histórica y comparación con el rango habitual de su raza. */
import type { PetRecordOut } from "@/types/pet-records";
import type { Pet } from "@/types/pets";
import type { LifeStage } from "./age";
import { breedReference } from "./breeds";
import { limaDay } from "./dates";

export interface WeightPoint {
  day: string;
  kg: number;
}

export function weightSeries(records: PetRecordOut[]): WeightPoint[] {
  return records
    .filter((r) => r.type === "weight_record" && !r.deleted_at && typeof r.data?.weight_kg === "number")
    .map((r) => ({ day: limaDay(r.occurred_at), kg: r.data.weight_kg as number }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export interface WeightAssessment {
  kg: number;
  range: [number, number];
  position: "below" | "within" | "above";
  note?: string;
}

/**
 * Compara el peso actual con el rango habitual de su raza. No aplica a
 * cachorros (siguen creciendo), mestizos ni razas sin datos.
 */
export function weightAssessment(pet: Pet, currentKg: number | null, stage: LifeStage | null): WeightAssessment | null {
  const breed = breedReference(pet.breed_id);
  if (!breed || currentKg == null || stage === "puppy") return null;
  const [min, max] = breed.weightKg;
  const position = currentKg < min ? "below" : currentKg > max ? "above" : "within";
  return { kg: currentKg, range: breed.weightKg, position, note: breed.note };
}
