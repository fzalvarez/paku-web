/** Alimentación orientativa: tipo de alimento según especie, etapa y tamaño. Sin marcas ni cantidades. */
import type { Pet } from "@/types/pets";
import { effectiveSize, type LifeStage } from "./age";
import type { WeightAssessment } from "./weight";

const SIZE_LABEL = { small: "pequeña", medium: "mediana", large: "grande" } as const;

export interface NutritionInsight {
  foodType: string;
  tips: string[];
}

export function nutritionInsight(pet: Pet, stage: LifeStage | null, weight: WeightAssessment | null): NutritionInsight | null {
  if (!stage) return null;
  const isCat = pet.species === "cat";
  const size = effectiveSize(pet);
  const tips: string[] = [];

  let foodType: string;
  if (isCat) {
    foodType = stage === "puppy" ? "Alimento para gatitos" : stage === "senior" ? "Alimento para gatos senior" : "Alimento para gatos adultos";
    tips.push("Agua fresca siempre a su alcance; el alimento húmedo también ayuda a su hidratación.");
  } else {
    const sizeText = size ? ` de raza ${SIZE_LABEL[size]}` : "";
    foodType =
      stage === "puppy" ? `Alimento para cachorros${sizeText}` : stage === "senior" ? `Alimento para perros senior${sizeText}` : `Alimento para perros adultos${sizeText}`;
    if (stage === "puppy" && size === "large") {
      tips.push("Los cachorros de razas grandes necesitan un alimento específico para crecer a un ritmo sano.");
    }
  }

  if (pet.sterilized) tips.push("Al estar esterilizado/a suele necesitar menos calorías: vigila las porciones.");
  if (weight?.position === "above") tips.push("Su peso está por encima de lo habitual para su raza: consulta un plan de alimentación con tu veterinario.");
  if (weight?.position === "below") tips.push("Su peso está por debajo de lo habitual para su raza: coméntalo en su próximo control veterinario.");
  if (stage === "senior") tips.push("En la etapa senior conviene revisar su dieta con el veterinario en cada control.");

  return { foodType, tips };
}
