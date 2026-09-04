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
  CulqiCharge,
  CreateCustomerPayload,
  CreateChargePayload,
  PaymentAttemptOut,
  PaymentStatusOut,
} from "@/types/payments";
import { getAccessToken } from "@/lib/session";

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
const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://paku.dev-qa.site/paku/api/v1"
).replace(/\/$/, "");

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

  let data: any;
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
  options: RequestInit & { idempotencyKey?: string } = {}
): Promise<T> {
  const { idempotencyKey, ...fetchOptions } = options;

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
    ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    ...(fetchOptions.headers as Record<string, string>),
  };

  const response = await fetch(`${PAYMENT_BASE}${path}`, {
    ...fetchOptions,
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

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(
      `Respuesta no válida del servidor (${response.status}): ${rawText.slice(0, 200)}`
    );
  }

  if (!response.ok) {
    const detail = data?.detail;
    let message = `Error ${response.status}`;
    if (detail) {
      if (typeof detail === "string") message = detail;
      else if (detail.user_message) message = detail.user_message;
      else if (detail.merchant_message) message = detail.merchant_message;
      else if (detail.message) message = detail.message;
    }
    // PaymentApiError conserva el `detail` completo (incluye decline_code)
    // para poder mostrar mensajes más específicos — ver getPaymentErrorMessage.
    throw new PaymentApiError(message, response.status, detail);
  }

  return data as T;
}

// ─── Cliente HTTP para el backend principal de Paku (Bearer token) ────────────

async function pakuFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // La sesión se guarda en cookies (lib/session.ts), no en localStorage —
  // por eso el header Authorization nunca se mandaba y el backend
  // respondía 401 "Not authenticated".
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const rawText = await response.text();

  // 204 No Content (ej. DELETE /wallet/cards/{id}) — nada que parsear.
  if (!rawText) {
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return undefined as T;
  }

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(
      `Respuesta no válida del servidor (${response.status}): ${rawText.slice(0, 200)}`
    );
  }

  if (!response.ok) {
    const detail = data?.detail;
    let message = `Error ${response.status}`;
    if (detail) {
      if (typeof detail === "string") message = detail;
      else if (detail.message) message = detail.message;
    }
    throw new Error(message);
  }

  return data as T;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genera un UUID v4 simple para Idempotency-Key */
function generateIdempotencyKey(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
    const culqiCard = await paymentFetch<any>("/api/culqi/cards", {
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

    const savedCardResponse = await pakuFetch<SavedCard>("/wallet/cards", {
      method: "POST",
      body: JSON.stringify({
        provider: "culqi",
        payment_method_id: culqiCard.id,
        brand,
        last4,
        exp_month: 0, // Culqi no retorna vencimiento
        exp_year: 0,
        culqi_customer_id: culqiCustomerId,
        culqi_card_id: culqiCard.id,
      }),
    });

    return savedCardResponse;
  },

  /**
   * GET /wallet/cards
   * Lista las tarjetas guardadas del usuario autenticado.
   */
  async listSavedCards(): Promise<SavedCard[]> {
    return pakuFetch<SavedCard[]>("/wallet/cards");
  },

  /**
   * POST /api/culqi/charges
   * Cobra con tarjeta nueva (token) o guardada (card id).
   *
   * Nota 3D Secure: Culqi puede responder 200 con un objeto que NO es un
   * cargo (pide autenticación 3DS antes de cobrar). Hoy no soportamos ese
   * flujo (necesita una pantalla de autenticación aparte) — si pasa, se
   * lanza un error explícito en vez de tratarlo como pago exitoso.
   */
  async charge(payload: CreateChargePayload): Promise<CulqiCharge> {
    const idempotencyKey = generateIdempotencyKey();
    const charge = await paymentFetch<CulqiCharge>("/api/culqi/charges", {
      method: "POST",
      body: JSON.stringify(payload),
      idempotencyKey,
    });

    if (charge?.object !== "charge") {
      throw new PaymentApiError(
        "Esta tarjeta requiere una verificación adicional (3D Secure) que todavía no soportamos. Prueba con otra tarjeta.",
        200,
        { code: "requires_3ds_unsupported" }
      );
    }

    return charge;
  },

  /**
   * DELETE /wallet/cards/{id}
   * Elimina una tarjeta guardada del wallet del usuario.
   */
  async deleteCard(cardId: string): Promise<void> {
    await pakuFetch<void>(`/wallet/cards/${cardId}`, { method: "DELETE" });
  },

  /**
   * POST /api/payments/pay — legacy para compatibilidad con órdenes
   * Consulta el estado de una orden de pago.
   */
  async getPaymentStatus(orderId: string): Promise<PaymentStatusOut> {
    return paymentFetch<PaymentStatusOut>(`/api/payments/${orderId}/status`);
  },
};
