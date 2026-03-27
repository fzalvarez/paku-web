import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { Pet, CreatePetRequest, UpdatePetRequest, PatchPetOptionalRequest, WeightRecord, RecordWeightRequest } from "@/types/pets";

/**
 * Servicios del dominio de mascotas.
 */
export const petsService = {
  /** GET /pets — lista las mascotas del usuario autenticado */
  list: () => apiClient.get<Pet[]>(ENDPOINTS.PETS.LIST),

  /** GET /pets/{id} — Detalle de una mascota */
  detail: (id: string) => apiClient.get<Pet>(ENDPOINTS.PETS.DETAIL(id)),

  /** POST /pets — Crea una nueva mascota */
  create: (data: CreatePetRequest) =>
    apiClient.post<Pet>(ENDPOINTS.PETS.LIST, data),

  /** PUT /pets/{id} — Actualiza todos los campos de una mascota */
  update: (id: string, data: UpdatePetRequest) =>
    apiClient.put<Pet>(ENDPOINTS.PETS.DETAIL(id), data),

  /** PATCH /pets/{id}/optional — Actualiza campos opcionales */
  patchOptional: (id: string, data: PatchPetOptionalRequest) =>
    apiClient.patch<Pet>(`${ENDPOINTS.PETS.DETAIL(id)}/optional`, data),

  /** DELETE /pets/{id} — Elimina una mascota */
  delete: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.PETS.DETAIL(id)),

  /** POST /pets/{id}/weight — Registra el peso de una mascota */
  recordWeight: (id: string, data: RecordWeightRequest) =>
    apiClient.post<WeightRecord>(`${ENDPOINTS.PETS.DETAIL(id)}/weight`, data),

  /** GET /pets/{id}/weight-history — Historial de peso */
  weightHistory: (id: string) =>
    apiClient.get<WeightRecord[]>(`${ENDPOINTS.PETS.DETAIL(id)}/weight-history`),
};
