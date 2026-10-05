"use client";

import { useState, useEffect } from "react";
import { trackingService } from "@/lib/api/tracking";
import type { TrackingCurrent, TrackingRoute } from "@/types/tracking";

/** Posición del groomer — bajo costo, actualizar frecuente */
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
  // Orden cuya primera carga ya terminó; "cargando" se deriva de esto para no
  // llamar a setState de forma síncrona dentro del efecto.
  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sin orden activa no se consulta; el estado anterior queda oculto porque
    // el return de abajo lo filtra con isActive.
    if (!isActive || !orderId) return;

    let cancelled = false;

    const fetchCurrent = async () => {
      try {
        const data = await trackingService.getCurrent(orderId);
        if (cancelled) return;
        setError(null);
        setCurrent(ACTIVE_STATUSES.includes(data.order_status) ? data : null);
        if (!ACTIVE_STATUSES.includes(data.order_status)) setRoute(null);
      } catch (err) {
        if (cancelled) return;
        const status = (err as { status?: number })?.status;
        if (status === 409) {
          setCurrent(null);
          setRoute(null);
          return;
        }
        setError("No se pudo obtener la ubicación del especialista.");
      }
    };

    const fetchRoute = async () => {
      try {
        const data = await trackingService.getRoute(orderId);
        if (!cancelled && data) setRoute(data);
      } catch {
        // Silencioso — mantener ruta/ETA previa
      }
    };

    const fetchInitial = async () => {
      await Promise.all([fetchCurrent(), fetchRoute()]);
      if (!cancelled) setLoadedOrderId(orderId);
    };

    fetchInitial();
    const currentInterval = setInterval(fetchCurrent, CURRENT_POLL_MS);
    const routeInterval = setInterval(fetchRoute, ROUTE_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(currentInterval);
      clearInterval(routeInterval);
    };
  }, [orderId, isActive]);

  return {
    current: isActive ? current : null,
    route: isActive ? route : null,
    loading: isActive && loadedOrderId !== orderId,
    error: isActive ? error : null,
    isActive,
    isStale: isActive && (current?.staleness_seconds ?? 0) > 30,
    isWaiting: isActive && !current?.groomer_location,
    etaDisplay: isActive ? route?.eta_display ?? null : null,
  };
}
