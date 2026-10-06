/**
 * Servicio de chat para órdenes activas.
 */
import type { ChatMessage, ChatUnreadCount } from "@/types/chat";
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

export const chatService = {
  /**
   * GET /chat/orders/{order_id}/messages
   * Primera carga (sin cursor) o polling con cursor `since`.
   * También marca como leídos los mensajes del otro participante.
   */
  getMessages(orderId: string, since?: string | null): Promise<ChatMessage[]> {
    return apiClient.get<ChatMessage[]>(ENDPOINTS.CHAT.MESSAGES(orderId), {
      params: since ? { since } : undefined,
    });
  },

  /**
   * POST /chat/orders/{order_id}/messages
   * Envía un nuevo mensaje.
   */
  sendMessage(orderId: string, body: string): Promise<ChatMessage> {
    return apiClient.post<ChatMessage>(ENDPOINTS.CHAT.MESSAGES(orderId), { body });
  },

  /**
   * GET /chat/orders/{order_id}/unread-count
   * Badge de mensajes no leídos.
   */
  unreadCount(orderId: string): Promise<ChatUnreadCount> {
    return apiClient.get<ChatUnreadCount>(ENDPOINTS.CHAT.UNREAD_COUNT(orderId));
  },
};
