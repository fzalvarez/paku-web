/**
 * Tipos del dominio de pagos — Culqi
 * Reemplaza la integración anterior de Mercado Pago.
 */

// ─── Token de Culqi (respuesta de secure.culqi.com/v2/tokens) ────────────────

/** Info de marca/tipo de tarjeta — Culqi la anida bajo `iin`, nunca es campo raíz. */
export interface CulqiIin {
  bin: string;
  card_brand: string; // "Visa", "Mastercard", "Amex", ...
  card_type?: string; // "Credito" | "Debito"
  card_category?: string;
}

export interface CulqiToken {
  id: string; // "tkn_test_xxx" o "tkn_live_xxx" — se envía al backend
  object: string;
  email: string;
  last_four: string;
  iin?: CulqiIin;
}

export interface CulqiTokenError {
  object: "error";
  type: string;
  merchant_message: string;
  user_message: string;
  code?: string;
}

// ─── Datos de tarjeta (solo para tokenización directa con Culqi) ─────────────
// Estos datos NUNCA llegan al backend propio — van directo a Culqi.

export interface CardData {
  card_number: string; // Sin espacios ni guiones
  cvv: string;
  expiration_month: string; // "01" – "12"
  expiration_year: string; // "2026", "2027"...
  email: string;
}

// ─── Tarjetas guardadas (respuesta del backend) ───────────────────────────────

export interface SavedCard {
  id: string; // UUID interno del backend para mostrar en la UI
  user_id: string;
  provider: string; // "culqi"
  payment_method_id: string; // crd_test_xxx — ID de tarjeta en Culqi
  brand: string; // "visa" | "master" | "amex" | ...
  last4: string; // últimos 4 dígitos
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created_at: string;
}

/** Payload de POST /wallet/cards. No incluye PAN ni CVV. */
export interface SaveCardIn {
  token_id: string;
  expiration_month: number;
  expiration_year: number;
}
