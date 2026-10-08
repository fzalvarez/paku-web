/** Energía y actividad sugerida según la raza, comparada con lo que indicó el dueño. */
import type { Pet, PetActivityLevel } from "@/types/pets";
import { breedReference } from "./breeds";
import { DOG_ACTIVITY_MINUTES } from "./rules";

export const ENERGY_LABEL: Record<PetActivityLevel, string> = { low: "Baja", medium: "Media", high: "Alta" };

export interface ActivityInsight {
  /** Energía típica de su raza (null si no hay datos de raza). */
  breedEnergy: PetActivityLevel | null;
  /** Lo que indicó el dueño en su ficha. */
  ownerLevel: PetActivityLevel | null;
  /** Energía usada para la sugerencia: la del dueño manda sobre la de la raza. */
  energy: PetActivityLevel | null;
  suggestion: string | null;
}

export function activityInsight(pet: Pet): ActivityInsight {
  const breedEnergy = breedReference(pet.breed_id)?.energy ?? null;
  const ownerLevel = pet.activity_level ?? null;
  const energy = ownerLevel ?? breedEnergy;
  let suggestion: string | null = null;
  if (energy) {
    if (pet.species === "cat") {
      suggestion =
        energy === "high"
          ? "Varias sesiones de juego al día (cazar, saltar, trepar) y rascadores a la mano."
          : "Dos o tres sesiones cortas de juego al día lo mantienen activo y de buen ánimo.";
    } else {
      const [min, max] = DOG_ACTIVITY_MINUTES[energy];
      suggestion = `Entre ${min} y ${max} minutos de paseo y juego al día, repartidos en varias salidas.`;
    }
  }
  return { breedEnergy, ownerLevel, energy, suggestion };
}
