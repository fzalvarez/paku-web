/**
 * Cliente API para el servicio de pagos (Mercado Pago)
 * Base URL independiente: https://stream.dev-qa.site/payment
 */
import type {
  SavedCard,
  PayPayload,
  PaymentAttemptOut,
  PaymentStatusOut,
} from "@/types/payments";
import { getAccessToken } from "@/lib/session";

const PAYMENT_BASE =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL ??
  "https://stream.dev-qa.site/payment";

// ── Helper interno ────────────────────────────────────────────────────────────

async function paymentFetch<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${PAYMENT_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // Intentar extraer mensaje del backend
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
   * Consulta el estado de una orden de pago (no requiere auth).
   */
  getStatus(orderId: string): Promise<PaymentStatusOut> {
    return paymentFetch<PaymentStatusOut>(
      `/api/payments/${orderId}/status`,
      {},
      false // no requiere Bearer
    );
  },
};
