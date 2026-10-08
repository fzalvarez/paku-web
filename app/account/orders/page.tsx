"use client";

import { useOrders } from "@/hooks/useOrders";
import { Loader2, Package, CalendarDays, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { EmptyState } from "@/components/account/EmptyState";
import { InlineAlert } from "@/components/account/InlineAlert";
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
  const { orders, loading, error, refetch } = useOrders();

  return (
    <div className="flex flex-col gap-6">
        <AccountPageHeader
          title="Mis pedidos"
          description="Historial y estado de todos tus servicios."
        />

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && <InlineAlert onRetry={refetch}>{error}</InlineAlert>}

        {!loading && !error && orders.length === 0 && (
          <EmptyState
            icon={Package}
            title="No tienes pedidos aún"
            description="¿Listo para tu primer servicio?"
            action={
              <Button asChild>
                <Link href="/booking">Reservar ahora</Link>
              </Button>
            }
          />
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = orderStatusInfo(order.status);
              const payment = paymentStatusInfo(order.payment_status);
              const baseItem = order.items_snapshot.find((i) => i.kind === "service_base");
              const schedule = orderScheduleText(order.scheduled_at, order.reserved_date ?? baseItem?.meta?.scheduled_date);

              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Estado */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge size="md" className={cn(status.bgColor, status.color)}>
                          {status.label}
                        </Badge>
                        {order.payment_status && (
                          <Badge size="md" className={cn(payment.bgColor, payment.color)}>
                            {payment.label}
                          </Badge>
                        )}
                        {order.parent_order_id && (
                          <Badge size="md" variant="outline">Cargo adicional</Badge>
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
