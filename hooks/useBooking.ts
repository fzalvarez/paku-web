"use client";

import { useState, useCallback } from "react";
import { bookingService } from "@/lib/api/booking";
import type { AvailabilitySlot, GetAvailabilityParams } from "@/types/booking";

interface UseBookingReturn {
  slots: AvailabilitySlot[];
  slotsLoading: boolean;
  slotsError: string | null;
  slotsFetched: boolean;
  fetchAvailability: (params?: GetAvailabilityParams) => Promise<void>;
  getSlotForDate: (date: string) => AvailabilitySlot | undefined;
}

/**
 * Disponibilidad de cupos por día (GET /availability). La reserva del cupo
 * (POST /holds) la maneja el asistente de reserva: ver bookingService.reserve
 * y StepSelectDate.
 */
export function useBooking(): UseBookingReturn {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotsFetched, setSlotsFetched] = useState(false);

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
      setSlotsFetched(true);
    }
  }, []);

  const getSlotForDate = useCallback(
    (date: string) => slots.find((s) => s.date === date),
    [slots]
  );

  return { slots, slotsLoading, slotsError, slotsFetched, fetchAvailability, getSlotForDate };
}
