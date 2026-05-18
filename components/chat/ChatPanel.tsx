"use client";

/**
 * ChatPanel
 * Panel de mensajería entre el cliente y el ally para órdenes activas.
 * Disponible durante on_the_way e in_service.
 *
 * - Polling cada 3s mediante useChat
 * - Burbujas de mensaje estilo WhatsApp (usuario a la derecha, ally a la izquierda)
 * - Input de texto con envío por Enter o botón
 * - Scroll automático al último mensaje
 */

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import type { ChatMessage } from "@/types/chat";

// ── Helper ────────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Burbuja de mensaje ────────────────────────────────────────────────────────

interface BubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

function Bubble({ message, isMe }: BubbleProps) {
  return (
    <div className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
          isMe
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground border border-border"
        )}
      >
        {/* Etiqueta de remitente solo para ally */}
        {!isMe && (
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Especialista
          </p>
        )}
        <p className="leading-snug whitespace-pre-wrap wrap-break-word">{message.body}</p>
        <p
          className={cn(
            "mt-1 text-right text-[10px]",
            isMe ? "text-primary-foreground/60" : "text-muted-foreground"
          )}
        >
          {formatTime(message.created_at)}
          {isMe && (
            <span className="ml-1">{message.is_read ? "✓✓" : "✓"}</span>
          )}
        </p>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface ChatPanelProps {
  orderId: string;
  /** true cuando order_status === "on_the_way" | "in_service" */
  active: boolean;
}

export function ChatPanel({ orderId, active }: ChatPanelProps) {
  const { user } = useAuth();
  const { messages, loading, error, sending, sendMessage } = useChat(orderId, active);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll al último mensaje cuando llegan nuevos o se abre el panel
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Contar mensajes no leídos del ally (para el badge)
  const unreadCount = messages.filter(
    (m) => m.sender_role !== "user" && !m.is_read
  ).length;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    await sendMessage(text);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!active) return null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* ── Cabecera — siempre visible, toggle del panel ── */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="size-4 text-primary" />
          <span className="text-sm font-bold">Chat con el especialista</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Badge de mensajes no leídos */}
          {!isOpen && unreadCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {isOpen ? "Cerrar ▲" : "Abrir ▼"}
          </span>
        </div>
      </button>

      {/* ── Cuerpo — solo visible cuando isOpen ── */}
      {isOpen && (
        <div className="flex flex-col">
          {/* Lista de mensajes */}
          <div className="flex h-64 flex-col gap-2 overflow-y-auto p-4 scroll-smooth">
            {loading && (
              <div className="flex flex-1 items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Cargando mensajes…
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
                <MessageCircle className="size-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">
                  Aún no hay mensajes. ¡Escríbele a tu especialista!
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <Bubble
                key={msg.id}
                message={msg}
                isMe={msg.sender_id === user?.id}
              />
            ))}

            {/* Ancla para scroll automático */}
            <div ref={bottomRef} />
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
              <AlertCircle className="size-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Input de texto */}
          <div className="flex items-end gap-2 border-t border-border bg-background px-3 py-2.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje… (Enter para enviar)"
              maxLength={2000}
              rows={1}
              className={cn(
                "flex-1 resize-none rounded-xl border border-input bg-muted/50 px-3 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                "max-h-28 leading-snug placeholder:text-muted-foreground"
              )}
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors",
                "hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              )}
              aria-label="Enviar mensaje"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
