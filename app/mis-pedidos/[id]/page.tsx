"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ordersService } from "@/lib/api/orders";
import { Loader2, AlertCircle, MapPin, CalendarDays, Package, ArrowLeft, CheckCircle2, Clock, Truck, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { OrderOut, OrderStatus } from "@/types/orders";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  created: {
    label: "Pendiente de asignación",
    icon: <Clock className="size-5" />,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    description: "Tu pedido fue creado y está esperando que le asignemos un especialista.",
  },
  on_the_way: {
    label: "Especialista en camino",
    icon: <Truck className="size-5" />,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    description: "Tu especialista ya salió hacia tu domicilio.",
  },
  in_service: {
    label: "Servicio en curso",
    icon: <Scissors className="size-5" />,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    description: "El especialista llegó y el servicio está en curso.",
  },
  done: {
    label: "Servicio finalizado",
    icon: <CheckCircle2 className="size-5" />,
    color: "text-green-600 bg-green-50 border-green-200",
    description: "¡Servicio completado! Esperamos que tu mascota quede feliz.",
  },
  cancelled: {
    label: "Cancelado",
    icon: <AlertCircle className="size-5" />,
    color: "text-red-600 bg-red-50 border-red-200",
    description: "Este pedido fue cancelado.",
  },
};

const STATUS_FLOW: OrderStatus[] = ["created", "on_the_way", "in_service", "done"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatScheduledDate(iso: string, time?: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dateStr = new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return time ? `${dateStr} a las ${time}` : dateStr;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await ordersService.detail(id);
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled) setError("No se pudo cargar el pedido.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/mis-pedidos"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver a mis pedidos
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {order && !loading && (() => {
          const statusConfig = STATUS_CONFIG[order.status];
          const baseItem = order.items_snapshot.find((i) => i.kind === "service_base");
          const scheduledDate = baseItem?.meta?.scheduled_date;
          const scheduledTime = baseItem?.meta?.scheduled_time;
          const currentStatusIdx = STATUS_FLOW.indexOf(order.status);

          return (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-extrabold">Pedido #{order.id.slice(0, 8).toUpperCase()}</h1>
                  <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold", statusConfig.color)}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Creado el {formatDate(order.created_at)}</p>
              </div>

              {/* Progreso de estado */}
              {order.status !== "cancelled" && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Progreso</p>
                  <div className="flex items-center gap-0">
                    {STATUS_FLOW.map((status, idx) => {
                      const conf = STATUS_CONFIG[status];
                      const isPast = idx < currentStatusIdx;
                      const isActive = idx === currentStatusIdx;
                      return (
                        <div key={status} className="flex flex-1 items-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className={cn(
                              "flex size-8 items-center justify-center rounded-full border-2 text-xs",
                              isPast && "border-primary bg-primary text-primary-foreground",
                              isActive && "border-primary bg-primary/10 text-primary",
                              !isPast && !isActive && "border-border bg-muted text-muted-foreground"
                            )}>
                              {isPast ? <CheckCircle2 className="size-4" /> : conf.icon}
                            </div>
                            <span className={cn(
                              "hidden text-[10px] font-semibold sm:block text-center",
                              isActive ? "text-primary" : isPast ? "text-primary/70" : "text-muted-foreground"
                            )}>
                              {conf.label.split(" ")[0]}
                            </span>
                          </div>
                          {idx < STATUS_FLOW.length - 1 && (
                            <div className={cn(
                              "h-0.5 flex-1 mx-1",
                              idx < currentStatusIdx ? "bg-primary" : "bg-border"
                            )} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{statusConfig.description}</p>
                </div>
              )}

              {/* Fecha del servicio */}
              {scheduledDate && (
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                  <CalendarDays className="size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fecha del servicio</p>
                    <p className="text-sm font-semibold capitalize">{formatScheduledDate(scheduledDate, scheduledTime)}</p>
                  </div>
                </div>
              )}

              {/* Dirección */}
              {order.delivery_address_snapshot && (
                <div className="flex items-start gap-3 rounded-xl bg-muted/50 px-4 py-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dirección de servicio</p>
                    <p className="text-sm font-semibold">{order.delivery_address_snapshot.address_line}</p>
                    {order.delivery_address_snapshot.reference && (
                      <p className="text-xs text-muted-foreground">{order.delivery_address_snapshot.reference}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Package className="size-4 text-muted-foreground" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resumen del servicio</p>
                </div>
                <div className="divide-y divide-border">
                  {order.items_snapshot.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2">
                        {item.kind === "service_base" && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Principal</span>
                        )}
                        {item.kind === "service_addon" && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Adicional</span>
                        )}
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold">S/ {(item.qty * item.unit_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-extrabold text-primary">S/ {order.total_snapshot.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
  );
}
