/**
 * Tipos del dominio de órdenes — alineados con flujo-compra-servicio.md
 */

import type { CartItemMeta } from "./cart";

// ── Estados ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "created"
  | "on_the_way"
  | "in_service"
  | "done"
  | "cancelled";

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
  ally_id: string | null;
  scheduled_at: string | null;
  hold_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── Input para crear orden ─────────────────────────────────────────────────────

export interface CreateOrderIn {
  cart_id: string;
  address_id?: string;
}
