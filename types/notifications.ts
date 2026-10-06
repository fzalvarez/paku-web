/**
 * Avisos del usuario (GET /notifications). El backend los crea por cada novedad
 * del pedido: asignación, llegada, pasos, adicionales, demoras, salto, pago, chat.
 */
export interface NotificationOut {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  /** Casi siempre trae order_id; se usa para navegar al pedido */
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCountOut {
  unread_count: number;
}
