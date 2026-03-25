"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, Pencil, PlusCircle, PawPrint, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePets } from "@/hooks/usePets";
import { useAuthContext } from "@/contexts/AuthContext";
import { petsService } from "@/lib/api/pets";
import { calcPetAge, speciesLabel } from "@/lib/utils/pets";
import type { CreatePetRequest, PetSpecies, PetSex } from "@/types/pets";

const DAYS_OF_WEEK = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"] as const;

// Días vacíos del mes anterior + días del mes actual (mock estático)
const CALENDAR_DAYS: { day: number; inactive?: boolean; selected?: boolean }[] = [
  { day: 29, inactive: true },
  { day: 30, inactive: true },
  { day: 31, inactive: true },
  { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 },
  { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 },
  { day: 9, selected: true },
  { day: 10 }, { day: 11 },
  { day: 12 }, { day: 13 }, { day: 14 }, { day: 15 },
  { day: 16 }, { day: 17 }, { day: 18 },
];

const TIME_SLOTS = ["08:00 AM", "10:30 AM", "14:00 PM"] as const;

// ── Formulario para crear mascota ────────────────────────────────────────────
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

interface AddPetModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddPetModal({ onClose, onSuccess }: AddPetModalProps) {
  const [form, setForm] = useState<CreatePetRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!form.name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setSubmitting(true);
    try {
      const body: CreatePetRequest = {
        name: form.name.trim(),
        species: form.species,
        breed: form.breed || null,
        sex: form.sex || null,
        birth_date: form.birth_date || null,
        notes: form.notes || null,
        photo_url: form.photo_url || null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      };
      await petsService.create(body);
      onSuccess();
      onClose();
    } catch {
      setError("No se pudo registrar la mascota. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl ring-1 ring-border">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Registrar mascota</h2>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-full hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-semibold">Nombre *</label>
            <input
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Luna"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Especie</label>
            <select
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.species}
              onChange={(e) => setForm({ ...form, species: e.target.value as PetSpecies })}
            >
              <option value="dog">Perro</option>
              <option value="cat">Gato</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Sexo</label>
            <select
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.sex ?? "male"}
              onChange={(e) => setForm({ ...form, sex: e.target.value as PetSex })}
            >
              <option value="male">Macho</option>
              <option value="female">Hembra</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Raza</label>
            <input
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.breed ?? ""}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
              placeholder="Ej: Labrador"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Peso (kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.weight_kg ?? ""}
              onChange={(e) => setForm({ ...form, weight_kg: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Ej: 5.2"
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-sm font-semibold">Fecha de nacimiento</label>
            <input
              type="date"
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.birth_date ?? ""}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-sm font-semibold">Notas</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Alergias, comportamiento, etc."
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Guardando..." : "Registrar mascota"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componente: Calendario ────────────────────────────────────────────────
function BookingCalendar() {
  const [selectedDay, setSelectedDay] = useState(9);
  const [selectedSlot, setSelectedSlot] = useState("14:00 PM");

  return (
    <div className="rounded-2xl bg-muted/40 p-8 ring-1 ring-border">
      {/* Cabecera */}
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-2xl font-bold">Calendario de Citas</h3>
        <div className="flex gap-2">
          <button className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted">
            <ChevronLeft className="size-5" />
          </button>
          <button className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Grid del mes */}
      <div className="mb-8 rounded-xl bg-card p-6">
        {/* Días de la semana */}
        <div className="mb-6 grid grid-cols-7 text-center">
          {DAYS_OF_WEEK.map((d) => (
            <span key={d} className="text-xs font-bold text-muted-foreground">
              {d}
            </span>
          ))}
        </div>

        {/* Números */}
        <div className="grid grid-cols-7 gap-y-3">
          {CALENDAR_DAYS.map(({ day, inactive }, i) => {
            const isSelected = day === selectedDay && !inactive;
            return (
              <button
                key={i}
                disabled={inactive}
                onClick={() => !inactive && setSelectedDay(day)}
                className={cn(
                  "flex items-center justify-center rounded-lg py-2 text-sm font-semibold transition-colors",
                  inactive && "cursor-default text-muted-foreground/40",
                  !inactive && !isSelected && "hover:bg-muted",
                  isSelected &&
                    "bg-primary font-bold text-primary-foreground shadow-lg ring-4 ring-primary/20"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Turnos disponibles */}
      <div>
        <h4 className="mb-4 text-lg font-bold">Turnos disponibles para hoy</h4>
        <div className="grid grid-cols-3 gap-4">
          {TIME_SLOTS.map((slot) => {
            const isActive = slot === selectedSlot;
            return (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={cn(
                  "rounded-xl py-3 text-center text-sm font-bold transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "border-2 border-primary/10 bg-card hover:border-primary"
                )}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Sub-componente: Selector de mascota + confirmación ────────────────────────
function BookingSidebar() {
  const { user, isAuthenticated } = useAuthContext();
  const { pets, loading, error, reload } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const displayName = user?.first_name
    ? user.first_name
    : user?.email?.split("@")[0] ?? "Usuario";

  return (
    <div className="space-y-6">
      {addModalOpen && (
        <AddPetModal onClose={() => setAddModalOpen(false)} onSuccess={reload} />
      )}

      <div className="rounded-2xl bg-muted/40 p-8 ring-1 ring-border">
        <h2 className="mb-6 text-3xl font-extrabold tracking-tight">
          Hola, {displayName}
        </h2>

        {/* Dirección */}
        <div className="mb-8">
          <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Dirección de Servicio
          </label>
          <div className="group flex cursor-pointer items-center justify-between rounded-xl bg-card p-4 transition-colors hover:bg-background">
            <div className="flex items-center gap-3">
              <MapPin className="size-5 text-primary" />
              <span className="font-medium">Calle Las Flores 123, San Borja</span>
            </div>
            <Pencil className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
        </div>

        {/* Selector de mascota */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Selecciona tu mascota
            </label>
            {isAuthenticated && (
              <button
                className="text-xs font-bold text-primary hover:underline"
                onClick={() => setAddModalOpen(true)}
              >
                Registrar otra mascota
              </button>
            )}
          </div>

          {/* Estados de carga / error */}
          {loading && (
            <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Cargando mascotas...
            </div>
          )}

          {!loading && error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
          )}

          {!loading && !error && !isAuthenticated && (
            <div className="rounded-xl border-2 border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              Inicia sesión para ver tus mascotas
            </div>
          )}

          {!loading && !error && isAuthenticated && pets.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              No tienes mascotas registradas aún.{" "}
              <button className="font-semibold text-primary hover:underline" onClick={() => setAddModalOpen(true)}>
                Agrega una
              </button>
            </div>
          )}

          {!loading && !error && pets.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {pets.map((pet) => {
                const isSelected = pet.id === selectedPetId;
                return (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className={cn(
                      "w-44 shrink-0 rounded-2xl bg-card p-4 text-center transition-all",
                      isSelected
                        ? "border-2 border-primary ring-4 ring-primary/10 shadow-md"
                        : "border-2 border-transparent shadow-sm hover:shadow-md"
                    )}
                  >
                    <div
                      className={cn(
                        "relative mx-auto mb-4 size-20 overflow-hidden rounded-full ring-4 transition-all",
                        isSelected ? "ring-primary/20" : "ring-muted"
                      )}
                    >
                      {pet.photo_url ? (
                        <Image
                          src={pet.photo_url}
                          alt={pet.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-primary/10">
                          <PawPrint className="size-8 text-primary" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-lg font-bold">{pet.name}</h4>
                    <p className="text-xs font-medium text-muted-foreground">
                      {speciesLabel(pet.species)}
                      {pet.breed ? ` • ${pet.breed}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground/70">
                      {calcPetAge(pet.birth_date)}
                    </p>
                  </button>
                );
              })}

              {/* Añadir mascota */}
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border transition-colors hover:border-primary hover:text-primary"
              >
                <PlusCircle className="size-6 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Agregar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="w-full rounded-full py-6 text-xl font-bold shadow-xl"
        disabled={!selectedPetId}
      >
        Confirmar Reserva
      </Button>
    </div>
  );
}

// ── Sección principal ─────────────────────────────────────────────────────────
export function BookingSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <BookingCalendar />
        </div>
        <div className="lg:col-span-5">
          <BookingSidebar />
        </div>
      </div>
    </section>
  );
}
