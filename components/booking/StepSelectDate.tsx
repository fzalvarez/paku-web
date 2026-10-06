"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/hooks/useBooking";
import { bookingService } from "@/lib/api/booking";
import { ApiCallError } from "@/lib/api/client";
import { todayLima, timeLima } from "@/lib/utils/dates";
import { WizardNavButtons } from "./WizardLayout";
import type { HoldOut } from "@/types/booking";

const DAYS_OF_WEEK = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"] as const;

function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

/** La reserva sirve si es de esta mascota, servicio y día, y sigue vigente. */
export function holdMatches(
  hold: HoldOut | null,
  petId: string | null,
  serviceId: string | null,
  date: string | null,
): boolean {
  return (
    !!hold &&
    hold.status === "held" &&
    hold.pet_id === petId &&
    hold.service_id === serviceId &&
    hold.date === date &&
    new Date(hold.expires_at).getTime() > Date.now()
  );
}

interface StepSelectDateProps {
  serviceId: string;
  petId: string;
  selectedDate: string | null;
  /** Reserva vigente del asistente (si ya se reservó un día) */
  hold: HoldOut | null;
  /** Aviso al llegar aquí porque la reserva anterior venció */
  notice?: string | null;
  onSelectDate: (date: string) => void;
  /** Se reservó el día (POST /holds): el asistente guarda la reserva */
  onReserved: (hold: HoldOut) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSelectDate({
  serviceId,
  petId,
  selectedDate,
  hold,
  notice,
  onSelectDate,
  onReserved,
  onNext,
  onBack,
}: StepSelectDateProps) {
  const { slotsLoading, slotsError, slotsFetched, fetchAvailability, getSlotForDate } = useBooking();
  const today = todayLima();
  const [todayYear, todayMonth] = today.split("-").map(Number);
  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth - 1);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<{ message: string; profile?: boolean } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("es-PE", {
    month: "long", year: "numeric",
  });

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const isCurrentViewMonth = viewYear === todayYear && viewMonth === todayMonth - 1;

  useEffect(() => {
    // Desde hoy en el mes actual (el backend no devuelve días pasados); desde el 1 en los siguientes
    const dateFrom = isCurrentViewMonth
      ? today
      : `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
    fetchAvailability({ service_id: serviceId || undefined, date_from: dateFrom, days: 30 });
  }, [viewYear, viewMonth, serviceId, fetchAvailability, isCurrentViewMonth, today, reloadKey]);

  function prevMonth() {
    if (isCurrentViewMonth) return;
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  const alreadyReserved = holdMatches(hold, petId, serviceId, selectedDate);

  async function handleContinue() {
    if (!selectedDate) return;
    if (alreadyReserved) {
      onNext();
      return;
    }
    setReserving(true);
    setReserveError(null);
    try {
      // La reserva anterior (otro día) ya no sirve: se libera para no acaparar cupo
      if (hold && hold.status === "held") {
        await bookingService.cancelHold(hold.id).catch(() => undefined);
      }
      const newHold = await bookingService.reserve({ pet_id: petId, service_id: serviceId, date: selectedDate });
      onReserved(newHold);
      onNext();
    } catch (err) {
      const code = err instanceof ApiCallError ? err.code : "";
      const message = err instanceof Error ? err.message : "No se pudo reservar la fecha. Intenta de nuevo.";
      setReserveError({ message, profile: code === "PROFILE_INCOMPLETE" });
      // Cupo tomado mientras elegía: refrescar el calendario
      if (code === "no_availability" || code === "no_capacity") setReloadKey((k) => k + 1);
    } finally {
      setReserving(false);
    }
  }

  const gridCells: Array<{ day: number; iso: string; isCurrentMonth: boolean }> = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const iso = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    gridCells.push({ day: d, iso, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    gridCells.push({ day: d, iso, isCurrentMonth: true });
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">¿Cuándo lo necesitas?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige la fecha para el servicio. Al continuar reservamos tu cupo por 2 horas mientras
          completas la compra. La hora de la visita te la confirmamos después.
        </p>
      </div>

      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <AlertCircle className="size-4 shrink-0" />
          {notice}
        </div>
      )}

      {/* Calendario */}
      <div className="rounded-2xl bg-muted/40 p-4 ring-1 ring-border sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold capitalize">{monthLabel}</h3>
          <div className="flex items-center gap-1">
            {slotsLoading && <Loader2 className="mr-2 size-4 animate-spin text-muted-foreground" />}
            <button
              onClick={prevMonth}
              disabled={isCurrentViewMonth}
              className="flex size-8 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button onClick={nextMonth} className="flex size-8 items-center justify-center rounded-full hover:bg-muted">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {slotsError && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>No se pudo cargar la disponibilidad. Puedes elegir una fecha y la confirmaremos al reservar.</span>
          </div>
        )}

        <div className="rounded-xl bg-card p-3 sm:p-4">
          <div className="mb-2 grid grid-cols-7 text-center">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[10px] font-bold text-muted-foreground sm:text-xs">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {gridCells.map(({ day, iso, isCurrentMonth }, i) => {
              const slot = isCurrentMonth ? getSlotForDate(iso) : undefined;
              const isPast = isCurrentMonth && iso < today;
              // Un fetch exitoso (sin error) es autoritativo, incluso si devuelve
              // un array vacío: significa que no hay cupos configurados en ese rango.
              // Solo si el fetch falló permitimos elegir cualquier día futuro; la
              // reserva (POST /holds) confirma si hay cupo.
              const hasBackendData = slotsFetched && !slotsError;
              const isUnavailable = hasBackendData
                ? (slot ? (slot.available <= 0 || !slot.is_active) : isCurrentMonth)
                : false;
              const isSelected = iso === selectedDate;
              const isToday = iso === today;
              const disabled = !isCurrentMonth || isPast || isUnavailable || reserving;

              const dayTone: "ok" | "low" | "unavailable" | null =
                !isCurrentMonth || isPast
                  ? null
                  : isUnavailable
                    ? "unavailable"
                    : slot
                      ? (slot.available <= 2 ? "low" : "ok")
                      : null;

              return (
                <div key={i} className="relative flex flex-col items-center">
                  <button
                    disabled={disabled}
                    onClick={() => { if (!disabled) { onSelectDate(iso); setReserveError(null); } }}
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all sm:h-9 sm:w-9 sm:text-sm",
                      !isCurrentMonth && "text-muted-foreground/30 cursor-default",
                      isPast && isCurrentMonth && "text-muted-foreground/40 cursor-default",
                      isCurrentMonth && !disabled && !isSelected && !dayTone && "hover:bg-muted",
                      dayTone === "ok" && !isSelected && "bg-green-500/10 text-green-700 hover:bg-green-500/15",
                      dayTone === "low" && !isSelected && "bg-orange-400/15 text-orange-700 hover:bg-orange-400/20",
                      dayTone === "unavailable" && !isSelected && "bg-destructive/10 text-muted-foreground/50 line-through cursor-not-allowed",
                      isToday && !isSelected && "ring-2 ring-primary/30",
                      isSelected && "bg-primary font-bold text-primary-foreground shadow-lg ring-4 ring-primary/20",
                    )}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-green-500" />Disponible</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-400" />Últimos cupos</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-destructive/80" />Sin cupo</span>
        </div>
      </div>

      {/* Fecha seleccionada */}
      {selectedDate && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-bold capitalize text-primary">{formatDateLong(selectedDate)}</p>
          {alreadyReserved && hold ? (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-green-700">
              <CheckCircle2 className="size-3.5" />
              Cupo reservado hasta las {timeLima(hold.expires_at)}
            </p>
          ) : (() => {
            const slot = getSlotForDate(selectedDate);
            if (!slot) return null;
            return (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {slot.available > 0 ? `${slot.available} cupo${slot.available !== 1 ? "s" : ""} disponibles` : "Sin cupos"}
              </p>
            );
          })()}
        </div>
      )}

      {reserveError && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            {reserveError.message}
            {reserveError.profile && (
              <>
                {" "}
                <Link href="/account/profile" className="font-semibold underline">Completar perfil</Link>
              </>
            )}
          </span>
        </div>
      )}

      <WizardNavButtons
        canGoBack={!reserving}
        onBack={onBack}
        onNext={handleContinue}
        nextDisabled={!selectedDate}
        nextLoading={reserving}
        nextLabel={alreadyReserved ? "Continuar" : "Reservar fecha"}
      />
    </div>
  );
}
