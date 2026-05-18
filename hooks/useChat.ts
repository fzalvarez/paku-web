"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chatService } from "@/lib/api/chat";
import type { ChatMessage } from "@/types/chat";

/** Polling cada 3s — tal como recomienda la documentación del backend */
const POLL_INTERVAL_MS = 3_000;

export interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  sendMessage: (body: string) => Promise<void>;
}

/**
 * Hook de chat para una orden activa.
 * - Carga inicial sin cursor.
 * - Polling cada 3s usando el cursor `since` (solo trae mensajes nuevos).
 * - El backend marca los mensajes del ally como leídos automáticamente al hacer GET.
 *
 * @param orderId  ID de la orden
 * @param active   true cuando el estado de la orden es on_the_way | in_service
 */
export function useChat(orderId: string, active: boolean): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Cursor: created_at del último mensaje recibido
  const cursorRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active || !orderId) return;

    let cancelled = false;

    // ── Carga inicial ──────────────────────────────────────────────────────
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const data = await chatService.getMessages(orderId);
        if (!cancelled) {
          setMessages(data);
          if (data.length > 0) {
            cursorRef.current = data[data.length - 1].created_at;
          }
        }
      } catch {
        if (!cancelled) setError("No se pudieron cargar los mensajes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInitial();

    // ── Polling con cursor ─────────────────────────────────────────────────
    intervalRef.current = setInterval(async () => {
      if (cancelled) return;
      try {
        const data = await chatService.getMessages(orderId, cursorRef.current);
        if (!cancelled && data.length > 0) {
          setMessages((prev) => [...prev, ...data]);
          cursorRef.current = data[data.length - 1].created_at;
        }
      } catch {
        // best-effort — el polling no debe interrumpir la UI
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [orderId, active]);

  // ── Enviar mensaje ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (body: string) => {
      if (!body.trim()) return;
      setSending(true);
      try {
        const newMsg = await chatService.sendMessage(orderId, body.trim());
        // Agregar al estado y actualizar cursor
        setMessages((prev) => [...prev, newMsg]);
        cursorRef.current = newMsg.created_at;
      } catch {
        setError("No se pudo enviar el mensaje. Intenta de nuevo.");
      } finally {
        setSending(false);
      }
    },
    [orderId]
  );

  return { messages, loading, error, sending, sendMessage };
}
