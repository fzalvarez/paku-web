"use client";

import { CheckCircle2, MapPin, CalendarDays, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { OrderOut, OrderItemSnapshot } from "@/types/orders";

const ORDER_STATUS_LABELS: Record<string, string> = {
  created: "Creada — pendiente de asignación",
  on_the_way: "El especialista está en camino",
  in_service: "Servicio en curso",
  done: "Servicio finalizado",
  cancelled: "Cancelado",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function ItemRow({ item }: { item: OrderItemSnapshot }) {
  const isBase = item.kind === "service_base";
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {isBase && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Principal</span>
        )}
        <span className="text-sm">{item.name}</span>
      </div>
      <span className="text-sm font-semibold">S/ {(item.qty * item.unit_price).toFixed(2)}</span>
    </div>
  );
}

interface StepOrderConfirmedProps {
  order: OrderOut;
  onNewOrder: () => void;
}

export function StepOrderConfirmed({ order, onNewOrder }: StepOrderConfirmedProps) {
  const baseItem = order.items_snapshot.find((i) => i.kind === "service_base");
  const scheduledDate = baseItem?.meta?.scheduled_date;
  const scheduledTime = baseItem?.meta?.scheduled_time;

  return (
    <div className="flex flex-col items-center text-center">
      {/* Ícono de éxito */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="size-10 text-green-600" />
      </div>

      <h2 className="text-2xl font-extrabold text-foreground">¡Pedido confirmado!</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tu pedido ha sido creado exitosamente. El equipo de Paku se pondrá en contacto contigo.
      </p>

      {/* Número de orden */}
      <div className="mt-4 rounded-xl bg-muted/50 px-4 py-2">
        <p className="text-xs text-muted-foreground">Número de orden</p>
        <p className="font-mono text-sm font-bold">{order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* Estado */}
      <div className="mt-6 w-full rounded-2xl border border-border bg-card p-4 text-left">
        <div className="mb-4 flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-semibold">{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
        </div>

        {/* Fecha programada */}
        {scheduledDate && (
          <div className="mb-3 flex items-center gap-3">
            <CalendarDays className="size-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Fecha del servicio</p>
              <p className="text-sm font-semibold capitalize">{formatDate(scheduledDate)}{scheduledTime ? ` a las ${scheduledTime}` : ""}</p>
            </div>
          </div>
        )}

        {/* Dirección */}
        {order.delivery_address_snapshot && (
          <div className="mb-3 flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Dirección de servicio</p>
              <p className="text-sm font-semibold">{order.delivery_address_snapshot.address_line}</p>
              {order.delivery_address_snapshot.reference && (
                <p className="text-xs text-muted-foreground">{order.delivery_address_snapshot.reference}</p>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Package className="size-4 text-muted-foreground" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resumen del pedido</p>
          </div>
          <div className="divide-y divide-border">
            {order.items_snapshot.map((item, i) => (
              <ItemRow key={i} item={item} />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="font-bold">Total</span>
            <span className="text-lg font-extrabold text-primary">S/ {order.total_snapshot.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left text-xs text-blue-700">
        <p className="font-semibold">¿Qué sigue?</p>
        <p className="mt-1">Nuestro equipo revisará tu pedido y asignará un especialista. Recibirás una notificación cuando el especialista esté en camino.</p>
      </div>

      {/* Acciones */}
      <div className="mt-6 flex w-full flex-col gap-3">
        <Link
          href="/mis-pedidos"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          Ver mis pedidos
          <ArrowRight className="size-4" />
        </Link>
        <button
          onClick={onNewOrder}
          className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
        >
          Hacer otro pedido
        </button>
      </div>
    </div>
  );
}
