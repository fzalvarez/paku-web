/**
 * Tipos del carrito (Cart API) — alineados con flujo-compra-servicio.md
 */

// ── Enums ──────────────────────────────────────────────────────────────────────

export type CartStatus = "active" | "checked_out" | "expired" | "cancelled";
export type CartItemKind = "service_base" | "service_addon" | "product";

// ── Meta del ítem ──────────────────────────────────────────────────────────────

export interface CartItemMeta {
  /** Para service_base */
  pet_id?: string;
  /** Reserva de cupo (POST /holds), obligatoria en el servicio base (C-15) */
  hold_id?: string;
  /** La completa el backend a partir de la reserva */
  scheduled_date?: string; // YYYY-MM-DD
  scheduled_time?: string; // HH:MM
  /** Para service_addon */
  base_service_id?: string;
  [key: string]: string | undefined;
}

// ── Modelos de respuesta ────────────────────────────────────────────────────────

export interface CartItemOut {
  id: string;
  cart_id: string;
  kind: CartItemKind;
  ref_id: string;
  name: string;
  qty: number;
  /** Precio calculado por el backend (C-07). Es el único que se muestra. */
  unit_price: number;
  meta: CartItemMeta;
  /** true si el precio que envió el front no coincidía con el del backend */
  price_adjusted?: boolean;
  client_unit_price?: number | null;
}

export interface CartOut {
  id: string;
  user_id: string;
  status: CartStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartWithItemsOut {
  cart: CartOut;
  items: CartItemOut[];
}

// ── Inputs ─────────────────────────────────────────────────────────────────────

export interface CartItemInput {
  kind: CartItemKind;
  ref_id: string;
  name: string;
  qty: number;
  unit_price: number;
  meta: CartItemMeta;
}

export interface AddCartItemsIn {
  items: CartItemInput[];
}

export interface ReplaceCartItemsIn {
  items: CartItemInput[];
}

// ── Validación ─────────────────────────────────────────────────────────────────

export interface CartValidateOut {
  valid: boolean;
  errors: string[];
  warnings: string[];
  total: number;
  currency: string;
}

// ── Checkout del carrito ────────────────────────────────────────────────────────

export interface CartCheckoutOut {
  cart_id: string;
  status: "checked_out";
  total: number;
  currency: string;
  items: CartItemOut[];
}

// ── Legacy (conservado para compatibilidad durante migración) ──────────────────

/** @deprecated Usar CartItemInput */
export type AddCartItemIn = CartItemInput;
/** @deprecated Usar CartItemInput */
export type UpdateCartItemIn = { quantity: number };
/** @deprecated */
export interface CheckoutIn { address_id: string; payment_method?: string; notes?: string; }
/** @deprecated */
export interface CheckoutOut { order_id: string; status: string; total: number; currency: string; message?: string; }
