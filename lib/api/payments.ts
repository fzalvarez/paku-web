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

// ─── Constantes ───────────────────────────────────────────────────────────────

const CULQI_TOKEN_URL = "https://secure.culqi.com/v2/tokens";
const PAYMENT_BASE =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL ??
  "https://stream.dev-qa.site/payment";
const PAYMENT_API_KEY =
  process.env.NEXT_PUBLIC_PAYMENT_API_KEY ??
  "test_key_from_env";
const CULQI_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ??
  "";
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://paku.dev-qa.site/paku/api/v1";

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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(PAYMENT_API_KEY ? { "X-API-Key": PAYMENT_API_KEY } : {}),
    ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    ...(fetchOptions.headers as Record<string, string>),
  };

  const response = await fetch(`${PAYMENT_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  const rawText = await response.text();

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
    throw new Error(message);
  }

  return data as T;
}

// ─── Cliente HTTP para el backend principal de Paku (Bearer token) ────────────

async function pakuFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // En web, obtener token del localStorage
  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

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
    const brand = culqiCard.card_brand ?? "Unknown";
    const last4 = culqiCard.last_four ?? "";

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
   */
  async charge(payload: CreateChargePayload): Promise<CulqiCharge> {
    const idempotencyKey = generateIdempotencyKey();
    return paymentFetch<CulqiCharge>("/api/culqi/charges", {
      method: "POST",
      body: JSON.stringify(payload),
      idempotencyKey,
    });
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
