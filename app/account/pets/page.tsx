"use client";

import React, { useState } from "react";
import {
  Loader2,
  Plus,
  PawPrint,
  Pencil,
  Trash2,
  Weight,
  Dog,
  Cat,
  Mars,
  Venus,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePets } from "@/hooks/usePets";
import { useBreeds } from "@/hooks/useBreeds";
import { useUploadPhoto } from "@/hooks/useUploadPhoto";
import { AvatarUploader } from "@/components/common/AvatarUploader";
import { petsService } from "@/lib/api/pets";
import type {
  Pet,
  CreatePetRequest,
  UpdatePetRequest,
  RecordWeightRequest,
} from "@/types/pets";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────────

function calcAge(birthDate?: string | null): string {
  if (!birthDate) return "";
  const diff = Date.now() - new Date(birthDate).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  if (years >= 1) return `${years} ${years === 1 ? "año" : "años"}`;
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  return `${months} ${months === 1 ? "mes" : "meses"}`;
}

function SpeciesIcon({
  species,
  className,
}: {
  species: string;
  className?: string;
}) {
  return species === "cat" ? (
    <Cat className={className} />
  ) : (
    <Dog className={className} />
  );
}

function SexIcon({ sex }: { sex?: string | null }) {
  if (sex === "male") return <Mars className="size-3 text-blue-500" />;
  if (sex === "female") return <Venus className="size-3 text-pink-500" />;
  return null;
}

// ── Formulario de mascota ──────────────────────────────────────────────────────

interface PetFormValues {
  name: string;
  species: "dog" | "cat";
  breed: string;
  sex: "male" | "female" | "";
  birth_date: string;
  weight_kg: string;
  notes: string;
}

const EMPTY_FORM: PetFormValues = {
  name: "",
  species: "dog",
  breed: "",
  sex: "",
  birth_date: "",
  weight_kg: "",
  notes: "",
};

function petToForm(pet: Pet): PetFormValues {
  return {
    name: pet.name,
    species: (pet.species as "dog" | "cat") ?? "dog",
    breed: pet.breed ?? "",
    sex: (pet.sex as "male" | "female") ?? "",
    birth_date: pet.birth_date ?? "",
    weight_kg: pet.weight_kg != null ? String(pet.weight_kg) : "",
    notes: pet.notes ?? "",
  };
}

interface PetFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pet?: Pet | null;
  /** Called after successful save with the pet id, so we can upload the photo */
  onSubmit: (data: CreatePetRequest | UpdatePetRequest) => Promise<Pet>;
  mutating: boolean;
}

function PetFormDialog({
  open,
  onOpenChange,
  pet,
  onSubmit,
  mutating,
}: PetFormDialogProps) {
  const isEdit = !!pet;
  const [form, setForm] = useState<PetFormValues>(
    pet ? petToForm(pet) : EMPTY_FORM,
  );
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { breeds, loading: breedsLoading } = useBreeds(form.species);
  const { uploadPhoto, isUploading } = useUploadPhoto();

  // Reset form cuando cambia la mascota o se abre
  React.useEffect(() => {
    if (open) {
      setForm(pet ? petToForm(pet) : EMPTY_FORM);
      setPhotoFile(null);
      setError(null);
    }
  }, [open, pet]);

  const set =
    (key: keyof PetFormValues) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setError(null);
    const payload: CreatePetRequest = {
      name: form.name.trim(),
      species: form.species,
      breed: form.breed || null,
      sex: (form.sex as "male" | "female") || null,
      birth_date: form.birth_date || null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      notes: form.notes || null,
    };
    try {
      const savedPet = await onSubmit(payload);
      // Subir foto si el usuario seleccionó una
      if (photoFile && savedPet?.id) {
        try {
          await uploadPhoto("pet", savedPet.id, photoFile);
        } catch {
          // La mascota ya se guardó; el fallo de foto no bloquea
          setError(
            "Mascota guardada, pero no se pudo subir la foto. Intenta de nuevo.",
          );
          return;
        }
      }
      onOpenChange(false);
    } catch {
      setError("No se pudo guardar la mascota. Intenta de nuevo.");
    }
  }

  const selectClass =
    "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            {isEdit ? "Editar mascota" : "Agregar mascota"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza la información de tu mascota."
              : "Ingresa los datos de tu nueva mascota."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          {/* Foto */}
          <div className="flex justify-center">
            <AvatarUploader
              currentUrl={pet?.photo_url ?? null}
              previewFile={photoFile}
              onFileSelect={setPhotoFile}
              isUploading={isUploading}
              disabled={mutating}
              size={88}
            />
          </div>

          {/* Nombre + Especie */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nombre *
              </label>
              <Input
                placeholder="Ej. Max"
                value={form.name}
                onChange={set("name")}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Especie *
              </label>
              <select
                value={form.species}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    species: e.target.value as "dog" | "cat",
                    breed: "",
                  }))
                }
                className={selectClass}
              >
                <option value="dog">Perro 🐶</option>
                <option value="cat">Gato 🐱</option>
              </select>
            </div>
          </div>

          {/* Raza + Sexo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Raza
                {breedsLoading && (
                  <Loader2 className="ml-1 inline size-3 animate-spin" />
                )}
              </label>
              {breeds.length > 0 ? (
                <select
                  className={selectClass}
                  value={form.breed}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, breed: e.target.value }))
                  }
                >
                  <option value="">Sin especificar</option>
                  {breeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="Ej. Labrador"
                  value={form.breed}
                  onChange={set("breed")}
                  disabled={breedsLoading}
                />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sexo
              </label>
              <select
                value={form.sex}
                onChange={set("sex")}
                className={selectClass}
              >
                <option value="">Sin especificar</option>
                <option value="male">Macho</option>
                <option value="female">Hembra</option>
              </select>
            </div>
          </div>

          {/* Fecha nacimiento + Peso */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fecha de nacimiento
              </label>
              <Input
                type="date"
                value={form.birth_date}
                onChange={set("birth_date")}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Peso (kg)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="Ej. 8.5"
                value={form.weight_kg}
                onChange={set("weight_kg")}
              />
            </div>
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Notas
            </label>
            <textarea
              placeholder="Alergias, condiciones especiales…"
              value={form.notes}
              onChange={set("notes")}
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutating || isUploading}
              className="gap-2"
            >
              {(mutating || isUploading) && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {isEdit ? "Guardar cambios" : "Agregar mascota"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog de peso ─────────────────────────────────────────────────────────────

interface WeightDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pet: Pet;
  onSuccess: () => void;
}

function WeightDialog({
  open,
  onOpenChange,
  pet,
  onSuccess,
}: WeightDialogProps) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  React.useEffect(() => {
    if (open) {
      setWeight("");
      setDate(new Date().toISOString().split("T")[0]);
      setFeedback(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) {
      setFeedback({ type: "error", msg: "Ingresa un peso válido." });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const payload: RecordWeightRequest = {
        weight_kg: parseFloat(weight),
        recorded_at: date,
      };
      await petsService.recordWeight(pet.id, payload);
      setFeedback({ type: "success", msg: "Peso registrado correctamente." });
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
      }, 1200);
    } catch {
      setFeedback({ type: "error", msg: "No se pudo registrar el peso." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            Registrar peso
          </DialogTitle>
          <DialogDescription>
            Registra el peso actual de <strong>{pet.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Peso (kg) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="8.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fecha
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
          {feedback && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border",
                feedback.type === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-destructive/10 text-destructive border-destructive/20",
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <AlertCircle className="size-4" />
              )}
              {feedback.msg}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Tarjeta de mascota ─────────────────────────────────────────────────────────

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (pet: Pet) => void;
  onWeight: (pet: Pet) => void;
  mutating: boolean;
}

function PetCard({ pet, onEdit, onDelete, onWeight, mutating }: PetCardProps) {
  const age = calcAge(pet.birth_date);
  const isDog = pet.species !== "cat";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-shadow hover:shadow-md">
      {/* Franja de color superior */}
      <div
        className={cn(
          "h-1.5 w-full",
          isDog
            ? "bg-linear-to-r from-primary to-secondary"
            : "bg-linear-to-r from-secondary to-tertiary",
        )}
      />

      <div className="p-4">
        {/* Avatar + info básica */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-sm",
              isDog
                ? "bg-primary/10 text-primary"
                : "bg-secondary/10 text-secondary",
            )}
          >
            <SpeciesIcon species={pet.species} className="size-7" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-extrabold tracking-tight text-foreground">
                {pet.name}
              </h3>
              <SexIcon sex={pet.sex} />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {pet.breed && (
                <span className="text-xs text-muted-foreground">
                  {pet.breed}
                </span>
              )}
              {age && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  {age}
                </span>
              )}
              {pet.weight_kg != null && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Weight className="size-3" />
                  {pet.weight_kg} kg
                </span>
              )}
            </div>

            {/* Badges de info */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                  isDog
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/10 text-secondary",
                )}
              >
                {isDog ? "Perro" : "Gato"}
              </span>
              {pet.sterilized && (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-700">
                  Esterilizado
                </span>
              )}
              {pet.vaccines_up_to_date && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-700">
                  Vacunas al día
                </span>
              )}
            </div>

            {pet.notes && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {pet.notes}
              </p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-xs"
            onClick={() => onWeight(pet)}
            disabled={mutating}
          >
            <Weight className="size-3" />
            Peso
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 text-xs"
            onClick={() => onEdit(pet)}
            disabled={mutating}
          >
            <Pencil className="size-3" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(pet)}
            disabled={mutating}
          >
            <Trash2 className="size-3" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Dialog de confirmación de eliminación ──────────────────────────────────────

function ConfirmDeleteDialog({
  pet,
  onConfirm,
  onCancel,
  loading,
}: {
  pet: Pet | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={!!pet} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            ¿Eliminar a {pet?.name}?
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminarán todos los datos de{" "}
            <strong>{pet?.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Sí, eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Estado vacío ───────────────────────────────────────────────────────────────

function EmptyPets({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-muted/30 py-16 px-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-linear-to-br from-primary/10 via-secondary/5 to-tertiary/10">
        <PawPrint className="size-10 text-primary/50" />
      </div>
      <div>
        <p className="text-lg font-extrabold tracking-tight text-foreground">
          Aún no tienes mascotas
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Agrega a tus compañeros para gestionar sus servicios fácilmente.
        </p>
      </div>
      <Button onClick={onAdd} className="gap-2">
        <Plus className="size-4" />
        Agregar primera mascota
      </Button>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function PetsPage() {
  const {
    pets,
    loading,
    mutating,
    error,
    reload,
    createPet,
    updatePet,
    deletePet,
  } = usePets();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [weightPet, setWeightPet] = useState<Pet | null>(null);

  function handleEdit(pet: Pet) {
    setEditingPet(pet);
    setFormOpen(true);
  }

  function handleAddNew() {
    setEditingPet(null);
    setFormOpen(true);
  }

  async function handleFormSubmit(
    data: CreatePetRequest | UpdatePetRequest,
  ): Promise<Pet> {
    if (editingPet) {
      return await updatePet(editingPet.id, data as UpdatePetRequest);
    } else {
      return await createPet(data as CreatePetRequest);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingPet) return;
    setDeleteLoading(true);
    try {
      await deletePet(deletingPet.id);
    } finally {
      setDeleteLoading(false);
      setDeletingPet(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Mis mascotas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona la información de tus compañeros peludos.
          </p>
        </div>
        {pets.length > 0 && (
          <Button onClick={handleAddNew} className="shrink-0 gap-2">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        )}
      </div>

      {/* Error global */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border/60 bg-background p-4"
            >
              <div className="flex gap-4">
                <div className="size-14 animate-pulse rounded-2xl bg-muted" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : pets.length === 0 ? (
        <EmptyPets onAdd={handleAddNew} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onEdit={handleEdit}
              onDelete={setDeletingPet}
              onWeight={setWeightPet}
              mutating={mutating}
            />
          ))}
        </div>
      )}

      {/* Badge de conteo */}
      {!loading && pets.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {pets.length}{" "}
          {pets.length === 1 ? "mascota registrada" : "mascotas registradas"}
        </p>
      )}

      {/* Dialogs */}
      <PetFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingPet(null);
        }}
        pet={editingPet}
        onSubmit={handleFormSubmit}
        mutating={mutating}
      />

      <ConfirmDeleteDialog
        pet={deletingPet}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPet(null)}
        loading={deleteLoading}
      />

      {weightPet && (
        <WeightDialog
          open={!!weightPet}
          onOpenChange={(v) => {
            if (!v) setWeightPet(null);
          }}
          pet={weightPet}
          onSuccess={reload}
        />
      )}
    </div>
  );
}
