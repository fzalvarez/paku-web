"use client";

import { useState } from "react";
import Image from "next/image";
import { PawPrint, PlusCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePets } from "@/hooks/usePets";
import { useBreeds } from "@/hooks/useBreeds";
import { petsService } from "@/lib/api/pets";
import { useUploadPhoto } from "@/hooks/useUploadPhoto";
import { AvatarUploader } from "@/components/common/AvatarUploader";
import { calcPetAge, speciesLabel, safePhotoUrl } from "@/lib/utils/pets";
import { WizardNavButtons } from "./WizardLayout";
import type { Pet, CreatePetRequest, PetSpecies, PetSex } from "@/types/pets";

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
      // Subir foto si el usuario seleccionó una
      if (photoFile && newPet?.id) {
        try {
          await uploadPhoto("pet", newPet.id, photoFile);
        } catch {
          // La mascota ya se creó; el fallo de foto no bloquea el flujo
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
        {/* Foto */}
        <div className="mb-2 flex justify-center">
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
                placeholder="Ej: Labrador"
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
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="mx-auto size-4 animate-spin" />
            ) : (
              "Registrar mascota"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Paso 1 ─────────────────────────────────────────────────────────────────────

interface StepSelectPetProps {
  selectedPetId: string | null;
  onSelectPet: (petId: string, pet: Pet) => void;
  onNext: () => void;
}

export function StepSelectPet({
  selectedPetId,
  onSelectPet,
  onNext,
}: StepSelectPetProps) {
  const { pets, loading, error, reload } = usePets();
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div>
      {addModalOpen && (
        <AddPetModal
          onClose={() => setAddModalOpen(false)}
          onSuccess={reload}
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">
          ¿Para qué mascota es el servicio?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecciona la mascota que recibirá el servicio.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-wrap gap-4">
          {pets.map((pet) => {
            const isSelected = pet.id === selectedPetId;
            const photoUrl = safePhotoUrl(pet.photo_url);
            return (
              <button
                key={pet.id}
                onClick={() => onSelectPet(pet.id, pet)}
                className={cn(
                  "w-40 rounded-2xl bg-card p-4 text-center transition-all",
                  isSelected
                    ? "border-2 border-primary ring-4 ring-primary/10 shadow-md"
                    : "border-2 border-transparent shadow-sm hover:shadow-md hover:border-primary/30",
                )}
              >
                <div
                  className={cn(
                    "relative mx-auto mb-3 size-20 overflow-hidden rounded-full ring-4 transition-all",
                    isSelected ? "ring-primary/20" : "ring-muted",
                  )}
                >
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
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
                <h4 className="font-bold leading-tight">{pet.name}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
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
            className="flex w-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-4 transition-colors hover:border-primary hover:text-primary"
          >
            <PlusCircle className="size-8 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">
              Nueva mascota
            </span>
          </button>
        </div>
      )}

      <WizardNavButtons
        canGoBack={false}
        onNext={onNext}
        nextDisabled={!selectedPetId}
        nextLabel="Continuar"
      />
    </div>
  );
}
