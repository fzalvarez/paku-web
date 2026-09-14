import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  CreatePetRecordPayload,
  CreatePetRecordResponse,
  ListRecordsParams,
  PetRecordOut,
} from "@/types/pet-records";

/**
 * Servicio del módulo `pet_records` (historial clínico genérico).
 * Reemplaza los endpoints eliminados `/pets/{id}/weight` y
 * `/pets/{id}/weight-history` — ver doc_fase3_paku-web_migracion_peso.md.
 */
export const petRecordsService = {
  /** GET /pets/{id}/records — lista registros, filtrable por tipo/fecha. */
  list: (petId: string, params?: ListRecordsParams) =>
    apiClient.get<PetRecordOut[]>(ENDPOINTS.PETS.RECORDS(petId), {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  /**
   * POST /pets/{id}/records — crea un registro nuevo.
   * La respuesta trae `price_check` (siempre null desde paku-web, ver tipo).
   */
  create: (petId: string, payload: CreatePetRecordPayload) =>
    apiClient.post<CreatePetRecordResponse>(ENDPOINTS.PETS.RECORDS(petId), {
      ...payload,
      title: payload.title ?? null,
      attachment_ids: payload.attachment_ids ?? [],
    }),
};
