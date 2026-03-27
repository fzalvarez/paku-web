"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { bookingService } from "@/lib/api/booking";
import type { AvailabilitySlot, HoldOut, CreateHoldRequest, GetAvailabilityParams } from "@/types/booking";

interface UseBookingReturn {
  slots: AvailabilitySlot[];
  slotsLoading: boolean;
  slotsError: string | null;
  fetchAvailability: (params?: GetAvailabilityParams) => Promise<void>;
  getSlotForDate: (date: string) => AvailabilitySlot | undefined;

  activeHold: HoldOut | null;
  holdLoading: boolean;
  holdError: string | null;
  secondsLeft: number;
  createHold: (data: CreateHoldRequest) => Promise<HoldOut>;
  confirmHold: () => Promise<HoldOut>;
  cancelHold: () => Promise<void>;
  clearHoldError: () => void;
}

export function useBooking(): UseBookingReturn {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [activeHold, setActiveHold] = useState<HoldOut | null>(null);
  const [holdLoading, setHoldLoading] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Countdown timer ───────────────────────────────────────────────────────

  function startCountdown(expiresAt: string) {
    if (countdownRef.current) clearInterval(countdownRef.current);

    function tick() {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff <= 0 && countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    }

    tick();
    countdownRef.current = setInterval(tick, 1000);
  }

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  // ── Disponibilidad ────────────────────────────────────────────────────────

  const fetchAvailability = useCallback(async (params?: GetAvailabilityParams) => {
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const data = await bookingService.getAvailability(params);
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      setSlotsError(err instanceof Error ? err.message : "No se pudo cargar la disponibilidad");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const getSlotForDate = useCallback(
    (date: string) => slots.find((s) => s.date === date),
    [slots]
  );

  // ── Hold ──────────────────────────────────────────────────────────────────

  const createHold = useCallback(async (data: CreateHoldRequest): Promise<HoldOut> => {
    setHoldLoading(true);
    setHoldError(null);
    try {
      const hold = await bookingService.createHold(data);
      setActiveHold(hold);
      startCountdown(hold.expires_at);
      return hold;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo crear la reserva temporal";
      setHoldError(msg);
      throw err;
    } finally {
      setHoldLoading(false);
    }
  }, []);

  const confirmHold = useCallback(async (): Promise<HoldOut> => {
    if (!activeHold) throw new Error("No hay reserva activa");
    setHoldLoading(true);
    setHoldError(null);
    try {
      const hold = await bookingService.confirmHold(activeHold.id);
      setActiveHold(hold);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return hold;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al confirmar la reserva";
      setHoldError(msg);
      throw err;
    } finally {
      setHoldLoading(false);
    }
  }, [activeHold]);

  const cancelHold = useCallback(async (): Promise<void> => {
    if (!activeHold) return;
    setHoldLoading(true);
    setHoldError(null);
    try {
      await bookingService.cancelHold(activeHold.id);
      setActiveHold(null);
      setSecondsLeft(0);
      if (countdownRef.current) clearInterval(countdownRef.current);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cancelar la reserva";
      setHoldError(msg);
      throw err;
    } finally {
      setHoldLoading(false);
    }
  }, [activeHold]);

  const clearHoldError = useCallback(() => setHoldError(null), []);

  return {
    slots, slotsLoading, slotsError, fetchAvailability, getSlotForDate,
    activeHold, holdLoading, holdError, secondsLeft,
    createHold, confirmHold, cancelHold, clearHoldError,
  };
}
