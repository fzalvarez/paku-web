/**
 * Tipos del dominio de reservas (booking / holds)
 */

// ── Disponibilidad ────────────────────────────────────────────────────────────

export interface AvailabilitySlot {
  id: string;
  service_id: string;
  date: string; // YYYY-MM-DD
  capacity: number;
  booked: number;
  available: number;
  is_active: boolean;
}

export interface GetAvailabilityParams {
  service_id?: string;
  date_from?: string; // YYYY-MM-DD
  days?: number;      // 1–30
}

// ── Holds ─────────────────────────────────────────────────────────────────────

export type HoldStatus = "held" | "confirmed" | "cancelled" | "expired";

export interface HoldOut {
  id: string;
  user_id: string;
  pet_id: string;
  service_id: string;
  status: HoldStatus;
  expires_at: string; // ISO datetime
  created_at: string;
  date: string;       // YYYY-MM-DD
}

export interface CreateHoldRequest {
  pet_id: string;
  service_id: string;
  date: string; // YYYY-MM-DD
}
