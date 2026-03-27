/**
 * Tipos del carrito (Cart API)
 */

// ── Enums ──────────────────────────────────────────────────────────────────────

export type CartStatus = "active" | "checked_out" | "expired" | "cancelled";
export type CartItemType = "product" | "addon";

// ── Modelos ────────────────────────────────────────────────────────────────────

export interface CartItemOut {
  id: string;
  cart_id: string;
  target_id: string;
  item_type: CartItemType;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  currency: string;
  /** ID del producto padre (solo cuando item_type === "addon") */
  parent_item_id: string | null;
}

export interface CartOut {
  id: string;
  user_id: string;
  status: CartStatus;
  total: number;
  currency: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartWithItemsOut extends CartOut {
  items: CartItemOut[];
}

// ── Inputs ─────────────────────────────────────────────────────────────────────

export interface AddCartItemIn {
  target_id: string;
  item_type: CartItemType;
  quantity: number;
  /** Requerido cuando item_type === "addon" */
  parent_item_id?: string;
}

export interface UpdateCartItemIn {
  quantity: number;
}

// ── Checkout ───────────────────────────────────────────────────────────────────

export interface CheckoutIn {
  address_id: string;
  payment_method?: string;
  notes?: string;
}

export interface CheckoutOut {
  order_id: string;
  status: string;
  total: number;
  currency: string;
  message?: string;
}
