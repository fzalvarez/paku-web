/**
 * Datos de referencia por raza para el panel de la mascota. Las claves son los
 * `breed_id` del catálogo del backend (`paku-backend/app/modules/catalog/domain/breeds_data.py`):
 * si el backend agrega una raza, aquí simplemente no habrá datos y el panel usa
 * el tamaño y el peso de la mascota.
 *
 * Valores APROXIMADOS de adultos, tomados de los estándares de raza (AKC/FCI).
 * Pendientes de revisión por el owner. Los mestizos (`dog_mixed`, `cat_mixed`)
 * no tienen datos a propósito.
 */
import type { PetActivityLevel, PetSize } from "@/types/pets";

export interface BreedReference {
  size: PetSize;
  /** Peso adulto habitual [mín, máx] en kg (machos y hembras). */
  weightKg: [number, number];
  energy: PetActivityLevel;
  /** Esperanza de vida habitual [mín, máx] en años. */
  lifespanYears: [number, number];
  /** Aclaración cuando la raza tiene variantes muy distintas. */
  note?: string;
}

const r = (
  size: PetSize,
  weightKg: [number, number],
  energy: PetActivityLevel,
  lifespanYears: [number, number],
  note?: string,
): BreedReference => ({ size, weightKg, energy, lifespanYears, note });

export const BREED_REFERENCE: Record<string, BreedReference> = {
  // ── Perros · pelo simple corto ──
  dogo_argentino: r("large", [35, 45], "high", [9, 15]),
  dachshund: r("small", [4, 14], "medium", [12, 16], "Incluye la variante miniatura y la estándar."),
  whippet: r("medium", [11, 18], "medium", [12, 15]),
  gran_danes: r("large", [50, 80], "medium", [7, 10]),
  pitbull: r("medium", [14, 27], "high", [12, 14]),
  american_bully: r("large", [20, 45], "medium", [10, 12], "El peso varía mucho entre sus variantes."),
  boxer: r("large", [25, 32], "high", [10, 12]),
  beagle: r("medium", [9, 14], "high", [10, 15]),
  pug: r("small", [6, 8], "low", [13, 15]),
  boston_terrier: r("small", [5, 11], "medium", [11, 13]),
  fox_terrier_smooth: r("small", [7, 9], "high", [12, 15]),
  dalmata: r("large", [20, 32], "high", [11, 13]),
  doberman: r("large", [27, 45], "high", [10, 12]),
  weimaraner: r("large", [25, 40], "high", [10, 13]),
  galgo: r("large", [20, 30], "medium", [12, 15]),
  greyhound: r("large", [27, 32], "medium", [10, 13]),
  pinscher: r("small", [4, 6], "high", [12, 16], "Pinscher miniatura."),
  chihuahua: r("small", [1.5, 3], "medium", [14, 16]),
  french_bulldog: r("small", [8, 13], "low", [10, 12]),
  bulldog: r("medium", [18, 25], "low", [8, 10]),
  basset_hound: r("medium", [20, 29], "low", [12, 13]),
  bull_terrier: r("medium", [22, 32], "high", [12, 13]),
  shar_pei: r("medium", [18, 27], "medium", [8, 12]),

  // ── Perros · pelo simple medio/largo ──
  schnauzer: r("small", [5, 9], "high", [12, 15], "Schnauzer miniatura, la variante más común en Perú."),
  shih_tzu: r("small", [4, 7.5], "low", [10, 18]),
  lhasa_apso: r("small", [5, 8], "low", [12, 15]),
  yorkshire: r("small", [2, 3.5], "medium", [11, 15]),
  maltese: r("small", [2, 4], "medium", [12, 15]),
  papillon: r("small", [2, 4.5], "high", [14, 16]),
  pekines: r("small", [3, 6], "low", [12, 14]),
  chinese_crested: r("small", [3.5, 5.5], "medium", [13, 18]),
  afghan_hound: r("large", [23, 27], "medium", [12, 18]),
  havanese: r("small", [3, 6], "medium", [14, 16]),

  // ── Perros · pelo rizado sin subpelo ──
  poodle: r("small", [2, 8], "high", [12, 15], "Poodle toy y miniatura; el estándar pesa 18–32 kg."),
  bichon_frise: r("small", [5, 8], "medium", [14, 15]),
  kerry_blue_terrier: r("medium", [15, 18], "high", [12, 15]),
  bedlington_terrier: r("small", [8, 10.5], "medium", [11, 16]),

  // ── Perros · doble manto corto ──
  labrador: r("large", [25, 36], "high", [11, 13]),
  pastor_aleman: r("large", [22, 40], "high", [7, 10]),
  american_eskimo: r("medium", [3, 16], "high", [13, 15], "Tiene variantes toy, miniatura y estándar."),
  malinois: r("large", [20, 30], "high", [14, 16]),
  australian_cattle_dog: r("medium", [15, 22], "high", [12, 16]),
  cocker_spaniel: r("medium", [12, 15.5], "medium", [12, 14]),
  cocker_americano: r("medium", [9, 14], "medium", [10, 14]),
  akita: r("large", [32, 59], "medium", [10, 13]),
  shiba_inu: r("small", [7, 11], "medium", [13, 16]),
  rottweiler: r("large", [35, 60], "medium", [9, 10]),
  chow_chow: r("large", [20, 32], "low", [8, 12]),
  corgi: r("medium", [10, 14], "high", [12, 13]),
  west_highland: r("small", [6, 10], "high", [13, 15]),

  // ── Perros · doble manto largo ──
  golden_retriever: r("large", [25, 34], "high", [10, 12]),
  husky: r("medium", [16, 27], "high", [12, 14]),
  samoyedo: r("medium", [16, 30], "high", [12, 14]),
  alaskan_malamute: r("large", [34, 39], "high", [10, 14]),
  border_collie: r("medium", [14, 25], "high", [12, 15]),
  shetland_sheepdog: r("small", [7, 11], "high", [12, 14]),
  old_english_sheepdog: r("large", [27, 45], "medium", [10, 12]),
  pomeranian: r("small", [1.5, 3.5], "medium", [12, 16]),
  collie: r("large", [23, 34], "medium", [12, 14]),
  bernese_mountain_dog: r("large", [32, 52], "medium", [7, 10]),
  australian_shepherd: r("medium", [18, 30], "high", [12, 15]),
  san_bernardo: r("large", [54, 82], "low", [8, 10]),
  terranova: r("large", [45, 68], "low", [9, 10]),

  // ── Perros · cruces con poodle (el tamaño depende del cruce) ──
  labradoodle: r("medium", [7, 30], "high", [12, 14], "Varía según el tamaño del poodle del cruce."),
  goldendoodle: r("medium", [7, 40], "high", [10, 15], "Varía según el tamaño del poodle del cruce."),
  cockapoo: r("small", [5, 11], "medium", [13, 15]),
  bernedoodle: r("medium", [11, 41], "medium", [12, 15], "Varía según el tamaño del poodle del cruce."),
  sheepadoodle: r("large", [25, 36], "medium", [12, 15]),

  // ── Gatos ──
  abyssinian: r("small", [3, 5], "high", [12, 15]),
  bengal: r("small", [3.5, 7], "high", [12, 16]),
  birman: r("small", [3, 6], "medium", [12, 16]),
  british_shorthair: r("small", [4, 8], "low", [12, 17]),
  burmese: r("small", [3, 6], "medium", [12, 16]),
  exotic_shorthair: r("small", [3, 6], "low", [12, 15]),
  maine_coon: r("small", [5, 11], "medium", [12, 15]),
  norwegian_forest: r("small", [4, 9], "medium", [14, 16]),
  persian: r("small", [3, 6], "low", [12, 17]),
  ragdoll: r("small", [4.5, 9], "low", [12, 17]),
  russian_blue: r("small", [3, 5.5], "medium", [15, 20]),
  scottish_fold: r("small", [3, 6], "low", [11, 14]),
  siamese: r("small", [2.5, 5.5], "high", [15, 20]),
  sphynx: r("small", [3, 5], "high", [9, 15]),
  american_shorthair: r("small", [3.5, 7], "medium", [15, 20]),
  munchkin: r("small", [2, 4], "medium", [12, 15]),
  oriental: r("small", [2.5, 5], "high", [12, 15]),
};

export function breedReference(breedId: string | null | undefined): BreedReference | null {
  return (breedId && BREED_REFERENCE[breedId]) || null;
}
