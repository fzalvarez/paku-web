"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { paymentsService } from "@/lib/api/payments";
import type { SavedCard, PaymentStatus, CardData } from "@/types/payments";

// Cuánto tiempo entre intentos de polling (ms)
const POLL_INTERVAL = 2500;
const POLL_MAX_ATTEMPTS = 20; // ~50 segundos máximo

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

  // ── Pago con tarjeta guardada o nueva ─────────────────────────────────────
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

  /**
   * Cobrar con tarjeta nueva (token de Culqi)
   */
  const chargeNewCard = useCallback(
    async (params: {
      amount: number;
      email: string;
      token: string;
      description?: string;
      currencyCode?: "PEN" | "USD";
    }): Promise<string> => {
      setPaying(true);
      setPayError(null);
      try {
        const charge = await paymentsService.charge({
          amount: params.amount,
          currency_code: params.currencyCode ?? "PEN",
          email: params.email,
          source_id: params.token,
          description: params.description,
        });

        // Retornar un ID de orden para polling
        // (El backend generará una orden con este cargo)
        setPaymentOrderId(charge.id);
        return charge.id;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error al procesar el pago.";
        setPayError(msg);
        throw err;
      } finally {
        setPaying(false);
      }
    },
    []
  );

  /**
   * Cobrar con tarjeta guardada (ya en Culqi)
   */
  const chargeSavedCard = useCallback(
    async (params: {
      amount: number;
      email: string;
      cardId: string;
      description?: string;
      currencyCode?: "PEN" | "USD";
    }): Promise<string> => {
      setPaying(true);
      setPayError(null);
      try {
        const charge = await paymentsService.charge({
          amount: params.amount,
          currency_code: params.currencyCode ?? "PEN",
          email: params.email,
          source_id: params.cardId, // crd_test_xxx
          description: params.description,
        });

        setPaymentOrderId(charge.id);
        return charge.id;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error al procesar el pago.";
        setPayError(msg);
        throw err;
      } finally {
        setPaying(false);
      }
    },
    []
  );

  // ── Polling de estado ─────────────────────────────────────────────────────
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null
  );
  const [polling, setPolling] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollAttemptsRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setPolling(false);
  }, []);

  const startPolling = useCallback(
    (orderId: string, onDone: (status: PaymentStatus) => void) => {
      stopPolling();
      pollAttemptsRef.current = 0;
      setPolling(true);
      setPollError(null);

      const TERMINAL: PaymentStatus[] = ["PAID", "FAILED", "CANCELLED"];

      pollRef.current = setInterval(async () => {
        pollAttemptsRef.current += 1;

        try {
          const { status } = await paymentsService.getPaymentStatus(orderId);
          setPaymentStatus(status);

          if (TERMINAL.includes(status)) {
            stopPolling();
            onDone(status);
          } else if (pollAttemptsRef.current >= POLL_MAX_ATTEMPTS) {
            stopPolling();
            setPollError(
              "El pago está tardando más de lo esperado. Consulta tu historial de pedidos."
            );
            onDone("PENDING");
          }
        } catch (err) {
          stopPolling();
          setPollError(
            err instanceof Error
              ? err.message
              : "Error consultando estado del pago."
          );
        }
      }, POLL_INTERVAL);
    },
    [stopPolling]
  );

  useEffect(() => () => stopPolling(), [stopPolling]);

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
    paymentOrderId,
    chargeNewCard,
    chargeSavedCard,

    // Polling
    paymentStatus,
    polling,
    pollError,
    startPolling,
    stopPolling,

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
