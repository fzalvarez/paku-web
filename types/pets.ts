/**
 * Tipos del dominio de mascotas.
 * Refleja el esquema que devuelve GET /pets y GET /pets/{id}
 */

export type PetSpecies = "dog" | "cat";
export type PetSex = "male" | "female";
export type PetSize = "small" | "medium" | "large";
export type PetCoatType = "short" | "medium" | "long";
export type PetActivityLevel = "low" | "medium" | "high";
export type PetBathBehavior = "calm" | "fearful" | "anxious";
export type PetAntiparasiticInterval = "monthly" | "trimestral";

export interface Pet {
  id: string;
  owner_id?: string;
  name: string;
  species: PetSpecies | string;
  breed_id?: string | null;
  /** Nombre de display de la raza — lo deriva el backend a partir de breed_id, solo lectura. */
  breed_name?: string | null;
  sex?: PetSex | string | null;
  birth_date?: string | null;
  notes?: string | null;
  photo_url?: string | null;
  weight_kg?: number | null;
  created_at?: string;
  updated_at?: string;
  // campos opcionales de perfil de grooming
  size?: PetSize | null;
  coat_type?: PetCoatType | null;
  sterilized?: boolean | null;
  vaccines_up_to_date?: boolean | null;
  activity_level?: PetActivityLevel | null;
  skin_sensitivity?: boolean | null;
  bath_behavior?: PetBathBehavior | null;
  tolerates_drying?: boolean | null;
  tolerates_nail_clipping?: boolean | null;
  grooming_frequency?: string | null;
  receive_reminders?: boolean | null;
  antiparasitic?: boolean | null;
  antiparasitic_interval?: PetAntiparasiticInterval | null;
  special_shampoo?: boolean | null;
}

export interface CreatePetRequest {
  name: string;
  species: PetSpecies;
  breed_id?: string | null;
  sex?: PetSex | null;
  birth_date?: string | null;
  notes?: string | null;
  photo_url?: string | null;
  weight_kg?: number | null;
}

// ── Catálogo de razas ─────────────────────────────────────────────────────────

/** Manto según el catálogo de razas del backend (`breeds_data.py`). */
export type BreedCoatGroup = "single" | "double";
export type BreedCoatType =
  | "simple_short"
  | "simple_medium_long"
  | "curly_no_undercoat"
  | "double_short"
  | "double_long"
  | "mixed_curly_undercoat";

export interface Breed {
  id: string;
  name: string;
  species: PetSpecies;
  /** null en mestizos y gatos (aún sin clasificar en el backend). */
  coat_group?: BreedCoatGroup | null;
  coat_type?: BreedCoatType | null;
  breeds?: Breed[];
}

/**
 * PUT /pets/{id} — actualiza los campos básicos editables.
 * No incluye: species (inmutable), weight_kg (va por /weight o /optional),
 * photo_url (gestionada exclusivamente por el módulo media).
 */
export interface UpdatePetRequest {
  name: string;
  breed_id?: string | null;
  sex?: PetSex | null;
  birth_date?: string | null;
  notes?: string | null;
}

/**
 * PATCH /pets/{id}/optional — actualiza el perfil avanzado de grooming.
 * Todos los campos son opcionales; solo se envían los que cambian.
 * No incluye weight_kg — el backend lo ignora silenciosamente en este
 * endpoint desde la migración a pet_records (ver types/pet-records.ts).
 */
export interface PatchPetOptionalRequest {
  size?: PetSize | null;
  coat_type?: PetCoatType | null;
  sterilized?: boolean | null;
  vaccines_up_to_date?: boolean | null;
  activity_level?: PetActivityLevel | null;
  skin_sensitivity?: boolean | null;
  bath_behavior?: PetBathBehavior | null;
  tolerates_drying?: boolean | null;
  tolerates_nail_clipping?: boolean | null;
  grooming_frequency?: string | null;
  receive_reminders?: boolean | null;
  antiparasitic?: boolean | null;
  antiparasitic_interval?: PetAntiparasiticInterval | null;
  special_shampoo?: boolean | null;
}

// El historial de peso ahora es un caso particular de pet_records
// (type: "weight_record") — ver types/pet-records.ts.
