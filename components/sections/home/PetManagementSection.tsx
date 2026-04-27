"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  SlidersHorizontal,
  Sparkles,
  ArrowUpRight,
  Info,
  Loader2,
  PawPrint,
  X,
} from "lucide-react";
import { usePets } from "@/hooks/usePets";
import { useAuthContext } from "@/contexts/AuthContext";
import { useBreeds } from "@/hooks/useBreeds";
import { petsService } from "@/lib/api/pets";
import { calcPetAge, speciesLabel, safePhotoUrl } from "@/lib/utils/pets";
import type { Pet, CreatePetRequest, PetSpecies, PetSex } from "@/types/pets";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/common/AuthDialog";

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

interface AddPetModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddPetModal({ onClose, onSuccess }: AddPetModalProps) {
  const [form, setForm] = useState<CreatePetRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar razas según la especie seleccionada
  const { breeds, loading: breedsLoading } = useBreeds(form.species);

  const handleSubmit = async () => {
    setError(null);
    if (!form.name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setSubmitting(true);
    try {
      await petsService.create({
        name: form.name.trim(),
        species: form.species,
        breed: form.breed || null,
        sex: form.sex || null,
        birth_date: form.birth_date || null,
        notes: form.notes || null,
        photo_url: form.photo_url || null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      });
      onSuccess();
      onClose();
    } catch {
      setError("No se pudo registrar la mascota. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // Al cambiar de especie, limpiar la raza seleccionada
  function handleSpeciesChange(species: PetSpecies) {
    setForm((prev) => ({ ...prev, species, breed: "" }));
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
              onChange={(e) =>
                handleSpeciesChange(e.target.value as PetSpecies)
              }
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
              onChange={(e) =>
                setForm({ ...form, sex: e.target.value as PetSex })
              }
            >
              <option value="male">Macho</option>
              <option value="female">Hembra</option>
            </select>
          </div>

          {/* Raza: select con razas de la API, fallback a input libre */}
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-semibold">
              Raza
              {breedsLoading && (
                <Loader2 className="ml-2 inline size-3 animate-spin text-muted-foreground" />
              )}
            </label>
            {breeds.length > 0 ? (
              <select
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.breed ?? ""}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
              >
                <option value="">Sin especificar</option>
                {breeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.weight_kg ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  weight_kg: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="Ej: 5.2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Fecha de nacimiento
            </label>
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
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Registrar mascota"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PetCard({ pet }: { pet: Pet }) {
  const photoUrl = safePhotoUrl(pet.photo_url);
  return (
    <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={pet.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary/10">
            <PawPrint className="size-6 text-primary" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-bold text-foreground">{pet.name}</p>
        <p className="text-sm text-muted-foreground">
          {speciesLabel(pet.species)}
          {pet.breed ? ` • ${pet.breed}` : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          {calcPetAge(pet.birth_date)}
        </p>
      </div>
    </div>
  );
}

function MyPetsCard({
  onAdd,
  onRequireAuth,
}: {
  onAdd: () => void;
  onRequireAuth: () => void;
}) {
  const { isAuthenticated } = useAuthContext();
  const { pets, loading, error } = usePets();

  if (!isAuthenticated) {
    return (
      <button
        onClick={onRequireAuth}
        className="group relative flex min-h-80 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-8 transition-all hover:border-primary hover:bg-muted/60"
      >
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Plus className="size-7" />
        </div>
        <span className="text-xl font-bold tracking-tight">
          Registrar nueva mascota
        </span>
        <span className="mt-2 text-sm text-muted-foreground">
          Inicia sesión para ver tus mascotas
        </span>
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-80 w-full flex-col items-center justify-center rounded-2xl border border-border bg-muted/40 p-8">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          Cargando mascotas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-80 w-full flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-8">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <button
        onClick={onAdd}
        className="group relative flex min-h-80 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-8 transition-all hover:border-primary hover:bg-muted/60"
      >
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Plus className="size-7" />
        </div>
        <span className="text-xl font-bold tracking-tight">
          Registrar nueva mascota
        </span>
        <span className="mt-2 text-sm text-muted-foreground">
          Aún no tienes mascotas registradas
        </span>
      </button>
    );
  }

  return (
    <div className="flex min-h-80 w-full flex-col rounded-2xl border border-border bg-muted/40 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">Mis mascotas</h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {pets.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="size-4" />
        Agregar mascota
      </button>
    </div>
  );
}

function PersonalizationCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border">
      <div>
        <div className="mb-6 text-primary">
          <SlidersHorizontal className="size-10" strokeWidth={1.5} />
        </div>
        <h3 className="mb-4 text-2xl font-bold">
          Personalizacion de Servicios
        </h3>
        <p className="leading-relaxed text-muted-foreground">
          Cada mascota es unica. Personalizamos el grooming basandonos en la
          raza, tipo de pelaje y necesidades especificas de salud de tu
          companero.
        </p>
      </div>
      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary/15">
            <Info className="size-4 text-secondary" />
          </div>
          <span className="text-sm font-semibold">Grooming Inteligente</span>
        </div>
      </div>
    </div>
  );
}

function PakuSpaCard() {
  return (
    <div className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl bg-primary p-8 shadow-xl transition-all active:scale-[0.98]">
      <Image
        src="/assets/pakuspa.png"
        alt="Mascota feliz en Paku Spa"
        fill
        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-primary/10 transition-colors group-hover:bg-primary/20" />
      <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-3xl transition-all group-hover:bg-white/20" />
      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <Sparkles
            className="size-9 text-primary-foreground"
            strokeWidth={1.5}
          />
          <ArrowUpRight className="size-6 text-primary-foreground/50 transition-opacity group-hover:opacity-100" />
        </div>
        <h3 className="mb-0 text-3xl font-extrabold tracking-tight text-primary-foreground">
          Paku Spa
        </h3>
        <p className="font-medium text-primary-foreground/80">
          {/* Accede a servicios premium de relajacion y cuidado estetico para tu mascota. */}
          Grooming inteligente
        </p>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-center rounded-full bg-white/20 px-6 py-4 font-bold text-lg text-primary-foreground backdrop-blur-md">
        Solicitar Servicio
      </div>
    </div>
  );
}

export function PetManagementSection() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { reload } = usePets();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {addModalOpen && (
        <AddPetModal
          onClose={() => setAddModalOpen(false)}
          onSuccess={reload}
        />
      )}
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab="register"
      />
      <header className="mb-12">
        <h2 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
          Pet Management
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Gestiona los perfiles de tus mascotas y descubre servicios diseñados
          específicamente para tus compañeros peludos.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <MyPetsCard
          onAdd={() => setAddModalOpen(true)}
          onRequireAuth={() => setAuthOpen(true)}
        />
        <PersonalizationCard />
        <PakuSpaCard />
      </div>
    </section>
  );
}
