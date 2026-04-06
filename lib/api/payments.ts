/**
 * Cliente API para el servicio de pagos (Mercado Pago)
 * Base URL independiente: https://stream.dev-qa.site/payment
 *
 * IMPORTANTE: este microservicio tiene su propio sistema de autenticación JWT,
 * independiente del backend principal de Paku. No usa el token de sesión del
 * usuario — usa un token de servicio configurado en NEXT_PUBLIC_PAYMENT_SERVICE_TOKEN.
 */
import type {
  SavedCard,
  PayPayload,
  PaymentAttemptOut,
  PaymentStatusOut,
} from "@/types/payments";

const PAYMENT_BASE =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL ??
  "https://stream.dev-qa.site/payment";

/**
 * Token del microservicio de pagos — JWT propio, independiente del token de sesión de Paku.
 * Configurar en .env.local como NEXT_PUBLIC_PAYMENT_SERVICE_TOKEN.
 * Fallback: token de QA (solo para desarrollo).
 */
const PAYMENT_SERVICE_TOKEN =
  process.env.NEXT_PUBLIC_PAYMENT_SERVICE_TOKEN ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiZW1haWwiOiJxYUBsb2NhbC50ZXN0In0._oJS2BJJknCrOBnD_DsBwMjEJCyatbLVOr_yYB3Dgdw";

// ── Helper interno ────────────────────────────────────────────────────────────

async function paymentFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${PAYMENT_SERVICE_TOKEN}`,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${PAYMENT_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body?.detail;
    let message = `Error ${res.status}`;
    if (detail) {
      if (typeof detail === "string") message = detail;
      else if (detail.message) message = detail.message;
      else if (detail.error?.message) message = detail.error.message;
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ── Servicio de pagos ─────────────────────────────────────────────────────────

export const paymentsService = {
  /**
   * GET /api/payment-methods
   * Lista las tarjetas guardadas del usuario autenticado.
   */
  listSavedCards(): Promise<SavedCard[]> {
    return paymentFetch<SavedCard[]>("/api/payment-methods");
  },

  /**
   * POST /api/payment-methods
   * Guarda una tarjeta nueva (card_token viene de MP).
   */
  saveCard(card_token: string): Promise<SavedCard> {
    return paymentFetch<SavedCard>("/api/payment-methods", {
      method: "POST",
      body: JSON.stringify({ card_token }),
    });
  },

  /**
   * POST /api/payments/pay
   * Crea un intento de pago (tarjeta nueva o guardada).
   */
  pay(payload: PayPayload): Promise<PaymentAttemptOut> {
    return paymentFetch<PaymentAttemptOut>("/api/payments/pay", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * GET /api/payments/{order_id}/status
   * Consulta el estado de una orden de pago.
   */
  getStatus(orderId: string): Promise<PaymentStatusOut> {
    return paymentFetch<PaymentStatusOut>(`/api/payments/${orderId}/status`);
  },
};
