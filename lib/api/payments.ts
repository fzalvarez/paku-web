/**
 * Servicio de pagos — Culqi
 *
 * Las tarjetas se tokenizan directamente con Culqi usando la clave pública.
 * Las operaciones del wallet y de órdenes usan el cliente autenticado de Paku.
 */

import type {
  SavedCard,
  SaveCardIn,
  CardData,
  CulqiToken,
  CulqiTokenError,
} from "@/types/payments";
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

/** Traduce un error de pago a un mensaje apto para mostrar al usuario. */
export function getPaymentErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Ocurrió un error inesperado.";
}

const CULQI_TOKEN_URL = "https://secure.culqi.com/v2/tokens";
const CULQI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ?? "";

/**
 * Tokeniza los datos directamente con Culqi; PAN y CVV no llegan a Paku.
 * El token resultante expira en 5 minutos.
 */
export async function createCulqiToken(card: CardData): Promise<CulqiToken> {
  if (!CULQI_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_CULQI_PUBLIC_KEY no está configurada.");
  }

  const response = await fetch(CULQI_TOKEN_URL, {
    method: "POST",
    cache: "no-store",
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

export const paymentsService = {
  /** Tokeniza una tarjeta directamente con Culqi. */
  createToken: createCulqiToken,

  /**
   * POST /wallet/cards
   * Envía el token y su vencimiento; PAN y CVV permanecen fuera de Paku.
   */
  saveCard(token: CulqiToken): Promise<SavedCard> {
     const expirationMonthText = String(token.expiration_month ?? "");
     const expirationYearText = String(token.expiration_year ?? "");
     const expirationMonth = Number(expirationMonthText);
     const expirationYear = Number(expirationYearText);
     if (
       !/^\d{1,2}$/.test(expirationMonthText) ||
       !Number.isInteger(expirationMonth) ||
       expirationMonth < 1 ||
       expirationMonth > 12 ||
       !/^\d{4}$/.test(expirationYearText) ||
       !Number.isInteger(expirationYear) ||
       expirationYear < 1000 ||
      expirationYear > 9999
    ) {
      throw new Error("Culqi no devolvió un vencimiento válido para la tarjeta.");
    }

    const payload: SaveCardIn = {
      token_id: token.id,
      expiration_month: expirationMonth,
      expiration_year: expirationYear,
    };
    return apiClient.post<SavedCard>(ENDPOINTS.WALLET.CARDS, payload);
  },

  /** GET /wallet/cards — lista las tarjetas del usuario autenticado. */
  listSavedCards(): Promise<SavedCard[]> {
    return apiClient.get<SavedCard[]>(ENDPOINTS.WALLET.CARDS);
  },

  /** DELETE /wallet/cards/{id} — elimina una tarjeta del wallet. */
  async deleteCard(cardId: string): Promise<void> {
    await apiClient.delete<void>(ENDPOINTS.WALLET.CARD(cardId));
  },
};
