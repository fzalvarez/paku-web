/**
 * Servicio de tracking de órdenes activas.
 * Usa el token de sesión del usuario (mismo que el apiClient principal).
 */
import { getAccessToken } from "@/lib/session";
import type { TrackingCurrent, TrackingRoute } from "@/types/tracking";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://paku.dev-qa.site/paku/api/v1"
).replace(/\/$/, "");

async function trackingFetch<T>(path: string): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(`Tracking error: ${res.status}`), {
      status: res.status,
      data: err,
    });
  }

  return res.json();
}

export const trackingService = {
  /**
   * GET /tracking/orders/{order_id}/current
   * Última posición del ally. Disponible en on_the_way | in_service.
   */
  getCurrent(orderId: string): Promise<TrackingCurrent> {
    return trackingFetch<TrackingCurrent>(
      `/tracking/orders/${orderId}/current`
    );
  },

  /**
   * GET /tracking/orders/{order_id}/route
   * Ruta y ETA calculados por Google Routes. Puede devolver 501 si no está configurado.
   */
  async getRoute(orderId: string): Promise<TrackingRoute | null> {
    try {
      return await trackingFetch<TrackingRoute>(
        `/tracking/orders/${orderId}/route`
      );
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 501 || status === 502) return null; // degradar gracefully
      throw err;
    }
  },
};
