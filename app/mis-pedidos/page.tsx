"use client";

import { useOrders } from "@/hooks/useOrders";
import { useAuthContext } from "@/contexts/AuthContext";
import { Loader2, Package, CalendarDays, MapPin, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  created: { label: "Pendiente de asignación", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  on_the_way: { label: "Especialista en camino", color: "bg-blue-100 text-blue-700 border-blue-200" },
  in_service: { label: "Servicio en curso", color: "bg-purple-100 text-purple-700 border-purple-200" },
  done: { label: "Finalizado", color: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700 border-red-200" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatScheduledDate(iso: string, time?: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dateStr = new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  });
  return time ? `${dateStr} a las ${time}` : dateStr;
}

export default function MisPedidosPage() {
  const { isAuthenticated } = useAuthContext();
  const { orders, loading, error, refetch } = useOrders();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold">Mis pedidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial y estado de todos tus servicios.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="font-semibold">Inicia sesión para ver tus pedidos</p>
          </div>
        )}

        {isAuthenticated && loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {isAuthenticated && error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
            <button onClick={refetch} className="ml-2 underline">Reintentar</button>
          </div>
        )}

        {isAuthenticated && !loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
            <Package className="mx-auto mb-4 size-12 text-muted-foreground/50" />
            <p className="font-semibold text-muted-foreground">No tienes pedidos aún</p>
            <p className="mt-1 text-sm text-muted-foreground">¿Listo para tu primer servicio?</p>
            <Link
              href="/booking"
              className="mt-4 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              Reservar ahora
            </Link>
          </div>
        )}

        {isAuthenticated && !loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-muted text-muted-foreground" };
              const baseItem = order.items_snapshot.find((i) => i.kind === "service_base");
              const scheduledDate = baseItem?.meta?.scheduled_date;
              const scheduledTime = baseItem?.meta?.scheduled_time;

              return (
                <Link
                  key={order.id}
                  href={`/mis-pedidos/${order.id}`}
                  className="block rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Estado */}
                      <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold", status.color)}>
                        {status.label}
                      </span>

                      {/* Servicio principal */}
                      {baseItem && (
                        <h3 className="mt-2 font-bold">{baseItem.name}</h3>
                      )}

                      {/* Fecha del servicio */}
                      {scheduledDate && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="size-3.5 shrink-0" />
                          <span className="capitalize">{formatScheduledDate(scheduledDate, scheduledTime)}</span>
                        </div>
                      )}

                      {/* Dirección */}
                      {order.delivery_address_snapshot && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">{order.delivery_address_snapshot.address_line}</span>
                        </div>
                      )}

                      {/* Fecha de creación */}
                      <p className="mt-2 text-xs text-muted-foreground/70">
                        Creado el {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-lg font-extrabold text-primary">
                        S/ {order.total_snapshot.toFixed(2)}
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
  );
}
