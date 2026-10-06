"use client";

import { useOrders } from "@/hooks/useOrders";
import { useAuthContext } from "@/contexts/AuthContext";
import { Loader2, Package, CalendarDays, MapPin, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { orderStatusInfo, paymentStatusInfo } from "@/lib/labels";
import { orderScheduleText } from "@/lib/utils/dates";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
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
              const status = orderStatusInfo(order.status);
              const payment = paymentStatusInfo(order.payment_status);
              const baseItem = order.items_snapshot.find((i) => i.kind === "service_base");
              const schedule = orderScheduleText(order.scheduled_at, order.reserved_date ?? baseItem?.meta?.scheduled_date);

              return (
                <Link
                  key={order.id}
                  href={`/mis-pedidos/${order.id}`}
                  className="block rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Estado */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold", status.bgColor, status.color)}>
                          {status.label}
                        </span>
                        {order.payment_status && (
                          <span
                            className={cn(
                              "inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                              payment.bgColor, payment.color
                            )}
                          >
                            {payment.label}
                          </span>
                        )}
                        {order.parent_order_id && (
                          <span className="inline-block rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                            Cargo adicional
                          </span>
                        )}
                      </div>

                      {/* Servicio principal */}
                      {baseItem && (
                        <h3 className="mt-2 font-bold">{baseItem.name}</h3>
                      )}

                      {/* Fecha del servicio */}
                      {schedule && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="size-3.5 shrink-0" />
                          <span className="first-letter:uppercase">{schedule}</span>
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
