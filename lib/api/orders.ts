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
