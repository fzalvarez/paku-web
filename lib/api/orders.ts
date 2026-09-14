import type { OrderOut, CreateOrderIn } from "@/types/orders";
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

export const ordersService = {
  /**
   * GET /orders
   * Lista todas las órdenes del usuario autenticado.
   */
  list(): Promise<OrderOut[]> {
    return apiClient.get<OrderOut[]>(ENDPOINTS.ORDERS.LIST);
  },

  /**
   * GET /orders/{id}
   * Detalle de una orden específica.
   */
  detail(id: string): Promise<OrderOut> {
    return apiClient.get<OrderOut>(ENDPOINTS.ORDERS.DETAIL(id));
  },

  /**
   * POST /orders
   * Crea la orden con el carrito checked_out y la dirección.
   * Si se omite address_id, usa la dirección default del usuario.
   */
  create(data: CreateOrderIn): Promise<OrderOut> {
    return apiClient.post<OrderOut>(ENDPOINTS.ORDERS.CREATE, data);
  },

  /**
   * POST /orders/{id}/pay
   * Cobra la orden servidor a servidor con un source_id de Culqi (token
   * tkn_... de tarjeta nueva, o card id crd_... de tarjeta guardada) y la
   * confirma en la misma operación — reemplaza el flujo anterior de
   * paymentsService.charge() + confirmPayment() en dos pasos, que dejaba la
   * orden en pending para siempre si la conexión se cortaba entre medio.
   *
   * `payment_status` en la respuesta puede venir "paid", "failed" o
   * "verifying" (microcorte al confirmar con el banco — no es un error, hay
   * que reconsultar GET /orders/{id} más tarde). Ver
   * doc_fase1_paku-web_migracion_pago.md.
   */
  pay(orderId: string, sourceId: string): Promise<OrderOut> {
    return apiClient.post<OrderOut>(ENDPOINTS.ORDERS.PAY(orderId), {
      source_id: sourceId,
    });
  },

  // ── Fallback manual (soporte) — el flujo normal ya no los llama ──────────

  /**
   * POST /orders/{id}/confirm-payment
   * Registra el charge_id de Culqi como pago exitoso de la orden.
   */
  confirmPayment(orderId: string, culqiChargeId: string): Promise<OrderOut> {
    return apiClient.post<OrderOut>(ENDPOINTS.ORDERS.CONFIRM_PAYMENT(orderId), {
      culqi_charge_id: culqiChargeId,
    });
  },

  /**
   * POST /orders/{id}/fail-payment
   * Marca la orden con payment_status=failed.
   */
  failPayment(orderId: string): Promise<OrderOut> {
    return apiClient.post<OrderOut>(ENDPOINTS.ORDERS.FAIL_PAYMENT(orderId), {});
  },

  /**
   * POST /orders/{id}/retry-payment
   * Vuelve la orden a payment_status=pending antes de reintentar el cobro.
   */
  retryPayment(orderId: string): Promise<OrderOut> {
    return apiClient.post<OrderOut>(ENDPOINTS.ORDERS.RETRY_PAYMENT(orderId), {});
  },
};
