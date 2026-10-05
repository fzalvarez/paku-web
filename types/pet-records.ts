/**
 * Tipos del módulo `pet_records` (historial clínico genérico de mascotas).
 * Reemplaza los endpoints dedicados de peso (`/pets/{id}/weight`,
 * `/pets/{id}/weight-history`), eliminados por el backend — ver
 * doc_fase3_paku-web_migracion_peso.md.
 *
 * paku-web hoy solo usa `type: "weight_record"`, pero se tipa el enum
 * completo porque el backend lo devuelve tal cual (mismo contrato que
 * consume paku-admin).
 */

export type RecordType =
  | "check_up"
  | "vaccine"
  | "deworming"
  | "medication"
  | "bath"
  | "grooming"
  | "weight_record"
  | "nutrition"
  | "disease_condition"
  | "surgery"
  | "study_test"
  | "note";

export interface WeightRecordData {
  weight_kg: number;
}

export interface PetRecordOut {
  id: string;
  pet_id: string;
  type: RecordType;
  title: string;
  occurred_at: string; // ISO datetime
  created_at: string;
  updated_at: string;
  recorded_by_user_id: string | null;
  recorded_by_role: "owner" | "groomer" | "admin" | "system";
  recorded_by_name?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  attachment_ids: string[];
  deleted_at: string | null;
}

export interface CreatePetRecordPayload {
  type: RecordType;
  occurred_at: string; // ISO datetime, no puede ser futuro
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  title?: string | null;
  attachment_ids?: string[];
}

/**
 * price_check solo viene presente (no null) cuando quien registra el peso
 * es admin/groomer con una orden pagada de esa mascota en curso — nunca desde
 * paku-web (siempre viene null acá). Se tipa por completitud del contrato.
 */
export interface PriceCheckOut {
  order_id: string;
  old_price: number;
  new_price: number;
  difference: number;
}

export interface CreatePetRecordResponse {
  record: PetRecordOut;
  price_check: PriceCheckOut | null;
}

export interface ListRecordsParams {
  type?: RecordType;
  date_from?: string;
  date_to?: string;
  recorded_by_role?: "owner" | "groomer" | "admin" | "system";
  limit?: number;
  offset?: number;
}
