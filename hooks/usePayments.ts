"use client";

import { useState, useEffect, useCallback } from "react";
import { paymentsService, getPaymentErrorMessage } from "@/lib/api/payments";
import { ordersService } from "@/lib/api/orders";
import type { SavedCard, CardData } from "@/types/payments";
import type { OrderOut } from "@/types/orders";

// Local storage key para Culqi customer ID
const CULQI_CUSTOMER_KEY = "paku_culqi_customer_id";

export function usePayments() {
  // ── Tarjetas guardadas ────────────────────────────────────────────────────
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState<string | null>(null);

  const loadSavedCards = useCallback(async () => {
    setCardsLoading(true);
    setCardsError(null);
    try {
      const data = await paymentsService.listSavedCards();
      const valid = Array.isArray(data) ? data.filter((c) => !!c.id) : [];
      setSavedCards(valid);
    } catch (err) {
      setCardsError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las tarjetas."
      );
    } finally {
      setCardsLoading(false);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    loadSavedCards();
  }, [loadSavedCards]);

  // ── Pago de una orden (POST /orders/{id}/pay) ─────────────────────────────
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  /**
   * Cobra una orden servidor a servidor con un source_id de Culqi (token
   * tkn_... de tarjeta nueva, o card id crd_... de tarjeta guardada).
   * Reemplaza el chargeNewCard/chargeSavedCard + confirmPayment de dos
   * pasos — ver doc_fase1_paku-web_migracion_pago.md. Devuelve la orden
   * completa: revisar `payment_status` ("paid" | "failed" | "verifying").
   */
  const payOrder = useCallback(
    async (orderId: string, sourceId: string): Promise<OrderOut> => {
      setPaying(true);
      setPayError(null);
      try {
        return await ordersService.pay(orderId, sourceId);
      } catch (err) {
        setPayError(getPaymentErrorMessage(err));
        throw err;
      } finally {
        setPaying(false);
      }
    },
    []
  );

  // ── Eliminar tarjeta ──────────────────────────────────────────────────────
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [deleteCardError, setDeleteCardError] = useState<string | null>(null);

  const deleteCard = useCallback(async (cardId: string): Promise<void> => {
    setDeletingCardId(cardId);
    setDeleteCardError(null);
    try {
      await paymentsService.deleteCard(cardId);
      setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch (err) {
      setDeleteCardError(
        err instanceof Error ? err.message : "No se pudo eliminar la tarjeta."
      );
      throw err;
    } finally {
      setDeletingCardId(null);
    }
  }, []);

  // ── Guardar tarjeta ───────────────────────────────────────────────────────
  const [savingCard, setSavingCard] = useState(false);
  const [saveCardError, setSaveCardError] = useState<string | null>(null);

  /**
   * Guardar una tarjeta nueva:
   * 1. Tokenizar con Culqi
   * 2. Crear o reutilizar Culqi Customer
   * 3. Guardar en Culqi
   * 4. Persistir en paku-backend
   */
  const saveCard = useCallback(
    async (params: {
      cardData: CardData;
      userEmail: string;
      userFirstName?: string;
      userLastName?: string;
      userPhone?: string;
    }): Promise<SavedCard> => {
      setSavingCard(true);
      setSaveCardError(null);

      try {
        // Paso 1: tokenizar con Culqi
        const token = await paymentsService.createToken(params.cardData);

        // Paso 2: obtener o crear Culqi customer ID
        let culqiCustomerId: string | null = null;

        // Buscar en localStorage primero
        if (typeof window !== "undefined") {
          culqiCustomerId = localStorage.getItem(CULQI_CUSTOMER_KEY);
        }

        // Si no existe, crear nuevo customer
        if (!culqiCustomerId) {
          const customer = await paymentsService.createCustomer({
            first_name: params.userFirstName || "Usuario",
            last_name: params.userLastName || "Paku",
            email: params.userEmail,
            phone_number: params.userPhone || "000000000",
            address: "Lima, Peru",
            address_city: "Lima",
            country_code: "PE",
          });

          culqiCustomerId = customer.id;

          // Guardar en localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(CULQI_CUSTOMER_KEY, culqiCustomerId);
          }
        }

        // Paso 3: guardar tarjeta
        const savedCard = await paymentsService.saveCard(
          culqiCustomerId,
          params.cardData
        );

        setSavedCards((prev) => [...prev, savedCard]);
        return savedCard;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "No se pudo guardar la tarjeta.";
        setSaveCardError(msg);
        throw err;
      } finally {
        setSavingCard(false);
      }
    },
    []
  );

  return {
    // Tarjetas
    savedCards,
    cardsLoading,
    cardsError,
    loadSavedCards,

    // Pago
    paying,
    payError,
    payOrder,

    // Eliminar tarjeta
    deletingCardId,
    deleteCardError,
    deleteCard,

    // Guardar tarjeta
    savingCard,
    saveCardError,
    saveCard,
  };
}
