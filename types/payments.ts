/**
 * Tipos del dominio de pagos — Culqi
 * Reemplaza la integración anterior de Mercado Pago.
 * Microservicio: https://api.paku.com.pe
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
  provider: string; // "culqi"
  payment_method_id: string; // crd_test_xxx — ID de tarjeta en Culqi
  brand: string; // "visa" | "master" | "amex" | ...
  last4: string; // últimos 4 dígitos
  exp_month: number; // 0 (Culqi no retorna fecha de vencimiento)
  exp_year: number; // 0
  is_default: boolean;
  culqi_customer_id?: string; // cus_test_xxx para One-click
  culqi_card_id?: string; // crd_test_xxx para One-click
}

// Alias para compatibilidad con componentes
export type SavedPaymentMethod = SavedCard;

/** Convierte SavedCard al formato normalizado que usa la UI */
export function toPaymentMethod(card: SavedCard): SavedPaymentMethod {
  return card;
}

// ─── Cliente Culqi (respuesta del backend) ────────────────────────────────────

export interface CulqiCustomer {
  id: string; // cus_test_xxx — guardar en BD para cobros futuros
  object: "customer";
  first_name: string;
  last_name: string;
  email: string;
}

// ─── Cargo (respuesta de POST /api/culqi/charges) ─────────────────────────────

export interface CulqiCharge {
  id: string; // chr_test_xxx
  object: "charge";
  amount: number;
  currency_code: string;
  email: string;
  source_id: string;
  outcome: { type: string; merchant_message: string };
  duplicated: boolean;
  culqi_tracking_id?: string;
}

// ─── Payloads hacia el backend ────────────────────────────────────────────────

export interface CreateCustomerPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  address_city: string;
  country_code: string;
}

export interface CreateChargePayload {
  amount: number; // En céntimos: 1000 = S/10.00
  currency_code: "PEN" | "USD";
  email: string;
  source_id: string; // tkn_... (nueva) | crd_... (guardada)
  description?: string;
  metadata?: Record<string, string>;
  antifraud_details?: AntifraudDetails;
}

export interface AntifraudDetails {
  first_name: string;
  last_name: string;
  address: string;
  address_city: string;
  country_code: string;
  phone_number: string;
}

// ─── Respuestas de pago ───────────────────────────────────────────────────────

export interface PaymentAttemptOut {
  order_id: string;
  status: PaymentStatus;
}

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export interface PaymentStatusOut {
  order_id: string;
  status: PaymentStatus;
}

// ─── Errores de negocio ────────────────────────────────────────────────────────

export type PaymentErrorCode =
  | "card_declined"
  | "insufficient_funds"
  | "expired_card"
  | "incorrect_cvv"
  | "processing_error"
  | "fraud_detected"
  | "network_error";
