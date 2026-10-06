import type {
  AvailabilitySlot,
  GetAvailabilityParams,
  HoldOut,
  CreateHoldRequest,
} from "@/types/booking";
import { apiClient, ApiCallError } from "./client";
import { ENDPOINTS } from "./endpoints";

export const bookingService = {
  /**
   * GET /availability
   * Días con cupo de un servicio. Sin date_from empieza hoy (hora de Lima).
   */
  getAvailability(params?: GetAvailabilityParams): Promise<AvailabilitySlot[]> {
    return apiClient.get<AvailabilitySlot[]>(ENDPOINTS.BOOKING.AVAILABILITY, {
      params: params as Record<string, string | number | undefined>,
    });
  },

  /**
   * POST /holds
   * Reserva el cupo del día antes de armar el carrito (C-15). Dura 2 h; al
   * entrar al carrito vence junto con él y al crear la orden se confirma.
   */
  createHold(data: CreateHoldRequest): Promise<HoldOut> {
    return apiClient.post<HoldOut>(ENDPOINTS.BOOKING.HOLDS, data);
  },

  /** GET /holds — reservas del usuario, más recientes primero. */
  listHolds(): Promise<HoldOut[]> {
    return apiClient.get<HoldOut[]>(ENDPOINTS.BOOKING.HOLDS);
  },

  /** POST /holds/{id}/cancel — libera el cupo. Idempotente. */
  cancelHold(id: string): Promise<HoldOut> {
    return apiClient.post<HoldOut>(ENDPOINTS.BOOKING.HOLD_CANCEL(id), {});
  },

  /**
   * Reserva el día para la mascota y el servicio. Si la mascota ya tiene una
   * reserva vigente ese día (409 HOLD_ALREADY_EXISTS, p. ej. el cliente volvió
   * al asistente), la reusa cuando es del mismo servicio; si es de otro
   * servicio, la libera y reserva de nuevo.
   */
  async reserve(data: CreateHoldRequest): Promise<HoldOut> {
    try {
      return await bookingService.createHold(data);
    } catch (err) {
      if (!(err instanceof ApiCallError) || err.code !== "HOLD_ALREADY_EXISTS") throw err;
      const existingId = (err.detail as { hold_id?: string } | undefined)?.hold_id;
      const existing = existingId
        ? (await bookingService.listHolds()).find((h) => h.id === existingId)
        : undefined;
      if (existing && existing.status === "held" && existing.service_id === data.service_id) {
        return existing;
      }
      if (!existingId) throw err;
      await bookingService.cancelHold(existingId);
      return bookingService.createHold(data);
    }
  },
};
