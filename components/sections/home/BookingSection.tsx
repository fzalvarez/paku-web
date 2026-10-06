"use client";

import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

/**
 * Acceso a la reserva desde "Mi panel". Antes tenía su propio calendario y
 * creaba reservas de cupo con un servicio fijo que nunca llegaban a orden;
 * desde C-15 la reserva va ligada a la compra, así que todo se hace en el
 * asistente (/booking): mascota → servicio → fecha (reserva) → pago.
 */
export function BookingSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarDays className="size-6" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold">Agenda un servicio</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Elige la mascota, el servicio y el día. Reservamos tu cupo mientras completas la compra.
            </p>
          </div>
        </div>
        <Link
          href={ROUTES.BOOKING}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          Reservar
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
