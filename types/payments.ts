/**
 * Tipos del dominio de pagos — Mercado Pago via payment service
 * Base URL: https://stream.dev-qa.site/payment
 */

// ── Métodos de pago guardados ─────────────────────────────────────────────────

export interface SavedCard {
  id: string;          // UUID interno del backend
  brand: string;       // "visa" | "master" | "amex" | ...
  last4: string;       // últimos 4 dígitos
  exp_month: number;
  exp_year: number;
}

// ── Payloads de pago ──────────────────────────────────────────────────────────

export interface PayWithNewCardPayload {
  cart_id: string;
  amount: number;           // en céntimos (ej. 6500 = S/ 65.00)
  currency: string;         // "PEN"
  card_token: string;       // token temporal de MP
  payment_method_id: string; // "visa" | "master" | ...
  installments: number;
  save_card?: boolean;
}

export interface PayWithSavedCardPayload {
  cart_id: string;
  amount: number;
  currency: string;
  saved_payment_method_id: string;
  card_token: string;       // MP sigue exigiendo token aunque sea tarjeta guardada
  installments: number;
}

export type PayPayload = PayWithNewCardPayload | PayWithSavedCardPayload;

// ── Respuestas ────────────────────────────────────────────────────────────────

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

// ── Errores de negocio de MP ──────────────────────────────────────────────────

export type PaymentErrorCode =
  | "invalid_card_token"
  | "card_declined"
  | "insufficient_funds"
  | "invalid_installments"
  | "fraud_detected"
  | "payment_method_not_allowed"
  | "payment_provider_error"
  | "network_error";
