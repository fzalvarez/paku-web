/**
 * Servicio de chat para órdenes activas.
 * Usa el mismo token de sesión que el apiClient principal.
 */
import { getAccessToken } from "@/lib/session";
import { ENDPOINTS } from "./endpoints";
import type { ChatMessage, ChatUnreadCount } from "@/types/chat";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://paku.dev-qa.site/paku/api/v1"
).replace(/\/$/, "");

async function chatFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(`Chat error: ${res.status}`), {
      status: res.status,
      data: err,
    });
  }

  return res.json();
}

export const chatService = {
  /**
   * GET /chat/orders/{order_id}/messages
   * Primera carga (sin cursor) o polling con cursor `since`.
   */
  getMessages(orderId: string, since?: string | null): Promise<ChatMessage[]> {
    const url = since
      ? `${ENDPOINTS.CHAT.MESSAGES(orderId)}?since=${encodeURIComponent(since)}`
      : ENDPOINTS.CHAT.MESSAGES(orderId);
    return chatFetch<ChatMessage[]>(url);
  },

  /**
   * POST /chat/orders/{order_id}/messages
   * Envía un nuevo mensaje.
   */
  sendMessage(orderId: string, body: string): Promise<ChatMessage> {
    return chatFetch<ChatMessage>(ENDPOINTS.CHAT.MESSAGES(orderId), {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  /**
   * GET /chat/orders/{order_id}/unread-count
   * Badge de mensajes no leídos.
   */
  unreadCount(orderId: string): Promise<ChatUnreadCount> {
    return chatFetch<ChatUnreadCount>(ENDPOINTS.CHAT.UNREAD_COUNT(orderId));
  },
};
