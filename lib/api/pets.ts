import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { Pet, CreatePetRequest } from "@/types/pets";

/**
 * Servicios del dominio de mascotas.
 * GET /pets → lista las mascotas del usuario autenticado.
 */
export const petsService = {
  /** Lista todas las mascotas del usuario autenticado */
  list: () => apiClient.get<Pet[]>(ENDPOINTS.PETS.LIST),

  /** Detalle de una mascota (público) */
  detail: (id: string) => apiClient.get<Pet>(ENDPOINTS.PETS.DETAIL(id)),

  /** Crea una nueva mascota para el usuario autenticado */
  create: (data: CreatePetRequest) =>
    apiClient.post<Pet>(ENDPOINTS.PETS.LIST, data),
};
