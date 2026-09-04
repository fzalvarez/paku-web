"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Pencil,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Dog,
  Cat,
  Mars,
  Venus,
  Calendar,
  Weight,
  Syringe,
  Scissors,
  ShieldCheck,
  Leaf,
  Wind,
  Activity,
  Clock,
  Bug,
  Sparkles,
  User,
  Plus,
  ChevronRight,
  TrendingUp,
  Info,
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
import { petsService } from "@/lib/api/pets";
import { useBreeds } from "@/hooks/useBreeds";
import { useUploadPhoto } from "@/hooks/useUploadPhoto";
import { AvatarUploader } from "@/components/common/AvatarUploader";
import { safePhotoUrl } from "@/lib/utils/pets";
import { cn } from "@/lib/utils";
import type {
  Pet,
  UpdatePetRequest,
  PatchPetOptionalRequest,
  WeightRecord,
  RecordWeightRequest,
  PetSize,
  PetCoatType,
  PetActivityLevel,
  PetBathBehavior,
  PetAntiparasiticInterval,
} from "@/types/pets";

// ── Helpers ────────────────────────────────────────────────────────────────────

function calcAge(birthDate?: string | null): string {
  if (!birthDate) return "";
  const diff = Date.now() - new Date(birthDate).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  if (years >= 1) return `${years} ${years === 1 ? "año" : "años"}`;
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  return `${months} ${months === 1 ? "mes" : "meses"}`;
}

function formatDate(iso?: string | null) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const SIZE_LABEL: Record<PetSize, string> = {
  small: "Pequeño",
  medium: "Mediano",
  large: "Grande",
};

const COAT_LABEL: Record<PetCoatType, string> = {
  short: "Pelo corto",
  medium: "Pelo medio",
  long: "Pelo largo",
};

const ACTIVITY_LABEL: Record<PetActivityLevel, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const BATH_LABEL: Record<PetBathBehavior, string> = {
  calm: "Tranquilo",
  fearful: "Miedoso",
  anxious: "Ansioso",
};

const ANTIPARASITIC_LABEL: Record<PetAntiparasiticInterval, string> = {
  monthly: "Mensual",
  trimestral: "Trimestral",
};

// ── Sección de perfil — campo individual ──────────────────────────────────────

function ProfileField({
  label,
  value,
  icon: Icon,
  empty,
}: {
  label: string;
  value?: string | null;
  icon: React.ElementType;
  empty?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors", empty ? "bg-muted/30" : "bg-muted/50")}>
      <div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", empty ? "bg-muted text-muted-foreground/50" : "bg-primary/10 text-primary")}>
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {empty ? (
          <p className="text-sm italic text-muted-foreground/60">Sin completar</p>
        ) : (
          <p className="text-sm font-semibold text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}

// ── Dialog de edición básica ───────────────────────────────────────────────────

interface EditBasicDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pet: Pet;
  onSaved: (pet: Pet) => void;
  /** Se llama tras confirmar la foto en el bucket, para traer la mascota
   * de nuevo con photo_url ya firmada (el PUT anterior no la trae aún). */
  onPhotoUploaded: () => void | Promise<void>;
}

function EditBasicDialog({ open, onOpenChange, pet, onSaved, onPhotoUploaded }: EditBasicDialogProps) {
  const [form, setForm] = useState<{
    name: string;
    breed: string;
    sex: "male" | "female" | "";
    birth_date: string;
    notes: string;
  }>({
    name: pet.name,
    breed: pet.breed ?? "",
    sex: (pet.sex as "male" | "female") ?? "",
    birth_date: pet.birth_date ?? "",
    notes: pet.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { breeds, loading: breedsLoading } = useBreeds(pet.species as "dog" | "cat");
  const { uploadPhoto, isUploading } = useUploadPhoto();

  useEffect(() => {
    if (open) {
      setForm({
        name: pet.name,
        breed: pet.breed ?? "",
        sex: (pet.sex as "male" | "female") ?? "",
        birth_date: pet.birth_date ?? "",
        notes: pet.notes ?? "",
      });
      setPhotoFile(null);
      setError(null);
    }
  }, [open, pet]);

  const selectCls = "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("El nombre es obligatorio."); return; }
    setError(null);
    setLoading(true);
    try {
      const payload: UpdatePetRequest = {
        name: form.name.trim(),
        breed: form.breed || null,
        sex: (form.sex as "male" | "female") || null,
        birth_date: form.birth_date || null,
        notes: form.notes || null,
      };
      const updated = await petsService.update(pet.id, payload);
      let photoRefreshed = false;
      if (photoFile) {
        try {
          await uploadPhoto("pet", updated.id, photoFile);
          // El PUT de arriba no trae photo_url todavía — recién existe
          // después de confirmar la subida, así que se pide la mascota de
          // nuevo para traerla ya firmada. onSaved(updated) de abajo usa
          // el objeto viejo sin foto, así que si esto funcionó lo saltamos
          // para no pisar el estado recién refrescado.
          await onPhotoUploaded();
          photoRefreshed = true;
        } catch { /* no bloquea */ }
      }
      if (!photoRefreshed) onSaved(updated);
      onOpenChange(false);
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">Editar información básica</DialogTitle>
          <DialogDescription>Actualiza los datos de {pet.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <div className="flex justify-center">
            <AvatarUploader
              currentUrl={pet.photo_url ?? null}
              previewFile={photoFile}
              onFileSelect={setPhotoFile}
              isUploading={isUploading}
              disabled={loading}
              size={88}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nombre *</label>
              <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sexo</label>
              <select value={form.sex} onChange={(e) => setForm(p => ({ ...p, sex: e.target.value as "male" | "female" | "" }))} className={selectCls}>
                <option value="">Sin especificar</option>
                <option value="male">Macho</option>
                <option value="female">Hembra</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Raza {breedsLoading && <Loader2 className="ml-1 inline size-3 animate-spin" />}
            </label>
            {breeds.length > 0 ? (
              <select value={form.breed} onChange={(e) => setForm(p => ({ ...p, breed: e.target.value }))} className={selectCls}>
                <option value="">Sin especificar</option>
                {breeds.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            ) : (
              <Input placeholder="Ej. Labrador" value={form.breed} onChange={(e) => setForm(p => ({ ...p, breed: e.target.value }))} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fecha de nacimiento</label>
              <Input type="date" value={form.birth_date} onChange={(e) => setForm(p => ({ ...p, birth_date: e.target.value }))} max={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notas</label>
            <textarea
              placeholder="Alergias, condiciones especiales…"
              value={form.notes}
              onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />{error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading || isUploading} className="gap-2">
              {(loading || isUploading) && <Loader2 className="size-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog de perfil de grooming ──────────────────────────────────────────────

interface EditGroomingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pet: Pet;
  onSaved: (pet: Pet) => void;
}

function EditGroomingDialog({ open, onOpenChange, pet, onSaved }: EditGroomingDialogProps) {
  const [form, setForm] = useState<PatchPetOptionalRequest>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        weight_kg: pet.weight_kg ?? undefined,
        size: pet.size ?? undefined,
        coat_type: pet.coat_type ?? undefined,
        sterilized: pet.sterilized ?? undefined,
        vaccines_up_to_date: pet.vaccines_up_to_date ?? undefined,
        activity_level: pet.activity_level ?? undefined,
        skin_sensitivity: pet.skin_sensitivity ?? undefined,
        bath_behavior: pet.bath_behavior ?? undefined,
        tolerates_drying: pet.tolerates_drying ?? undefined,
        tolerates_nail_clipping: pet.tolerates_nail_clipping ?? undefined,
        receive_reminders: pet.receive_reminders ?? undefined,
        antiparasitic: pet.antiparasitic ?? undefined,
        antiparasitic_interval: pet.antiparasitic_interval ?? undefined,
        special_shampoo: pet.special_shampoo ?? undefined,
      });
      setError(null);
    }
  }, [open, pet]);

  const selectCls = "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

  function BoolSelect({ label, fieldKey }: { label: string; fieldKey: keyof PatchPetOptionalRequest }) {
    const val = form[fieldKey];
    const strVal = val === true ? "true" : val === false ? "false" : "";
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
        <select
          value={strVal}
          onChange={(e) => setForm(p => ({
            ...p,
            [fieldKey]: e.target.value === "" ? undefined : e.target.value === "true",
          }))}
          className={selectCls}
        >
          <option value="">Sin especificar</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Filtrar undefined para no sobreescribir con null innecesariamente
      const payload: PatchPetOptionalRequest = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== undefined)
      );
      const updated = await petsService.patchOptional(pet.id, payload);
      onSaved(updated);
      onOpenChange(false);
    } catch {
      setError("No se pudo guardar el perfil. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">Perfil de grooming</DialogTitle>
          <DialogDescription>
            Esta información ayuda a ofrecer un servicio más personalizado para {pet.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-5">
          {/* Físico */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Físico</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Peso (kg)</label>
                <Input
                  type="number" step="0.1" min="0" placeholder="Ej. 8.5"
                  value={form.weight_kg ?? ""}
                  onChange={(e) => setForm(p => ({ ...p, weight_kg: e.target.value ? parseFloat(e.target.value) : undefined }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tamaño</label>
                <select value={form.size ?? ""} onChange={(e) => setForm(p => ({ ...p, size: (e.target.value || undefined) as PetSize | undefined }))} className={selectCls}>
                  <option value="">Sin especificar</option>
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo de pelo</label>
                <select value={form.coat_type ?? ""} onChange={(e) => setForm(p => ({ ...p, coat_type: (e.target.value || undefined) as PetCoatType | undefined }))} className={selectCls}>
                  <option value="">Sin especificar</option>
                  <option value="short">Corto</option>
                  <option value="medium">Medio</option>
                  <option value="long">Largo</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nivel de actividad</label>
                <select value={form.activity_level ?? ""} onChange={(e) => setForm(p => ({ ...p, activity_level: (e.target.value || undefined) as PetActivityLevel | undefined }))} className={selectCls}>
                  <option value="">Sin especificar</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salud */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Salud</p>
            <div className="grid grid-cols-2 gap-3">
              <BoolSelect label="Esterilizado/a" fieldKey="sterilized" />
              <BoolSelect label="Vacunas al día" fieldKey="vaccines_up_to_date" />
              <BoolSelect label="Antiparasitario" fieldKey="antiparasitic" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Frecuencia antiparasitario</label>
                <select value={form.antiparasitic_interval ?? ""} onChange={(e) => setForm(p => ({ ...p, antiparasitic_interval: (e.target.value || undefined) as PetAntiparasiticInterval | undefined }))} className={selectCls}>
                  <option value="">Sin especificar</option>
                  <option value="monthly">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                </select>
              </div>
              <BoolSelect label="Piel sensible" fieldKey="skin_sensitivity" />
              <BoolSelect label="Shampoo especial" fieldKey="special_shampoo" />
            </div>
          </div>

          {/* Comportamiento en grooming */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Comportamiento en grooming</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comportamiento en el baño</label>
                <select value={form.bath_behavior ?? ""} onChange={(e) => setForm(p => ({ ...p, bath_behavior: (e.target.value || undefined) as PetBathBehavior | undefined }))} className={selectCls}>
                  <option value="">Sin especificar</option>
                  <option value="calm">Tranquilo</option>
                  <option value="fearful">Miedoso</option>
                  <option value="anxious">Ansioso</option>
                </select>
              </div>
              <BoolSelect label="Tolera el secado" fieldKey="tolerates_drying" />
              <BoolSelect label="Tolera corte de uñas" fieldKey="tolerates_nail_clipping" />
            </div>
          </div>

          {/* Preferencias */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Preferencias</p>
            <div className="grid grid-cols-2 gap-3">
              <BoolSelect label="Recibir recordatorios" fieldKey="receive_reminders" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />{error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Guardar perfil
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog de peso ─────────────────────────────────────────────────────────────

function WeightDialog({ open, onOpenChange, pet, onSuccess }: { open: boolean; onOpenChange: (v: boolean) => void; pet: Pet; onSuccess: () => void }) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (open) { setWeight(""); setDate(new Date().toISOString().split("T")[0]); setFeedback(null); }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) { setFeedback({ type: "error", msg: "Ingresa un peso válido." }); return; }
    setLoading(true);
    try {
      const payload: RecordWeightRequest = { weight_kg: parseFloat(weight), recorded_at: date };
      await petsService.recordWeight(pet.id, payload);
      setFeedback({ type: "success", msg: "Peso registrado correctamente." });
      setTimeout(() => { onOpenChange(false); onSuccess(); }, 1200);
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
          <DialogTitle className="text-xl font-extrabold">Registrar peso</DialogTitle>
          <DialogDescription>Registra el peso actual de <strong>{pet.name}</strong>.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Peso (kg) *</label>
              <Input type="number" step="0.1" min="0" placeholder="8.5" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fecha</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          {feedback && (
            <div className={cn("flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border", feedback.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-destructive/10 text-destructive border-destructive/20")}>
              {feedback.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
              {feedback.msg}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────

export default function PetProfilePage() {
  const params = useParams();
  const router = useRouter();
  const petId = params?.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editBasicOpen, setEditBasicOpen] = useState(false);
  const [editGroomingOpen, setEditGroomingOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);

  const loadPet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [petData, history] = await Promise.all([
        petsService.detail(petId),
        petsService.weightHistory(petId).catch(() => [] as WeightRecord[]),
      ]);
      setPet(petData);
      setWeightHistory(history);
    } catch {
      setError("No se pudo cargar la mascota.");
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => { loadPet(); }, [loadPet]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="size-10 text-destructive/50" />
        <p className="font-semibold text-foreground">{error ?? "Mascota no encontrada"}</p>
        <Button variant="outline" onClick={() => router.push("/account/pets")}>
          <ArrowLeft className="mr-2 size-4" /> Volver a mis mascotas
        </Button>
      </div>
    );
  }

  const photoUrl = safePhotoUrl(pet.photo_url);
  const isDog = pet.species !== "cat";
  const age = calcAge(pet.birth_date);

  // Calcular completitud del perfil de grooming
  const groomingFields: Array<{ key: keyof Pet; label: string }> = [
    { key: "weight_kg", label: "Peso" },
    { key: "size", label: "Tamaño" },
    { key: "coat_type", label: "Tipo de pelo" },
    { key: "activity_level", label: "Nivel de actividad" },
    { key: "sterilized", label: "Esterilización" },
    { key: "vaccines_up_to_date", label: "Vacunas" },
    { key: "antiparasitic", label: "Antiparasitario" },
    { key: "skin_sensitivity", label: "Piel sensible" },
    { key: "bath_behavior", label: "Comportamiento en baño" },
    { key: "tolerates_drying", label: "Tolera secado" },
    { key: "tolerates_nail_clipping", label: "Tolera uñas" },
    { key: "special_shampoo", label: "Shampoo especial" },
    { key: "receive_reminders", label: "Recordatorios" },
  ];
  const filled = groomingFields.filter((f) => pet[f.key] !== null && pet[f.key] !== undefined).length;
  const total = groomingFields.length;
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/account/pets" className="flex items-center gap-1.5 transition-colors hover:text-primary">
          <ArrowLeft className="size-3.5" />
          Mis mascotas
        </Link>
        <ChevronRight className="size-3" />
        <span className="font-semibold text-foreground">{pet.name}</span>
      </nav>

      {/* ── Cabecera de perfil ── */}
      <div className={cn("relative overflow-hidden rounded-3xl p-6 md:p-8", isDog ? "bg-linear-to-br from-primary/10 via-primary/5 to-transparent" : "bg-linear-to-br from-secondary/10 via-secondary/5 to-transparent")}>
        {/* Círculo decorativo */}
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          {/* Foto */}
          <div className="shrink-0">
            <div className={cn("relative flex size-24 items-center justify-center overflow-hidden rounded-3xl shadow-lg ring-4", isDog ? "ring-primary/20" : "ring-secondary/20")}>
              {photoUrl ? (
                <Image src={photoUrl} alt={`Foto de ${pet.name}`} fill className="object-cover" sizes="96px" />
              ) : (
                <div className={cn("flex size-full items-center justify-center", isDog ? "bg-primary/10" : "bg-secondary/10")}>
                  {isDog ? <Dog className={cn("size-10", isDog ? "text-primary" : "text-secondary")} /> : <Cat className="size-10 text-secondary" />}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{pet.name}</h1>
              {pet.sex === "male" && <Mars className="size-5 text-blue-500" />}
              {pet.sex === "female" && <Venus className="size-5 text-pink-500" />}
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest", isDog ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary")}>
                {isDog ? "Perro" : "Gato"}
              </span>
              {pet.sterilized && <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-green-700">Esterilizado/a</span>}
              {pet.vaccines_up_to_date && <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-blue-700">Vacunas al día</span>}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {pet.breed && <span className="font-medium">{pet.breed}</span>}
              {age && <span className="flex items-center gap-1.5"><Calendar className="size-3.5" />{age}</span>}
              {pet.weight_kg != null && <span className="flex items-center gap-1.5"><Weight className="size-3.5" />{pet.weight_kg} kg</span>}
            </div>

            {pet.notes && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground italic">&ldquo;{pet.notes}&rdquo;</p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setWeightOpen(true)}>
              <Weight className="size-3.5" /> Peso
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setEditBasicOpen(true)}>
              <Pencil className="size-3.5" /> Editar
            </Button>
          </div>
        </div>
      </div>

      {/* ── Grid principal ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Columna izquierda: info básica ── */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Info básica */}
          <div className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-foreground">Información básica</h2>
            <div className="flex flex-col gap-2">
              <ProfileField label="Especie" icon={isDog ? Dog : Cat} value={isDog ? "Perro" : "Gato"} />
              <ProfileField label="Raza" icon={User} value={pet.breed} empty={!pet.breed} />
              <ProfileField label="Sexo" icon={pet.sex === "female" ? Venus : Mars} value={pet.sex === "male" ? "Macho" : pet.sex === "female" ? "Hembra" : null} empty={!pet.sex} />
              <ProfileField label="Fecha de nacimiento" icon={Calendar} value={formatDate(pet.birth_date)} empty={!pet.birth_date} />
              {age && <ProfileField label="Edad" icon={Clock} value={age} />}
            </div>
          </div>

          {/* Historial de peso */}
          <div className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">Historial de peso</h2>
              <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => setWeightOpen(true)}>
                <Plus className="size-3" /> Registrar
              </Button>
            </div>
            {weightHistory.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/40 py-6 text-center">
                <TrendingUp className="size-7 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Sin registros de peso aún</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {weightHistory.slice(0, 6).map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.recorded_at).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="text-sm font-bold text-foreground">{entry.weight_kg} kg</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Columna derecha: perfil de grooming ── */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Completitud */}
          <div className={cn("rounded-2xl p-5", pct === 100 ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200")}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl", pct === 100 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                  {pct === 100 ? <CheckCircle2 className="size-4" /> : <Info className="size-4" />}
                </div>
                <div>
                  <p className={cn("text-sm font-extrabold", pct === 100 ? "text-green-800" : "text-amber-800")}>
                    {pct === 100 ? "¡Perfil completo!" : `Perfil ${pct}% completado`}
                  </p>
                  <p className={cn("text-xs mt-0.5", pct === 100 ? "text-green-700" : "text-amber-700")}>
                    {pct === 100
                      ? "Tenemos toda la información para personalizar el servicio de grooming."
                      : `Completa ${total - filled} campo${total - filled !== 1 ? "s" : ""} más para que podamos personalizar mejor el servicio.`}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className={cn("shrink-0 gap-1.5 text-xs", pct === 100 ? "border-green-300 hover:bg-green-100" : "border-amber-300 hover:bg-amber-100")}
                onClick={() => setEditGroomingOpen(true)}
              >
                <Pencil className="size-3" />
                {pct === 100 ? "Editar" : "Completar"}
              </Button>
            </div>
            {/* Barra de progreso */}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
              <div
                className={cn("h-full rounded-full transition-all duration-500", pct === 100 ? "bg-green-500" : "bg-amber-500")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className={cn("mt-1.5 text-right text-[11px] font-semibold", pct === 100 ? "text-green-600" : "text-amber-600")}>
              {filled}/{total} campos
            </p>
          </div>

          {/* Físico */}
          <div className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-foreground">Físico</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ProfileField label="Peso actual" icon={Weight} value={pet.weight_kg != null ? `${pet.weight_kg} kg` : null} empty={pet.weight_kg == null} />
              <ProfileField label="Tamaño" icon={Activity} value={pet.size ? SIZE_LABEL[pet.size as PetSize] : null} empty={!pet.size} />
              <ProfileField label="Tipo de pelo" icon={Scissors} value={pet.coat_type ? COAT_LABEL[pet.coat_type as PetCoatType] : null} empty={!pet.coat_type} />
              <ProfileField label="Nivel de actividad" icon={Sparkles} value={pet.activity_level ? ACTIVITY_LABEL[pet.activity_level as PetActivityLevel] : null} empty={!pet.activity_level} />
            </div>
          </div>

          {/* Salud */}
          <div className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-foreground">Salud</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ProfileField label="Esterilizado/a" icon={ShieldCheck} value={pet.sterilized === true ? "Sí" : pet.sterilized === false ? "No" : null} empty={pet.sterilized == null} />
              <ProfileField label="Vacunas al día" icon={Syringe} value={pet.vaccines_up_to_date === true ? "Sí" : pet.vaccines_up_to_date === false ? "No" : null} empty={pet.vaccines_up_to_date == null} />
              <ProfileField label="Antiparasitario" icon={Bug} value={pet.antiparasitic === true ? "Sí" : pet.antiparasitic === false ? "No" : null} empty={pet.antiparasitic == null} />
              <ProfileField label="Frecuencia antiparasitario" icon={Clock} value={pet.antiparasitic_interval ? ANTIPARASITIC_LABEL[pet.antiparasitic_interval as PetAntiparasiticInterval] : null} empty={!pet.antiparasitic_interval} />
              <ProfileField label="Piel sensible" icon={Leaf} value={pet.skin_sensitivity === true ? "Sí" : pet.skin_sensitivity === false ? "No" : null} empty={pet.skin_sensitivity == null} />
              <ProfileField label="Shampoo especial" icon={Sparkles} value={pet.special_shampoo === true ? "Sí" : pet.special_shampoo === false ? "No" : null} empty={pet.special_shampoo == null} />
            </div>
          </div>

          {/* Comportamiento */}
          <div className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-foreground">Comportamiento en grooming</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ProfileField label="En el baño" icon={Wind} value={pet.bath_behavior ? BATH_LABEL[pet.bath_behavior as PetBathBehavior] : null} empty={!pet.bath_behavior} />
              <ProfileField label="Tolera el secado" icon={Wind} value={pet.tolerates_drying === true ? "Sí" : pet.tolerates_drying === false ? "No" : null} empty={pet.tolerates_drying == null} />
              <ProfileField label="Tolera corte de uñas" icon={Scissors} value={pet.tolerates_nail_clipping === true ? "Sí" : pet.tolerates_nail_clipping === false ? "No" : null} empty={pet.tolerates_nail_clipping == null} />
              <ProfileField label="Recordatorios activos" icon={Clock} value={pet.receive_reminders === true ? "Sí" : pet.receive_reminders === false ? "No" : null} empty={pet.receive_reminders == null} />
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <EditBasicDialog open={editBasicOpen} onOpenChange={setEditBasicOpen} pet={pet} onSaved={(updated) => setPet(updated)} onPhotoUploaded={loadPet} />
      <EditGroomingDialog open={editGroomingOpen} onOpenChange={setEditGroomingOpen} pet={pet} onSaved={(updated) => setPet(updated)} />
      <WeightDialog open={weightOpen} onOpenChange={setWeightOpen} pet={pet} onSuccess={loadPet} />
    </div>
  );
}
