/**
 * Servicio de tracking de órdenes activas (on_the_way | in_service).
 */
import type { TrackingCurrent, TrackingRoute } from "@/types/tracking";
import { apiClient, ApiCallError } from "./client";
import { ENDPOINTS } from "./endpoints";

export const trackingService = {
  /**
   * GET /tracking/orders/{order_id}/current
   * Última posición del groomer y destino. 409 si la orden no está activa.
   */
  getCurrent(orderId: string): Promise<TrackingCurrent> {
    return apiClient.get<TrackingCurrent>(ENDPOINTS.TRACKING.CURRENT(orderId));
  },

  /**
   * GET /tracking/orders/{order_id}/route
   * Ruta y ETA calculados por Google Routes. Devuelve null si no está
   * disponible (409 orden inactiva, 501 sin API key, 502 error de Google).
   */
  async getRoute(orderId: string): Promise<TrackingRoute | null> {
    try {
      return await apiClient.get<TrackingRoute>(ENDPOINTS.TRACKING.ROUTE(orderId));
    } catch (err: unknown) {
      if (err instanceof ApiCallError && [409, 501, 502].includes(err.status)) return null;
      throw err;
    }
  },
};
