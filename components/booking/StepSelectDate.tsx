"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/hooks/useBooking";
import { WizardNavButtons } from "./WizardLayout";

const DAYS_OF_WEEK = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"] as const;

// Horarios disponibles
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "14:00", "15:00", "16:00",
];

function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

interface StepSelectDateProps {
  serviceId: string;
  selectedDate: string | null;
  selectedTime: string | null;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSelectDate({
  serviceId,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onNext,
  onBack,
}: StepSelectDateProps) {
  const { slots, slotsLoading, slotsError, fetchAvailability, getSlotForDate } = useBooking();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("es-PE", {
    month: "long", year: "numeric",
  });

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  useEffect(() => {
    const dateFrom = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
    fetchAvailability({ service_id: serviceId || undefined, date_from: dateFrom, days: 30 });
  }, [viewYear, viewMonth, serviceId, fetchAvailability]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
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
          Elige la fecha y hora para el servicio. Solo se muestran los días con disponibilidad.
        </p>
      </div>

      {/* Calendario */}
      <div className="rounded-2xl bg-muted/40 p-4 ring-1 ring-border sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold capitalize">{monthLabel}</h3>
          <div className="flex items-center gap-1">
            {slotsLoading && <Loader2 className="mr-2 size-4 animate-spin text-muted-foreground" />}
            <button onClick={prevMonth} className="flex size-8 items-center justify-center rounded-full hover:bg-muted">
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
            <span>No se pudo cargar la disponibilidad — puedes seleccionar cualquier fecha disponible.</span>
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
              const isPast = isCurrentMonth && iso < toISO(today);
              // Si hay error o no hay slots del backend, permitir cualquier día futuro
              const hasBackendData = !slotsError && slots.length > 0;
              const isUnavailable = hasBackendData
                ? (slot ? (slot.available <= 0 || !slot.is_active) : isCurrentMonth)
                : false;
              const isSelected = iso === selectedDate;
              const isToday = iso === toISO(today);
              const disabled = !isCurrentMonth || isPast || isUnavailable;

              const badgeColor = slot
                ? slot.available === 0 ? "bg-destructive/80"
                  : slot.available <= 2 ? "bg-orange-400"
                    : "bg-green-500"
                : null;

              return (
                <div key={i} className="relative flex flex-col items-center">
                  <button
                    disabled={disabled}
                    onClick={() => { if (!disabled) { onSelectDate(iso); } }}
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all sm:h-9 sm:w-9 sm:text-sm",
                      !isCurrentMonth && "text-muted-foreground/30 cursor-default",
                      isCurrentMonth && !disabled && !isSelected && "hover:bg-muted",
                      isPast && "text-muted-foreground/40 cursor-default",
                      isUnavailable && isCurrentMonth && !isPast && "text-muted-foreground/50 line-through cursor-not-allowed",
                      isToday && !isSelected && "ring-2 ring-primary/30",
                      isSelected && "bg-primary font-bold text-primary-foreground shadow-lg ring-4 ring-primary/20",
                    )}
                  >
                    {day}
                  </button>
                  {badgeColor && isCurrentMonth && !isPast && (
                    <span className={cn("mt-0.5 h-1 w-1 rounded-full", badgeColor)} />
                  )}
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

      {/* Fecha seleccionada y selector de hora */}
      {selectedDate && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-bold capitalize text-primary">{formatDateLong(selectedDate)}</p>
          {(() => {
            const slot = getSlotForDate(selectedDate);
            if (!slot) return null;
            return (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {slot.available > 0 ? `${slot.available} cupo${slot.available !== 1 ? "s" : ""} disponibles` : "Sin cupos"}
              </p>
            );
          })()}

          {/* Selección de hora */}
          <div className="mt-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Hora del servicio</p>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => onSelectTime(t)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    selectedTime === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border hover:border-primary/40"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <WizardNavButtons
        canGoBack
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!selectedDate || !selectedTime}
        nextLabel="Continuar"
      />
    </div>
  );
}
