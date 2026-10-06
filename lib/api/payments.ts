/**
 * Servicio de pagos — Culqi
 * 
 * Arquitectura:
 *   1. createCulqiToken()  → llama directo a secure.culqi.com (con public key)
 *                            los datos de tarjeta NUNCA tocan el backend propio.
 *   2. paymentsService.*   → llama al microservicio propio (con X-API-Key)
 *                            solo recibe token_id / card_id, nunca datos raw.
 */

import type {
  SavedCard,
  CardData,
  CulqiToken,
  CulqiTokenError,
  CulqiCustomer,
  CreateCustomerPayload,
} from "@/types/payments";
import { getAccessToken } from "@/lib/session";
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

// ─── Error tipado del microservicio de pagos ─────────────────────────────────

/**
 * Error del microservicio de pagos — conserva el `detail` completo que
 * devuelve el backend (incluye `decline_code`, `culqi_tracking_id`, etc.)
 * para poder armar mensajes más específicos con getPaymentErrorMessage().
 */
export class PaymentApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly detail: any
  ) {
    super(message);
    this.name = "PaymentApiError";
  }
}

/** Mensajes amigables por decline_code — según la doc que pasó backend. */
const DECLINE_MESSAGES: Record<string, string> = {
  insufficient_funds: "Tu tarjeta no tiene fondos suficientes.",
  card_declined: "Tu tarjeta fue rechazada. Contacta a tu banco.",
  expired_card: "Tu tarjeta está vencida.",
  incorrect_cvv: "El código de seguridad (CVV) es incorrecto.",
  processing_error: "Error al procesar el pago. Intenta nuevamente.",
};

/** Traduce un error de pago a un mensaje apto para mostrar al usuario. */
export function getPaymentErrorMessage(err: unknown): string {
  if (err instanceof PaymentApiError) {
    const declineCode = err.detail?.decline_code;
    if (declineCode && DECLINE_MESSAGES[declineCode]) {
      return DECLINE_MESSAGES[declineCode];
    }
    return err.message || "No se pudo procesar el pago. Intenta nuevamente.";
  }
  if (err instanceof Error) return err.message;
  return "Ocurrió un error inesperado.";
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const CULQI_TOKEN_URL = "https://secure.culqi.com/v2/tokens";
// El microservicio de pagos se movió de stream.dev-qa.site a este host
// (confirmado con backend 31/ago) — soluciona el CORS que daba el anterior.
const PAYMENT_BASE =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL ??
  "https://api.paku.com.pe";
const PAYMENT_API_KEY =
  process.env.NEXT_PUBLIC_PAYMENT_API_KEY ??
  "test_key_from_env";
const CULQI_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ??
  "";

// ─── Tokenización directa con Culqi ──────────────────────────────────────────

/**
 * Tokeniza los datos de tarjeta enviándolos DIRECTAMENTE a Culqi.
 * El backend propio nunca recibe PAN ni CVV.
 * El token resultante expira en 5 minutos.
 */
export async function createCulqiToken(card: CardData): Promise<CulqiToken> {
  if (!CULQI_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_CULQI_PUBLIC_KEY no está configurada.");
  }

  const response = await fetch(CULQI_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CULQI_PUBLIC_KEY}`,
    },
    body: JSON.stringify({
      card_number: card.card_number.replace(/\s/g, ""),
      cvv: card.cvv,
      expiration_month: card.expiration_month,
      expiration_year: card.expiration_year,
      email: card.email,
    }),
  });

  const rawText = await response.text();

  let data: unknown;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Respuesta inválida de Culqi: ${rawText.slice(0, 200)}`);
  }

  if (!response.ok) {
    const culqiError = data as CulqiTokenError;
    throw new Error(culqiError.user_message || "Error al procesar la tarjeta.");
  }

  return data as CulqiToken;
}

// ─── Cliente HTTP para el microservicio de pagos ──────────────────────────────

async function paymentFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // El microservicio acepta la key de dos formas equivalentes (Authorization:
  // Bearer <key> o X-API-Key: <key>) y usa el Bearer del usuario cuando está
  // presente — confirmado con backend 01/sep. Mandamos el JWT del usuario en
  // vez de depender de una key de servicio suelta que ni siquiera se valida.
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : PAYMENT_API_KEY
        ? { "X-API-Key": PAYMENT_API_KEY }
        : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${PAYMENT_BASE}${path}`, {
    ...options,
    headers,
  });

  const rawText = await response.text();

  // 204 No Content (u otra respuesta sin cuerpo) — no hay nada que parsear,
  // y no es un error. Antes esto tronaba con "Respuesta no válida del
  // servidor" incluso cuando la operación (ej. borrar) sí había funcionado.
  if (!rawText) {
    if (!response.ok) {
      throw new PaymentApiError(`Error ${response.status}`, response.status, null);
    }
    return undefined as T;
  }

  let data: unknown;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(
      `Respuesta no válida del servidor (${response.status}): ${rawText.slice(0, 200)}`
    );
  }

  if (!response.ok) {
    const detail = (data as { detail?: unknown } | null)?.detail;
    let message = `Error ${response.status}`;
    if (typeof detail === "string") message = detail;
    else if (detail && typeof detail === "object") {
      const d = detail as { user_message?: string; merchant_message?: string; message?: string };
      message = d.user_message || d.merchant_message || d.message || message;
    }
    // PaymentApiError conserva el `detail` completo (incluye decline_code)
    // para poder mostrar mensajes más específicos — ver getPaymentErrorMessage.
    throw new PaymentApiError(message, response.status, detail);
  }

  return data as T;
}

/** Lo que se usa de la respuesta de culqi-python al guardar una tarjeta. */
interface CulqiCardResponse {
  id: string;
  source?: { iin?: { card_brand?: string }; last_four?: string };
}

// ─── Servicio de pagos ────────────────────────────────────────────────────────
export const paymentsService = {
  /**
   * Tokeniza una tarjeta directamente con Culqi.
   */
  createToken: createCulqiToken,

  /**
   * POST /api/culqi/customers
   * Crea un cliente en Culqi. Se hace una sola vez por usuario.
   */
  async createCustomer(
    payload: CreateCustomerPayload
  ): Promise<CulqiCustomer> {
    return paymentFetch<CulqiCustomer>("/api/culqi/customers", {
      method: "POST",
      body: JSON.stringify({ ...payload, country_code: "PE" }),
    });
  },

  /**
   * Flujo completo para guardar una tarjeta:
   * 1. Tokenizar con Culqi directamente
   * 2. POST /api/culqi/cards → guardar en Culqi
   * 3. POST /wallet/cards → persistir en paku-backend
   */
  async saveCard(
    culqiCustomerId: string,
    cardData: CardData
  ): Promise<SavedCard> {
    // Paso 1: tokenizar con Culqi directamente
    const token = await createCulqiToken(cardData);

    // Paso 2: guardar en Culqi via microservicio
    const culqiCard = await paymentFetch<CulqiCardResponse>("/api/culqi/cards", {
      method: "POST",
      body: JSON.stringify({
        customer_id: culqiCustomerId,
        token_id: token.id,
      }),
    });

    // Paso 3: persistir en paku-backend para mostrarlo en el wallet
    // Culqi nunca manda card_brand como campo raíz — va anidado bajo
    // `iin.card_brand` (en el token) o `source.iin.card_brand` (en la
    // respuesta de /api/culqi/cards). last_four sí es raíz en el token,
    // pero en la card va dentro de `source`.
    const brand =
      culqiCard?.source?.iin?.card_brand ?? token.iin?.card_brand ?? "Unknown";
    const last4 = culqiCard?.source?.last_four ?? token.last_four ?? "";

    const savedCardResponse = await apiClient.post<SavedCard>(ENDPOINTS.WALLET.CARDS, {
      provider: "culqi",
      payment_method_id: culqiCard.id,
      brand,
      last4,
      exp_month: 0, // Culqi no retorna vencimiento
      exp_year: 0,
      culqi_customer_id: culqiCustomerId,
      culqi_card_id: culqiCard.id,
    });

    return savedCardResponse;
  },

  /**
   * GET /wallet/cards
   * Lista las tarjetas guardadas del usuario autenticado.
   */
  async listSavedCards(): Promise<SavedCard[]> {
    return apiClient.get<SavedCard[]>(ENDPOINTS.WALLET.CARDS);
  },

  /**
   * DELETE /wallet/cards/{id}
   * Elimina una tarjeta guardada del wallet del usuario.
   */
  async deleteCard(cardId: string): Promise<void> {
    await apiClient.delete<void>(ENDPOINTS.WALLET.CARD(cardId));
  },

  // El cobro del checkout ya no pasa por este microservicio directo —
  // migró a POST /orders/{id}/pay (ver lib/api/orders.ts `pay()` y
  // doc_fase1_paku-web_migracion_pago.md). Este servicio ahora solo cubre
  // el wallet (tokenizar, guardar/listar/borrar tarjetas).
};
