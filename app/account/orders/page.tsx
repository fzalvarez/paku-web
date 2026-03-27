"use client";

import React from "react";
import { ShoppingBag, Clock } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Mis órdenes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revisa el historial y estado de tus servicios contratados.
        </p>
      </div>

      {/* Estado vacío */}
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-linear-to-br from-primary/10 via-secondary/5 to-tertiary/10">
          <ShoppingBag className="size-10 text-primary/50" />
        </div>
        <div>
          <p className="text-lg font-extrabold tracking-tight text-foreground">
            Aún no tienes órdenes
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuando contrates un servicio, lo verás reflejado aquí.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-2.5 text-xs text-muted-foreground shadow-sm">
          <Clock className="size-3.5" />
          El historial de órdenes estará disponible próximamente
        </div>
      </div>
    </div>
  );
}
