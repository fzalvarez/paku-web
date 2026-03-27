"use client";

import React from "react";
import { CreditCard, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Placeholder de tarjeta de pago ─────────────────────────────────────────────
function PaymentCardPlaceholder() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-linear-to-br from-primary/10 via-secondary/5 to-tertiary/10">
        <CreditCard className="size-10 text-primary/50" />
      </div>
      <div>
        <p className="text-lg font-extrabold tracking-tight text-foreground">
          Aún no tienes métodos de pago
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Agrega una tarjeta para agilizar el proceso de pago en tus próximas compras.
        </p>
      </div>
      <Button disabled className="gap-2 opacity-60" title="Próximamente">
        <Plus className="size-4" />
        Agregar tarjeta
      </Button>
      <p className="text-xs text-muted-foreground">Próximamente disponible</p>
    </div>
  );
}

// ── Info de seguridad ──────────────────────────────────────────────────────────
function SecurityInfo() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
        <Lock className="size-4" />
      </span>
      <div>
        <p className="text-sm font-bold text-foreground">Pagos 100% seguros</p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
          Tus datos de pago están cifrados y protegidos. Nunca almacenamos los números
          completos de tus tarjetas. Utilizamos proveedores certificados PCI-DSS.
        </p>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Métodos de pago
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra tus tarjetas y métodos de pago guardados.
        </p>
      </div>

      {/* Info de seguridad */}
      <SecurityInfo />

      {/* Placeholder */}
      <PaymentCardPlaceholder />
    </div>
  );
}
