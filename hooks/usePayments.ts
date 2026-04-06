"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { paymentsService } from "@/lib/api/payments";
import type { SavedCard, PayPayload, PaymentStatus } from "@/types/payments";

// Cuánto tiempo entre intentos de polling (ms)
const POLL_INTERVAL = 2500;
const POLL_MAX_ATTEMPTS = 20; // ~50 segundos máximo

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
      // Filtramos tarjetas que no tengan id válido (datos incompletos del backend)
      const valid = Array.isArray(data) ? data.filter((c) => !!c.id) : [];
      setSavedCards(valid);
    } catch (err) {
      setCardsError(err instanceof Error ? err.message : "No se pudieron cargar las tarjetas.");
    } finally {
      setCardsLoading(false);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    loadSavedCards();
  }, [loadSavedCards]);

  // ── Pago ──────────────────────────────────────────────────────────────────
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

  const pay = useCallback(async (payload: PayPayload): Promise<string> => {
    setPaying(true);
    setPayError(null);
    try {
      const result = await paymentsService.pay(payload);
      setPaymentOrderId(result.order_id);
      return result.order_id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al procesar el pago.";
      setPayError(msg);
      throw err;
    } finally {
      setPaying(false);
    }
  }, []);

  // ── Polling de estado ─────────────────────────────────────────────────────
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
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
          const { status } = await paymentsService.getStatus(orderId);
          setPaymentStatus(status);

          if (TERMINAL.includes(status)) {
            stopPolling();
            onDone(status);
          } else if (pollAttemptsRef.current >= POLL_MAX_ATTEMPTS) {
            stopPolling();
            // Tiempo agotado: emitimos "PENDING" para que el caller pueda
            // distinguirlo de un FAILED/CANCELLED real y mostrar un mensaje apropiado
            setPollError("El pago está tardando más de lo esperado. Consulta tu historial de pedidos.");
            onDone("PENDING");
          }
        } catch (err) {
          stopPolling();
          setPollError(err instanceof Error ? err.message : "Error consultando estado del pago.");
        }
      }, POLL_INTERVAL);
    },
    [stopPolling]
  );

  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Guardar tarjeta ───────────────────────────────────────────────────────
  const [savingCard, setSavingCard] = useState(false);
  const [saveCardError, setSaveCardError] = useState<string | null>(null);

  const saveCard = useCallback(async (cardToken: string): Promise<SavedCard> => {
    setSavingCard(true);
    setSaveCardError(null);
    try {
      const card = await paymentsService.saveCard(cardToken);
      setSavedCards((prev) => [...prev, card]);
      return card;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo guardar la tarjeta.";
      setSaveCardError(msg);
      throw err;
    } finally {
      setSavingCard(false);
    }
  }, []);

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
    pay,
    // Polling
    paymentStatus,
    polling,
    pollError,
    startPolling,
    stopPolling,
    // Guardar tarjeta
    savingCard,
    saveCardError,
    saveCard,
  };
}
