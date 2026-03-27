"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiCallError } from "@/lib/api/client";
import type { AddressOut, AddressCreateIn } from "@/types/api";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface AddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si se pasa, el formulario opera en modo edición */
  address?: AddressOut | null;
  onSubmit: (payload: AddressCreateIn) => Promise<void>;
}

const EMPTY_FORM: AddressCreateIn = {
  district_id: "",
  address_line: "",
  lat: 0,
  lng: 0,
  reference: "",
  building_number: "",
  apartment_number: "",
  label: "",
  type: "",
  is_default: false,
};

// ── Componente ────────────────────────────────────────────────────────────────

export function AddressFormDialog({ open, onOpenChange, address, onSubmit }: AddressFormProps) {
  const isEdit = !!address;
  const [form, setForm] = useState<AddressCreateIn>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rellenar form cuando se abre en modo edición
  useEffect(() => {
    if (address) {
      setForm({
        district_id: address.district_id,
        address_line: address.address_line,
        lat: address.lat,
        lng: address.lng,
        reference: address.reference ?? "",
        building_number: address.building_number ?? "",
        apartment_number: address.apartment_number ?? "",
        label: address.label ?? "",
        type: address.type ?? "",
        is_default: address.is_default,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [address, open]);

  function set<K extends keyof AddressCreateIn>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = key === "lat" || key === "lng"
        ? parseFloat(e.target.value) || 0
        : key === "is_default"
        ? e.target.checked
        : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validación básica en cliente
    if (!form.district_id.trim()) { setError("El ID de distrito es obligatorio."); return; }
    if (!form.address_line.trim()) { setError("La dirección es obligatoria."); return; }
    if (!form.lat || !form.lng) { setError("Las coordenadas (lat/lng) son obligatorias."); return; }

    setLoading(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiCallError) {
        if (err.status === 422) setError("Distrito inválido o datos incorrectos. Verifica el ID de distrito y las coordenadas.");
        else if (err.status === 401) setError("Tu sesión ha expirado. Vuelve a iniciar sesión.");
        else setError(err.message ?? "Error inesperado.");
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar dirección" : "Nueva dirección"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los campos que desees actualizar."
              : "Completa los datos de tu nueva dirección."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">

          {/* Dirección + Distrito */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">ID de distrito *</label>
              <Input
                placeholder="Ej: LIMA-LIMA-MIRAFLORES"
                value={form.district_id}
                onChange={set("district_id")}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Etiqueta</label>
              <Input
                placeholder="Casa, Trabajo…"
                value={form.label}
                onChange={set("label")}
              />
            </div>
          </div>

          {/* Línea de dirección */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Dirección *</label>
            <Input
              placeholder="Av. Principal 123"
              value={form.address_line}
              onChange={set("address_line")}
              required
            />
          </div>

          {/* Coordenadas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Latitud *</label>
              <Input
                type="number"
                step="any"
                placeholder="-12.052"
                value={form.lat || ""}
                onChange={set("lat")}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Longitud *</label>
              <Input
                type="number"
                step="any"
                placeholder="-76.987"
                value={form.lng || ""}
                onChange={set("lng")}
                required
              />
            </div>
          </div>

          {/* Referencia */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Referencia</label>
            <Input
              placeholder="Frente al parque, edificio azul…"
              value={form.reference}
              onChange={set("reference")}
            />
          </div>

          {/* Edificio + Dpto */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">N° edificio</label>
              <Input
                placeholder="Torre A"
                value={form.building_number}
                onChange={set("building_number")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">N° departamento</label>
              <Input
                placeholder="Piso 3, Dpto 302"
                value={form.apartment_number}
                onChange={set("apartment_number")}
              />
            </div>
          </div>

          {/* Is default */}
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={set("is_default")}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Marcar como dirección predeterminada
          </label>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Agregar dirección"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
