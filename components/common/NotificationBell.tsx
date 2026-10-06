"use client";

// Campana de notificaciones (spec: specs/features/0002-campana-notificaciones).
// Solo el contador se consulta periódicamente, cada 2 min y únicamente con la
// pestaña visible; la lista se pide al abrir la campana.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationsService, notificationTarget } from "@/lib/api/notifications";
import type { NotificationOut } from "@/types/notifications";

const POLL_MS = 2 * 60 * 1000;

const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

// "hace 5 minutos", "ayer"…
function timeAgo(iso: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return relative.format(seconds, "second");
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), "hour");
  return relative.format(Math.round(seconds / 86400), "day");
}

/** null = desconocido (no cargó o falló): no se muestra número. */
async function fetchUnread(): Promise<number | null> {
  try {
    return await notificationsService.unreadCount();
  } catch {
    return null; // silencioso: se reintenta en la siguiente vuelta
  }
}

export function NotificationBell() {
  const router = useRouter();
  const [unread, setUnread] = useState<number | null>(null);
  const [items, setItems] = useState<NotificationOut[]>([]);
  const [listState, setListState] = useState<"idle" | "loading" | "error">("idle");

  const refreshCount = useCallback(async () => {
    setUnread(await fetchUnread());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const visible = () => document.visibilityState === "visible";
    const tick = async () => {
      if (!visible()) return;
      const count = await fetchUnread();
      if (!cancelled) setUnread(count);
    };
    tick();
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  const loadList = async () => {
    setListState("loading");
    try {
      setItems(await notificationsService.list(20));
      setListState("idle");
    } catch {
      setListState("error");
    }
  };

  const open = (n: NotificationOut) => {
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnread((c) => (c ? c - 1 : c));
      notificationsService.markRead(n.id).catch(() => refreshCount());
    }
    const target = notificationTarget(n);
    if (target) router.push(target);
  };

  const readAll = async () => {
    const pending = items.filter((n) => !n.is_read);
    if (pending.length === 0) return;
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    try {
      await notificationsService.markAllRead(pending);
    } finally {
      refreshCount();
    }
  };

  const badge = unread && unread > 0 ? (unread > 9 ? "9+" : String(unread)) : null;

  return (
    <DropdownMenu onOpenChange={(isOpen) => isOpen && loadList()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={badge ? `Notificaciones: ${unread} sin leer` : "Notificaciones"}
          title="Notificaciones"
        >
          <Bell className="size-5" />
          {badge && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white">
              {badge}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(92vw,24rem)] p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Notificaciones</DropdownMenuLabel>
          {items.some((n) => !n.is_read) && (
            <button
              type="button"
              className="text-xs text-primary underline-offset-4 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                readAll();
              }}
            >
              Marcar todo como leído
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-96 overflow-y-auto py-1">
          {listState === "loading" && items.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground">Cargando…</p>
          )}
          {listState === "error" && (
            <p className="px-3 py-4 text-sm text-muted-foreground">No se pudieron cargar las notificaciones.</p>
          )}
          {listState === "idle" && items.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground">No tienes notificaciones.</p>
          )}
          {items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onSelect={() => open(n)}
              className={`mx-1 flex items-start gap-2 px-2 py-2 ${n.is_read ? "" : "bg-primary/5"}`}
            >
              <span
                className={`mt-1.5 size-2 shrink-0 rounded-full ${n.is_read ? "bg-transparent" : "bg-primary"}`}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className={`block text-sm ${n.is_read ? "" : "font-semibold"}`}>{n.title}</span>
                <span className="block whitespace-normal text-xs text-muted-foreground">{n.body}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
