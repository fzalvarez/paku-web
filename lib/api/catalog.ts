import { publicApiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { Breed, PetSpecies } from "@/types/pets";

/**
 * Servicio del catálogo público (razas, etc.).
 * No requiere autenticación.
 */
export const catalogService = {
  /**
   * GET /catalog/breeds?species=dog|cat
   * Lista todas las razas, opcionalmente filtradas por especie.
   */
  listBreeds: (species?: PetSpecies): Promise<Breed[]> =>
    publicApiClient.get<Breed[]>(ENDPOINTS.CATALOG.BREEDS, {
      params: species ? { species } : undefined,
    }),
};
