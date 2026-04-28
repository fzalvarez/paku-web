"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  PlusCircle,
  PawPrint,
  Loader2,
  X,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePets } from "@/hooks/usePets";
import { useBooking } from "@/hooks/useBooking";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAddresses } from "@/hooks/useAddresses";
import { useBreeds } from "@/hooks/useBreeds";
import { petsService } from "@/lib/api/pets";
import { useUploadPhoto } from "@/hooks/useUploadPhoto";
import { AvatarUploader } from "@/components/common/AvatarUploader";
import { calcPetAge, speciesLabel, safePhotoUrl } from "@/lib/utils/pets";
import { AddressFormDialog } from "@/components/common/AddressFormDialog";
import type { CreatePetRequest, PetSpecies, PetSex } from "@/types/pets";
import type { AddressOut, AddressCreateIn } from "@/types/api";
import type { HoldOut } from "@/types/booking";
import { ApiCallError } from "@/lib/api/client";

// ── Constantes ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"] as const;
// ID del servicio de grooming/baño principal — ajustar cuando venga del store
const DEFAULT_SERVICE_ID = process.env.NEXT_PUBLIC_DEFAULT_SERVICE_ID ?? "";

// ── Helpers de fecha ──────────────────────────────────────────────────────────

function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatCountdown(secs: number): string {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Modal para agregar mascota ─────────────────────────────────────────────────

const EMPTY_FORM: CreatePetRequest = {
  name: "",
  species: "dog",
  breed: "",
  sex: "male",
  birth_date: "",
  notes: "",
  photo_url: "",
  weight_kg: undefined,
};

function AddPetModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<CreatePetRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { breeds, loading: breedsLoading } = useBreeds(form.species);
  const { uploadPhoto, isUploading } = useUploadPhoto();

  const inputCls =
    "w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const newPet = await petsService.create({
        ...form,
        name: form.name.trim(),
        breed: form.breed || null,
        sex: form.sex || null,
        birth_date: form.birth_date || null,
        notes: form.notes || null,
        photo_url: form.photo_url || null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      });
      if (photoFile && newPet?.id) {
        try {
          await uploadPhoto("pet", newPet.id, photoFile);
        } catch {
          /* no bloquea */
        }
      }
      onSuccess();
      onClose();
    } catch {
      setError("No se pudo registrar la mascota. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl ring-1 ring-border">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Registrar mascota</h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-3 flex justify-center">
          <AvatarUploader
            previewFile={photoFile}
            onFileSelect={setPhotoFile}
            isUploading={isUploading}
            disabled={submitting}
            size={80}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-semibold">Nombre *</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Luna"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Especie</label>
            <select
              className={inputCls}
              value={form.species}
              onChange={(e) =>
                setForm({
                  ...form,
                  species: e.target.value as PetSpecies,
                  breed: "",
                })
              }
            >
              <option value="dog">Perro</option>
              <option value="cat">Gato</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Sexo</label>
            <select
              className={inputCls}
              value={form.sex ?? "male"}
              onChange={(e) =>
                setForm({ ...form, sex: e.target.value as PetSex })
              }
            >
              <option value="male">Macho</option>
              <option value="female">Hembra</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-semibold">
              Raza{" "}
              {breedsLoading && (
                <Loader2 className="ml-1 inline size-3 animate-spin" />
              )}
            </label>
            {breeds.length > 0 ? (
              <select
                className={inputCls}
                value={form.breed ?? ""}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
              >
                <option value="">Sin especificar</option>
                {breeds.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={inputCls}
                value={form.breed ?? ""}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                placeholder={breedsLoading ? "Cargando razas…" : "Ej: Labrador"}
                disabled={breedsLoading}
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Peso (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              className={inputCls}
              value={form.weight_kg ?? ""}
              placeholder="Ej: 5.2"
              onChange={(e) =>
                setForm({
                  ...form,
                  weight_kg: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              className={inputCls}
              value={form.birth_date ?? ""}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-5 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={submitting || isUploading}
          >
            {submitting || isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Registrar mascota"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Selector de dirección ─────────────────────────────────────────────────────

function AddressSelector({
  selectedAddress,
  onSelect,
}: {
  selectedAddress: AddressOut | null;
  onSelect: (a: AddressOut) => void;
}) {
  const { isAuthenticated } = useAuthContext();
  const { addresses, loading, create } = useAddresses();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      onSelect(addresses.find((a) => a.is_default) ?? addresses[0]);
    }
  }, [addresses, selectedAddress, onSelect]);

  if (!isAuthenticated)
    return (
      <div className="flex items-center gap-3 rounded-xl bg-card p-4">
        <MapPin className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Inicia sesión para ver tus direcciones
        </span>
      </div>
    );

  if (loading)
    return (
      <div className="flex items-center gap-3 rounded-xl bg-card p-4">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Cargando direcciones…
        </span>
      </div>
    );

  if (addresses.length === 0)
    return (
      <>
        <button
          onClick={() => setFormOpen(true)}
          className="group flex w-full items-center justify-between rounded-xl border-2 border-dashed border-border bg-card p-4 transition-colors hover:bg-background"
        >
          <div className="flex items-center gap-3">
            <MapPin className="size-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Agrega una dirección de servicio
            </span>
          </div>
          <Plus className="size-4 text-muted-foreground group-hover:text-primary" />
        </button>
        <AddressFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={async (p: AddressCreateIn) => {
            await create(p);
            setFormOpen(false);
          }}
        />
      </>
    );

  return (
    <>
      <button
        onClick={() => setPickerOpen((p) => !p)}
        className="group flex w-full items-center justify-between rounded-xl bg-card p-4 transition-colors hover:bg-background"
      >
        <div className="flex min-w-0 items-center gap-3">
          <MapPin className="size-5 shrink-0 text-primary" />
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-medium">
              {selectedAddress?.address_line ?? "Selecciona una dirección"}
            </p>
            {selectedAddress?.reference && (
              <p className="truncate text-xs text-muted-foreground">
                {selectedAddress.reference}
              </p>
            )}
          </div>
        </div>
        <Pencil className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </button>

      {pickerOpen && (
        <div className="mt-2 overflow-hidden rounded-xl border bg-background shadow-lg">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              onClick={() => {
                onSelect(addr);
                setPickerOpen(false);
              }}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted",
                selectedAddress?.id === addr.id && "bg-primary/5 font-medium",
              )}
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate">{addr.address_line}</p>
                {addr.label && (
                  <p className="text-xs text-muted-foreground">{addr.label}</p>
                )}
                {addr.is_default && (
                  <span className="text-xs font-semibold text-primary">
                    Predeterminada
                  </span>
                )}
              </div>
            </button>
          ))}
          <button
            onClick={() => {
              setPickerOpen(false);
              setFormOpen(true);
            }}
            className="flex w-full items-center gap-3 border-t px-4 py-3 text-sm text-primary hover:bg-muted"
          >
            <Plus className="size-4" /> Nueva dirección
          </button>
        </div>
      )}
      <AddressFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (p: AddressCreateIn) => {
          await create(p);
          setFormOpen(false);
        }}
      />
    </>
  );
}

// ── Vista del Hold activo ─────────────────────────────────────────────────────

interface HoldViewProps {
  hold: HoldOut;
  secondsLeft: number;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function HoldView({
  hold,
  secondsLeft,
  loading,
  error,
  onConfirm,
  onCancel,
}: HoldViewProps) {
  const expired = secondsLeft <= 0 && hold.status === "held";
  const isConfirmed = hold.status === "confirmed";
  const urgency = secondsLeft < 60 && hold.status === "held";

  return (
    <div className="flex flex-col gap-4">
      {/* Cabecera de estado */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl p-4",
          isConfirmed
            ? "bg-green-50 border border-green-200"
            : expired
              ? "bg-destructive/10 border border-destructive/20"
              : "bg-primary/5 border border-primary/20",
        )}
      >
        {isConfirmed ? (
          <CheckCircle2 className="size-6 shrink-0 text-green-600" />
        ) : expired ? (
          <ShieldAlert className="size-6 shrink-0 text-destructive" />
        ) : (
          <CalendarCheck className="size-6 shrink-0 text-primary" />
        )}
        <div>
          <p className="font-extrabold text-foreground">
            {isConfirmed
              ? "¡Reserva confirmada!"
              : expired
                ? "Reserva temporal expirada"
                : "Reserva temporal activa"}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDateLong(hold.date)}
          </p>
        </div>
      </div>

      {/* Countdown */}
      {hold.status === "held" && (
        <div
          className={cn(
            "flex items-center justify-between rounded-xl px-4 py-3",
            urgency ? "bg-orange-50 border border-orange-200" : "bg-muted/60",
          )}
        >
          <div className="flex items-center gap-2">
            <Clock
              className={cn(
                "size-4",
                urgency ? "text-orange-500" : "text-muted-foreground",
              )}
            />
            <span className="text-sm font-medium text-muted-foreground">
              {expired ? "Tiempo agotado" : "Tiempo restante"}
            </span>
          </div>
          <span
            className={cn(
              "font-mono text-xl font-extrabold tabular-nums",
              expired
                ? "text-destructive"
                : urgency
                  ? "text-orange-500"
                  : "text-foreground",
            )}
          >
            {expired ? "00:00" : formatCountdown(secondsLeft)}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Acciones */}
      {!isConfirmed && (
        <div className="flex flex-col gap-2">
          <Button
            className="w-full gap-2 rounded-xl py-5 text-base font-bold"
            onClick={onConfirm}
            disabled={loading || expired}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {expired ? "Reserva expirada" : "Confirmar reserva"}
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar y elegir otra fecha
          </Button>
        </div>
      )}

      {isConfirmed && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
          ✅ Tu reserva ha sido confirmada. El equipo de Paku se pondrá en
          contacto contigo.
        </div>
      )}
    </div>
  );
}

// ── Calendario con disponibilidad real ────────────────────────────────────────

interface BookingCalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  serviceId?: string;
}

function BookingCalendar({
  selectedDate,
  onSelectDate,
  serviceId,
}: BookingCalendarProps) {
  const { slotsLoading, slotsError, fetchAvailability, getSlotForDate } =
    useBooking();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  // Nombre del mes en español
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "es-PE",
    {
      month: "long",
      year: "numeric",
    },
  );

  // Calcular días del mes para el grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0=dom
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Fetch cada vez que cambia el mes/servicio
  useEffect(() => {
    const dateFrom = toISO(new Date(viewYear, viewMonth, 1));
    fetchAvailability({
      service_id: serviceId || undefined,
      date_from: dateFrom,
      days: 30,
    });
  }, [viewYear, viewMonth, serviceId, fetchAvailability]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  }

  // Celdas del grid: [prevMonth days...] [current days...]
  const gridCells: Array<{
    day: number;
    iso: string;
    isCurrentMonth: boolean;
  }> = [];

  // Días del mes anterior (relleno)
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const iso = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    gridCells.push({ day: d, iso, isCurrentMonth: false });
  }

  // Días del mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    gridCells.push({ day: d, iso, isCurrentMonth: true });
  }

  return (
    <div className="rounded-2xl bg-muted/40 p-6 ring-1 ring-border sm:p-8">
      {/* Cabecera */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-extrabold capitalize sm:text-2xl">
          {monthLabel}
        </h3>
        <div className="flex items-center gap-1">
          {slotsLoading && (
            <Loader2 className="mr-2 size-4 animate-spin text-muted-foreground" />
          )}
          <button
            onClick={prevMonth}
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={nextMonth}
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Error de disponibilidad */}
      {slotsError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
          <AlertCircle className="size-3.5 shrink-0" />
          No se pudo cargar la disponibilidad. Mostrando calendario sin datos.
        </div>
      )}

      {/* Grid del mes */}
      <div className="rounded-xl bg-card p-4 sm:p-6">
        {/* Días de la semana */}
        <div className="mb-3 grid grid-cols-7 text-center">
          {DAYS_OF_WEEK.map((d) => (
            <span
              key={d}
              className="text-[10px] font-bold text-muted-foreground sm:text-xs"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Celdas */}
        <div className="grid grid-cols-7 gap-y-1">
          {gridCells.map(({ day, iso, isCurrentMonth }, i) => {
            const slot = isCurrentMonth ? getSlotForDate(iso) : undefined;
            const isPast = isCurrentMonth && iso < toISO(today);
            const isUnavailable = slot
              ? slot.available <= 0 || !slot.is_active
              : false;
            const isSelected = iso === selectedDate;
            const isToday = iso === toISO(today);
            const disabled = !isCurrentMonth || isPast || isUnavailable;

            // Color del badge de disponibilidad
            const badgeColor = slot
              ? slot.available === 0
                ? "bg-destructive/80"
                : slot.available <= 2
                  ? "bg-orange-400"
                  : "bg-green-500"
              : null;

            return (
              <div key={i} className="relative flex flex-col items-center">
                <button
                  disabled={disabled}
                  onClick={() => !disabled && onSelectDate(iso)}
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all",
                    !isCurrentMonth &&
                      "text-muted-foreground/30 cursor-default",
                    isCurrentMonth &&
                      !disabled &&
                      !isSelected &&
                      "hover:bg-muted",
                    isPast && "text-muted-foreground/40 cursor-default",
                    isUnavailable &&
                      isCurrentMonth &&
                      "text-muted-foreground/50 line-through cursor-not-allowed",
                    isToday && !isSelected && "ring-2 ring-primary/30",
                    isSelected &&
                      "bg-primary font-bold text-primary-foreground shadow-lg ring-4 ring-primary/20",
                  )}
                >
                  {day}
                </button>
                {/* Badge disponibilidad */}
                {badgeColor && isCurrentMonth && !isPast && (
                  <span
                    className={cn("mt-0.5 h-1 w-1 rounded-full", badgeColor)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-green-500" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-orange-400" />
          Últimos cupos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-destructive/80" />
          Sin cupo
        </span>
      </div>

      {/* Info de la fecha seleccionada */}
      {(() => {
        if (!selectedDate) return null;
        const [sy, sm] = selectedDate.split("-").map(Number);
        const isSelectedInCurrentMonth =
          sy === viewYear && sm === viewMonth + 1;
        if (!isSelectedInCurrentMonth) return null;
        const slot = getSlotForDate(selectedDate);
        if (!slot) return null;
        return (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
            <span className="text-sm font-semibold text-foreground capitalize">
              {formatDateLong(selectedDate)}
            </span>
            <span
              className={cn(
                "text-xs font-bold",
                slot.available === 0
                  ? "text-destructive"
                  : slot.available <= 2
                    ? "text-orange-500"
                    : "text-green-600",
              )}
            >
              {slot.available === 0
                ? "Sin cupos"
                : `${slot.available} cupo${slot.available !== 1 ? "s" : ""}`}
            </span>
          </div>
        );
      })()}
    </div>
  );
}

// ── Sidebar de reserva ─────────────────────────────────────────────────────────

interface BookingSidebarProps {
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
}

function BookingSidebar({ selectedDate, onDateChange }: BookingSidebarProps) {
  const { user, isAuthenticated } = useAuthContext();
  const { pets, loading: petsLoading, error: petsError, reload } = usePets();
  const {
    activeHold,
    holdLoading,
    holdError,
    secondsLeft,
    createHold,
    confirmHold,
    cancelHold,
    clearHoldError,
  } = useBooking();

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressOut | null>(
    null,
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const displayName =
    user?.first_name ?? user?.email?.split("@")[0] ?? "Usuario";

  // Perfil incompleto
  const profileIncomplete =
    isAuthenticated && user && (!user.phone || !user.sex || !user.birth_date);

  const handleSelectAddress = useCallback(
    (a: AddressOut) => setSelectedAddress(a),
    [],
  );

  async function handleCreateHold() {
    if (!selectedPetId || !selectedDate) return;
    setBookingError(null);
    clearHoldError();
    try {
      await createHold({
        pet_id: selectedPetId,
        service_id: DEFAULT_SERVICE_ID,
        date: selectedDate,
      });
    } catch (err) {
      if (err instanceof ApiCallError) {
        if (err.status === 409 || err.status === 400) {
          setBookingError(
            "Esta fecha ya no tiene disponibilidad. Por favor, elige otra.",
          );
        } else if (err.status === 401) {
          setBookingError("Debes iniciar sesión para reservar.");
        } else {
          setBookingError("No se pudo crear la reserva. Intenta de nuevo.");
        }
      }
    }
  }

  async function handleConfirm() {
    try {
      await confirmHold();
    } catch (err) {
      if (err instanceof ApiCallError && err.status === 409) {
        setBookingError(
          "El cupo fue tomado por otro usuario. Por favor, elige otra fecha.",
        );
        onDateChange(null);
      }
    }
  }

  async function handleCancel() {
    await cancelHold();
    onDateChange(null);
  }

  const canBook =
    isAuthenticated &&
    !profileIncomplete &&
    selectedPetId &&
    selectedDate &&
    !activeHold;

  return (
    <div className="flex flex-col gap-6">
      {addModalOpen && (
        <AddPetModal
          onClose={() => setAddModalOpen(false)}
          onSuccess={reload}
        />
      )}

      <div className="rounded-2xl bg-muted/40 p-6 ring-1 ring-border sm:p-8">
        <h2 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Hola, {displayName}
        </h2>

        {/* Advertencia de perfil incompleto */}
        {profileIncomplete && (
          <a
            href="/account/profile"
            className="mb-6 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 transition-colors hover:bg-orange-100"
          >
            <ShieldAlert className="size-5 shrink-0" />
            <div>
              <p className="font-bold">Completa tu perfil para reservar</p>
              <p className="text-xs">
                Necesitamos tu teléfono, sexo y fecha de nacimiento.
              </p>
            </div>
          </a>
        )}

        {/* Dirección */}
        {!activeHold && (
          <div className="mb-6">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Dirección de Servicio
            </label>
            <AddressSelector
              selectedAddress={selectedAddress}
              onSelect={handleSelectAddress}
            />
          </div>
        )}

        {/* Hold activo */}
        {activeHold ? (
          <HoldView
            hold={activeHold}
            secondsLeft={secondsLeft}
            loading={holdLoading}
            error={holdError ?? bookingError}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        ) : (
          <>
            {/* Selector de mascota */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Selecciona tu mascota
                </label>
                {isAuthenticated && (
                  <button
                    className="text-xs font-bold text-primary hover:underline"
                    onClick={() => setAddModalOpen(true)}
                  >
                    + Registrar otra
                  </button>
                )}
              </div>

              {petsLoading && (
                <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-6 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Cargando
                  mascotas...
                </div>
              )}
              {!petsLoading && petsError && (
                <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {petsError}
                </p>
              )}
              {!petsLoading && !petsError && !isAuthenticated && (
                <div className="rounded-xl border-2 border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
                  Inicia sesión para ver tus mascotas
                </div>
              )}
              {!petsLoading &&
                !petsError &&
                isAuthenticated &&
                pets.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
                    No tienes mascotas registradas aún.{" "}
                    <button
                      className="font-semibold text-primary hover:underline"
                      onClick={() => setAddModalOpen(true)}
                    >
                      Agrega una
                    </button>
                  </div>
                )}
              {!petsLoading && pets.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {pets.map((pet) => {
                    const isSelected = pet.id === selectedPetId;
                    const photoUrl = safePhotoUrl(pet.photo_url);
                    return (
                      <button
                        key={pet.id}
                        onClick={() => setSelectedPetId(pet.id)}
                        className={cn(
                          "w-36 shrink-0 rounded-2xl bg-card p-3 text-center transition-all",
                          isSelected
                            ? "border-2 border-primary ring-4 ring-primary/10 shadow-md"
                            : "border-2 border-transparent shadow-sm hover:shadow-md",
                        )}
                      >
                        <div
                          className={cn(
                            "relative mx-auto mb-3 size-16 overflow-hidden rounded-full ring-4 transition-all",
                            isSelected ? "ring-primary/20" : "ring-muted",
                          )}
                        >
                          {photoUrl ? (
                            <Image
                              src={photoUrl}
                              alt={pet.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center bg-primary/10">
                              <PawPrint className="size-7 text-primary" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-bold leading-tight">
                          {pet.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {speciesLabel(pet.species)}
                          {pet.breed ? ` · ${pet.breed}` : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground/70">
                          {calcPetAge(pet.birth_date)}
                        </p>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border transition-colors hover:border-primary hover:text-primary"
                  >
                    <PlusCircle className="size-6 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      Agregar
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Error de booking */}
            {bookingError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {bookingError}
              </div>
            )}

            {/* Resumen antes de reservar */}
            {selectedDate && selectedPetId && (
              <div className="mt-4 rounded-xl border border-border/60 bg-card px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Resumen
                </p>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {formatDateLong(selectedDate)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mascota:{" "}
                  {pets.find((p) => p.id === selectedPetId)?.name ?? "—"}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA */}
      {!activeHold && (
        <Button
          size="lg"
          className="w-full rounded-full py-6 text-lg font-bold shadow-xl"
          disabled={!canBook || holdLoading}
          onClick={handleCreateHold}
        >
          {holdLoading ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" /> Reservando…
            </>
          ) : !isAuthenticated ? (
            "Inicia sesión para reservar"
          ) : profileIncomplete ? (
            "Completa tu perfil primero"
          ) : !selectedPetId ? (
            "Selecciona una mascota"
          ) : !selectedDate ? (
            "Selecciona una fecha"
          ) : (
            "Reservar fecha"
          )}
        </Button>
      )}
    </div>
  );
}

// ── Sección principal ─────────────────────────────────────────────────────────

export function BookingSection() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <BookingCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            serviceId={DEFAULT_SERVICE_ID || undefined}
          />
        </div>
        <div className="lg:col-span-5">
          <BookingSidebar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>
    </section>
  );
}
