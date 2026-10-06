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

/**
 * Ítem que se envía al carrito. Sin nombre ni precio: los calcula el backend
 * (C-07). El servicio base lleva meta.pet_id y meta.hold_id; los adicionales
 * van sin meta (el backend los liga al servicio base).
 */
export interface CartItemInput {
  kind: CartItemKind;
  ref_id: string;
  qty: number;
  meta?: CartItemMeta;
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

/** detail del 409 PRICE_CHANGED en POST /cart/{id}/checkout. El carrito ya quedó con los precios nuevos. */
export interface PriceChangedDetail {
  code: "PRICE_CHANGED";
  message: string;
  items: { item_id: string; name: string; old_unit_price: number; new_unit_price: number }[];
  total: number;
  currency: string;
}

