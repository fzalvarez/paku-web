import { publicApiClient } from "./client";

// Libro de Reclamaciones (paku-backend C-52). Público: no requiere sesión.

export type ComplaintKind = "reclamo" | "queja";
export type ComplaintDocType = "dni" | "ce" | "pasaporte" | "ruc";
export type ComplaintItemType = "servicio" | "producto";

export interface ComplaintIn {
  consumer_name: string;
  doc_type: ComplaintDocType;
  doc_number: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  is_minor: boolean;
  guardian_name?: string | null;
  item_type: ComplaintItemType;
  item_description: string;
  order_reference?: string | null;
  amount_claimed?: number | null;
  kind: ComplaintKind;
  detail: string;
  request: string;
}

export interface ComplaintReceipt {
  id: string;
  code: string;
  created_at: string;
  response_due: string;
  email: string;
  provider_legal_name: string;
  provider_ruc: string;
  provider_address: string;
}

export const complaintsService = {
  submit: (payload: ComplaintIn) => publicApiClient.post<ComplaintReceipt>("/complaints", payload),
};
