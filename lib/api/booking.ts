import type {
  AvailabilitySlot,
  GetAvailabilityParams,
  HoldOut,
  CreateHoldRequest,
} from "@/types/booking";
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) s.set(k, String(v));
  }
  const qs = s.toString();
  return qs ? `?${qs}` : "";
}

export const bookingService = {
  /**
   * GET /booking/availability
   * Retorna slots con disponibilidad.
   */
  getAvailability(params?: GetAvailabilityParams): Promise<AvailabilitySlot[]> {
    const q = buildQuery(params as Record<string, string | number | undefined>);
    return apiClient.get<AvailabilitySlot[]>(`${ENDPOINTS.BOOKING.AVAILABILITY}${q}`);
  },

  /**
   * POST /booking/holds
   * Crea un hold (reserva temporal).
   */
  createHold(data: CreateHoldRequest): Promise<HoldOut> {
    return apiClient.post<HoldOut>(ENDPOINTS.BOOKING.HOLDS, data);
  },

  /**
   * POST /booking/holds/{id}/confirm
   * Confirma un hold existente.
   */
  confirmHold(id: string): Promise<HoldOut> {
    return apiClient.post<HoldOut>(ENDPOINTS.BOOKING.HOLD_CONFIRM(id), {});
  },

  /**
   * POST /booking/holds/{id}/cancel
   * Cancela un hold existente.
   */
  cancelHold(id: string): Promise<HoldOut> {
    return apiClient.post<HoldOut>(ENDPOINTS.BOOKING.HOLD_CANCEL(id), {});
  },
};
