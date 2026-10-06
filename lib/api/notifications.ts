import type { NotificationOut, UnreadCountOut } from "@/types/notifications";
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

export const notificationsService = {
  /** GET /notifications/unread-count */
  async unreadCount(): Promise<number> {
    const data = await apiClient.get<UnreadCountOut>(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return data.unread_count ?? 0;
  },

  /** GET /notifications — más recientes primero */
  list(limit = 20): Promise<NotificationOut[]> {
    return apiClient.get<NotificationOut[]>(ENDPOINTS.NOTIFICATIONS.LIST, { params: { limit } });
  },

  /** POST /notifications/{id}/read */
  markRead(id: string): Promise<void> {
    return apiClient.post<void>(ENDPOINTS.NOTIFICATIONS.READ(id), {});
  },

  /** El backend no tiene "marcar todas": se marcan de a una las no leídas. */
  async markAllRead(items: NotificationOut[]): Promise<void> {
    await Promise.all(items.filter((n) => !n.is_read).map((n) => notificationsService.markRead(n.id)));
  },
};

/** A dónde lleva un aviso: al detalle del pedido si trae order_id. */
export function notificationTarget(n: NotificationOut): string | null {
  const orderId = n.data?.order_id;
  return typeof orderId === "string" && orderId ? `/mis-pedidos/${orderId}` : null;
}
