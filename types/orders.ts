/**
 * Tipos del dominio de órdenes — alineados con flujo-compra-servicio.md
 */

import type { CartItemMeta } from "./cart";

// ── Estados ────────────────────────────────────────────────────────────────────

/**
 * "skipped" (C-13): el groomer no pudo hacer la parada (mascota o tutor
 * ausente). El backend puede sumar estados: no asumir que la lista es cerrada
 * (los textos tienen valor por defecto en lib/labels.ts).
 */
export type OrderStatus =
  | "created"
  | "accepted"
  | "on_the_way"
  | "in_service"
  | "done"
  | "cancelled"
  | "skipped";

/** Pasos del servicio en la van (C-11), en orden. */
export type ServiceStep = "reception" | "bath" | "drying" | "finishing" | "return";

export type SkipReason = "pet_not_present" | "tutor_not_present" | "other";

/**
 * "verifying" es nuevo desde la migración a POST /orders/{id}/pay: el cobro
 * se intentó pero el resultado no se pudo confirmar a tiempo (microcorte).
 * No es un error — paku-backend sigue reconciliando en segundo plano; el
 * cliente puede consultar GET /orders/{id} más tarde para ver el estado
 * final. Ver doc_fase1_paku-web_migracion_pago.md.
 */
export type OrderPaymentStatus = "pending" | "paid" | "failed" | "verifying";

export type OrderPaymentMethod = "card" | "yape" | "cash";

// ── Snapshot de items (inmutable al crear la orden) ────────────────────────────

export interface OrderItemSnapshot {
  kind: "service_base" | "service_addon" | "product";
  ref_id?: string;
  name: string;
  qty: number;
  unit_price: number;
  meta?: CartItemMeta;
}

// ── Snapshot de dirección (inmutable al crear la orden) ────────────────────────

export interface OrderAddressSnapshot {
  district_id: string;
  address_line: string;
  lat: number;
  lng: number;
  reference?: string | null;
}

// ── Modelo principal ───────────────────────────────────────────────────────────

export interface OrderOut {
  id: string;
  user_id: string;
  status: OrderStatus;
  items_snapshot: OrderItemSnapshot[];
  total_snapshot: number;
  currency: string;
  delivery_address_snapshot: OrderAddressSnapshot | null;
  /**
   * No nulo cuando esta orden es un cargo adicional generada por
   * POST /orders/{id}/create-adjustment (recálculo de precio por peso real
   * distinto al declarado) — apunta a la orden original. Ver
   * doc_fase4_recalculo_precio_por_peso.md.
   */
  parent_order_id?: string | null;
  groomer_id: string | null;
  /** Fecha y hora de la parada que asigna el admin (UTC). Null hasta la asignación. */
  scheduled_at: string | null;
  hold_id: string | null;
  payment_status?: OrderPaymentStatus;
  payment_method?: OrderPaymentMethod | null;
  culqi_charge_id?: string | null;
  /** Paso actual dentro de in_service (C-11). Null fuera del servicio. */
  service_step?: ServiceStep | null;
  service_steps_log?: ServiceStepLogEntry[];
  addons_done?: AddonDoneEntry[];
  /** Solo en órdenes saltadas (C-13). */
  skip_reason?: SkipReason | null;
  skip_note?: string | null;
  skipped_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceStepLogEntry {
  step: ServiceStep;
  started_at: string;
}

export interface AddonDoneEntry {
  addon_id: string;
  done_at: string;
}

// ── Input para crear orden ─────────────────────────────────────────────────────

export interface CreateOrderIn {
  cart_id: string;
  address_id?: string;
}
