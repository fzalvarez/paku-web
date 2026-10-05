/**
 * Tipos del módulo de chat entre cliente y groomer durante una orden activa.
 */

export interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_role: "user" | "groomer" | "admin";
  body: string;
  is_read: boolean;
  created_at: string; // ISO-8601
}

export interface ChatUnreadCount {
  unread_count: number;
}
