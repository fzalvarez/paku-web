/**
 * Umbrales del panel de la mascota (spec 0003). Todos orientativos y
 * PENDIENTES DE CONFIRMAR con el owner (idealmente con un veterinario).
 * Es el único archivo que hay que tocar para ajustarlos.
 */
import type { BreedCoatType, PetActivityLevel, PetCoatType, PetSize } from "@/types/pets";

/** Tamaño estimado por peso cuando no hay `size` ni datos de raza: < 10 kg pequeño, ≤ 25 mediano. */
export const SIZE_BY_WEIGHT_KG = { smallBelow: 10, mediumUpTo: 25 } as const;

/** Edad (años) desde la que se considera senior. */
export const SENIOR_FROM_YEARS: Record<PetSize, number> = { small: 10, medium: 8, large: 7 };
export const CAT_SENIOR_FROM_YEARS = 11;
/** Hasta qué edad es cachorro/gatito. */
export const PUPPY_UNTIL_YEARS = 1;

/** Edad humana: 1.er año = 15, 2.º = 24, luego estos años por cada año (gatos como pequeños). */
export const HUMAN_AGE = { firstYear: 15, secondYear: 24 } as const;
export const HUMAN_YEARS_PER_YEAR: Record<PetSize, number> = { small: 4, medium: 5, large: 6 };
export const CAT_HUMAN_YEARS_PER_YEAR = 4;

/** Semanas entre baños según el tipo de pelo que indicó el dueño. */
export const BATH_WEEKS_BY_PET_COAT: Record<PetCoatType, number> = { short: 7, medium: 5, long: 4 };
/** Si el dueño no lo indicó: según el manto de la raza (catálogo del backend). */
export const BATH_WEEKS_BY_BREED_COAT: Record<BreedCoatType, number> = {
  simple_short: 7,
  simple_medium_long: 4,
  curly_no_undercoat: 4,
  double_short: 6, // doble capa: pocos baños, mucho cepillado
  double_long: 6,
  mixed_curly_undercoat: 4,
};
export const DEFAULT_BATH_WEEKS = 5;

/** Días entre dosis de antiparasitario. */
export const DEWORMING_INTERVAL_DAYS = { monthly: 30, trimestral: 90 } as const;

/** Revisión dental recomendada desde esta edad (perros). */
export const DENTAL_CHECK_FROM_YEARS = 3;

/** Actividad diaria sugerida (minutos) según la energía. */
export const DOG_ACTIVITY_MINUTES: Record<PetActivityLevel, [number, number]> = {
  low: [30, 60],
  medium: [60, 90],
  high: [90, 120],
};
