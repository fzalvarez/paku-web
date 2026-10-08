/** Salud preventiva: vacunas, antiparasitario, esterilización y revisión dental. */
import type { PetRecordOut } from "@/types/pet-records";
import type { Pet } from "@/types/pets";
import type { Age } from "./age";
import { addDays, daysBetween, formatDay, limaDay } from "./dates";
import { DENTAL_CHECK_FROM_YEARS, DEWORMING_INTERVAL_DAYS } from "./rules";

export type CheckStatus = "ok" | "pending" | "unknown";

export interface PreventiveItem {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  /** Artículo del blog relacionado, si hay. */
  articleSlug?: string;
}

function lastRecordDay(records: PetRecordOut[], type: PetRecordOut["type"]): string | undefined {
  return records
    .filter((r) => r.type === type && !r.deleted_at)
    .map((r) => limaDay(r.occurred_at))
    .sort()
    .at(-1);
}

export function preventiveChecklist(pet: Pet, age: Age | null, records: PetRecordOut[], today: string): PreventiveItem[] {
  const items: PreventiveItem[] = [];

  items.push({
    id: "vaccines",
    label: "Vacunas",
    status: pet.vaccines_up_to_date == null ? "unknown" : pet.vaccines_up_to_date ? "ok" : "pending",
    detail:
      pet.vaccines_up_to_date == null
        ? "Sin dato: indícalo en su ficha."
        : pet.vaccines_up_to_date
          ? "Al día, según su ficha."
          : "Pendientes: consulta con tu veterinario.",
  });

  const lastDeworming = lastRecordDay(records, "deworming");
  if (pet.antiparasitic === false) {
    items.push({ id: "deworming", label: "Antiparasitario", status: "pending", detail: "Sin antiparasitario, según su ficha." });
  } else if (lastDeworming && pet.antiparasitic_interval) {
    const next = addDays(lastDeworming, DEWORMING_INTERVAL_DAYS[pet.antiparasitic_interval]);
    const left = daysBetween(today, next);
    items.push({
      id: "deworming",
      label: "Antiparasitario",
      status: left >= 0 ? "ok" : "pending",
      detail: left >= 0 ? `Próxima dosis estimada: ${formatDay(next)}.` : `Le tocaba el ${formatDay(next)}.`,
    });
  } else {
    items.push({
      id: "deworming",
      label: "Antiparasitario",
      status: pet.antiparasitic ? "ok" : "unknown",
      detail: pet.antiparasitic
        ? "Con antiparasitario, según su ficha."
        : "Sin dato: indica en su ficha si recibe antiparasitario y cada cuánto.",
    });
  }

  items.push({
    id: "sterilized",
    label: "Esterilización",
    status: pet.sterilized == null ? "unknown" : pet.sterilized ? "ok" : "pending",
    detail: pet.sterilized == null ? "Sin dato." : pet.sterilized ? "Esterilizado/a." : "No esterilizado/a.",
  });

  if (pet.species !== "cat" && age && age.exact >= DENTAL_CHECK_FROM_YEARS) {
    items.push({
      id: "dental",
      label: "Revisión dental",
      status: "pending",
      detail: `Desde los ${DENTAL_CHECK_FROM_YEARS} años conviene revisar su boca en cada control veterinario.`,
      articleSlug: "limpieza-de-dientes-del-perro",
    });
  }

  return items;
}
