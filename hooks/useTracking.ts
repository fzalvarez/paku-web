"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { trackingService } from "@/lib/api/tracking";
import type { TrackingCurrent, TrackingRoute } from "@/types/tracking";

const POLL_INTERVAL_MS = 5000;
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    fetchAll();
    intervalRef.current = setInterval(() => {
      fetchCurrent();
      fetchRoute();
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
