"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { trackingService } from "@/lib/api/tracking";
import type { TrackingCurrent, TrackingRoute } from "@/types/tracking";

/** Posición del ally — bajo costo, actualizar frecuente */
const CURRENT_POLL_MS = 10_000;
/** Ruta + ETA — costo por llamada a Google Routes, actualizar menos frecuente */
const ROUTE_POLL_MS = 30_000;

const ACTIVE_STATUSES = ["on_the_way", "in_service"];

export interface UseTrackingReturn {
  current: TrackingCurrent | null;
  route: TrackingRoute | null;
  loading: boolean;
  error: string | null;
  isActive: boolean;
  isStale: boolean;
  isWaiting: boolean;
  etaDisplay: string | null;
}

export function useTracking(
  orderId: string | null,
  orderStatus: string
): UseTrackingReturn {
  const isActive = ACTIVE_STATUSES.includes(orderStatus);

  const [current, setCurrent] = useState<TrackingCurrent | null>(null);
  const [route, setRoute] = useState<TrackingRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);
  const currentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const routeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearIntervals = useCallback(() => {
    if (currentIntervalRef.current) {
      clearInterval(currentIntervalRef.current);
      currentIntervalRef.current = null;
    }
    if (routeIntervalRef.current) {
      clearInterval(routeIntervalRef.current);
      routeIntervalRef.current = null;
    }
  }, []);

  const resetTracking = useCallback(() => {
    setCurrent(null);
    setRoute(null);
    setError(null);
    setLoading(false);
  }, []);

  const fetchCurrent = useCallback(async () => {
    if (!orderId || cancelledRef.current) return;
    try {
      const data = await trackingService.getCurrent(orderId);
      if (cancelledRef.current) return;
      setCurrent(data);
      setError(null);

      if (!ACTIVE_STATUSES.includes(data.order_status)) {
        setCurrent(null);
        setRoute(null);
      }
    } catch (err) {
      if (cancelledRef.current) return;
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        setCurrent(null);
        setRoute(null);
        return;
      }
      setError("No se pudo obtener la ubicación del especialista.");
    }
  }, [orderId]);

  const fetchRoute = useCallback(async () => {
    if (!orderId || cancelledRef.current) return;
    try {
      const data = await trackingService.getRoute(orderId);
      if (cancelledRef.current || !data) return;
      setRoute(data);
    } catch {
      // Silencioso — mantener ruta/ETA previa
    }
  }, [orderId]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCurrent(), fetchRoute()]);
    if (!cancelledRef.current) {
      setLoading(false);
    }
  }, [fetchCurrent, fetchRoute]);

  useEffect(() => {
    clearIntervals();

    if (!isActive || !orderId) {
      cancelledRef.current = true;
      resetTracking();
      return;
    }

    cancelledRef.current = false;

    fetchAll();
    currentIntervalRef.current = setInterval(fetchCurrent, CURRENT_POLL_MS);
    routeIntervalRef.current = setInterval(fetchRoute, ROUTE_POLL_MS);

    return () => {
      cancelledRef.current = true;
      clearIntervals();
    };
  }, [orderId, isActive, clearIntervals, resetTracking, fetchAll, fetchCurrent, fetchRoute]);

  return {
    current: isActive ? current : null,
    route: isActive ? route : null,
    loading,
    error: isActive ? error : null,
    isActive,
    isStale: (current?.staleness_seconds ?? 0) > 30,
    isWaiting: isActive && !current?.ally_location,
    etaDisplay: route?.eta_display ?? null,
  };
}
