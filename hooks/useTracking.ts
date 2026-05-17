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
  const currentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const routeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCurrent = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await trackingService.getCurrent(orderId);
      setCurrent(data);
      setError(null);
    } catch {
      setError("No se pudo obtener la ubicación del especialista.");
    }
  }, [orderId]);

  const fetchRoute = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await trackingService.getRoute(orderId);
      setRoute(data);
    } catch {
      // Silencioso — la ruta es opcional
    }
  }, [orderId]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCurrent(), fetchRoute()]);
    setLoading(false);
  }, [fetchCurrent, fetchRoute]);

  useEffect(() => {
    if (!isActive || !orderId) return;

    // Carga inicial — ambos en paralelo
    fetchAll();

    // /current cada 10s
    currentIntervalRef.current = setInterval(fetchCurrent, CURRENT_POLL_MS);
    // /route cada 30s
    routeIntervalRef.current = setInterval(fetchRoute, ROUTE_POLL_MS);

    return () => {
      if (currentIntervalRef.current) {
        clearInterval(currentIntervalRef.current);
        currentIntervalRef.current = null;
      }
      if (routeIntervalRef.current) {
        clearInterval(routeIntervalRef.current);
        routeIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, isActive]);

  return {
    current: isActive ? current : null,
    route: isActive ? route : null,
    loading,
    error: isActive ? error : null,
    isActive,
    isStale: (current?.staleness_seconds ?? 0) > 30,
    etaDisplay: route?.eta_display ?? null,
  };
}
