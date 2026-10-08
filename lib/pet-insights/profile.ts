/** Datos que faltan en la ficha y qué desbloquea cada uno en el panel. */
import type { Pet } from "@/types/pets";

export interface MissingField {
  field: keyof Pet;
  label: string;
  unlocks: string;
}

const CHECKS: MissingField[] = [
  { field: "breed_id", label: "Raza", unlocks: "su peso habitual, energía y esperanza de vida" },
  { field: "birth_date", label: "Fecha de nacimiento", unlocks: "su edad, etapa y edad humana" },
  { field: "weight_kg", label: "Peso", unlocks: "la evolución de su peso" },
  { field: "coat_type", label: "Tipo de pelo", unlocks: "cada cuánto le toca el baño" },
  { field: "activity_level", label: "Nivel de actividad", unlocks: "cuánto ejercicio necesita" },
  { field: "antiparasitic_interval", label: "Frecuencia del antiparasitario", unlocks: "la fecha de su próxima dosis" },
  { field: "vaccines_up_to_date", label: "Vacunas", unlocks: "su resumen de salud preventiva" },
];

export function missingFields(pet: Pet): MissingField[] {
  return CHECKS.filter((c) => pet[c.field] == null || pet[c.field] === "");
}
