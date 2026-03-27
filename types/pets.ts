/**
 * Tipos del dominio de mascotas.
 * Refleja el esquema que devuelve GET /pets y GET /pets/{id}
 */

export type PetSpecies = "dog" | "cat";
export type PetSex = "male" | "female";

export interface Pet {
  id: string;
  owner_id?: string;
  name: string;
  species: PetSpecies | string;
  breed?: string | null;
  sex?: PetSex | string | null;
  birth_date?: string | null;
  notes?: string | null;
  photo_url?: string | null;
  weight_kg?: number | null;
  created_at?: string;
  updated_at?: string;
  // campos opcionales de grooming
  size?: "small" | "medium" | "large" | null;
  coat_type?: "short" | "medium" | "long" | null;
  sterilized?: boolean | null;
  vaccines_up_to_date?: boolean | null;
}

export interface CreatePetRequest {
  name: string;
  species: PetSpecies;
  breed?: string | null;
  sex?: PetSex | null;
  birth_date?: string | null;
  notes?: string | null;
  photo_url?: string | null;
  weight_kg?: number | null;
}

// ── Catálogo de razas ─────────────────────────────────────────────────────────

export interface Breed {
  id: string;
  name: string;
  species: PetSpecies;
}

export interface UpdatePetRequest {
  name: string;
  species: PetSpecies;
  breed?: string | null;
  sex?: PetSex | null;
  birth_date?: string | null;
  notes?: string | null;
  photo_url?: string | null;
  weight_kg?: number | null;
}

export interface PatchPetOptionalRequest {
  size?: "small" | "medium" | "large" | null;
  coat_type?: "short" | "medium" | "long" | null;
  sterilized?: boolean | null;
  vaccines_up_to_date?: boolean | null;
  notes?: string | null;
}

export interface WeightRecord {
  id: string;
  pet_id: string;
  weight_kg: number;
  recorded_at: string;
}

export interface RecordWeightRequest {
  weight_kg: number;
  recorded_at?: string; // ISO date, default: now
}
