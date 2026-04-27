"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiCallError } from "@/lib/api/client";
import { useDistricts } from "@/hooks/useDistricts";
import { LocationPickerMap } from "@/components/common/LocationPickerMap";
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

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  onSubmit,
}: AddressFormProps) {
  const isEdit = !!address;
  const [form, setForm] = useState<AddressCreateIn>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { districts, loading: loadingDistricts } = useDistricts();

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

  function setField<K extends keyof AddressCreateIn>(
    key: K,
    value: AddressCreateIn[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleInputChange<K extends keyof AddressCreateIn>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        key === "is_default"
          ? (e.target.checked as AddressCreateIn[K])
          : (e.target.value as AddressCreateIn[K]);
      setField(key, value);
    };
  }

  // Callback estable para el mapa
  const handleMapChange = useCallback((lat: number, lng: number) => {
    setForm((prev) => ({ ...prev, lat, lng }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.district_id) {
      setError("Selecciona un distrito.");
      return;
    }
    if (!form.address_line.trim()) {
      setError("La dirección es obligatoria.");
      return;
    }
    if (!form.lat || !form.lng) {
      setError("Marca tu ubicación en el mapa.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiCallError) {
        if (err.status === 422)
          setError("Datos incorrectos. Verifica los campos.");
        else if (err.status === 401)
          setError("Tu sesión ha expirado. Vuelve a iniciar sesión.");
        else setError(err.message ?? "Error inesperado.");
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  const hasPin = !!form.lat && !!form.lng;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar dirección" : "Nueva dirección"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los campos que desees actualizar."
              : "Completa los datos de tu nueva dirección."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {/* ── Distrito + Etiqueta ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Distrito *
              </label>
              <Select
                value={form.district_id}
                onValueChange={(value) => setField("district_id", value)}
                disabled={loadingDistricts}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingDistricts ? "Cargando…" : "Selecciona un distrito"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Etiqueta
              </label>
              <Input
                placeholder="Casa, Trabajo…"
                value={form.label}
                onChange={handleInputChange("label")}
              />
            </div>
          </div>

          {/* ── Mapa ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Ubicación en el mapa *
            </label>
            <div className="relative h-56 w-full overflow-hidden rounded-md border border-input bg-muted">
              {open && (
                <LocationPickerMap
                  lat={form.lat}
                  lng={form.lng}
                  onChange={handleMapChange}
                  className="h-full"
                />
              )}
            </div>
            {/* Coordenadas seleccionadas (solo lectura, informativas) */}
            {hasPin ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3 text-primary" />
                {form.lat.toFixed(6)}, {form.lng.toFixed(6)}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Toca el mapa para marcar tu ubicación
              </p>
            )}
          </div>

          {/* ── Línea de dirección ── */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Dirección *
            </label>
            <Input
              placeholder="Av. Principal 123"
              value={form.address_line}
              onChange={handleInputChange("address_line")}
              required
            />
          </div>

          {/* ── Referencia ── */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Referencia
            </label>
            <Input
              placeholder="Frente al parque, edificio azul…"
              value={form.reference}
              onChange={handleInputChange("reference")}
            />
          </div>

          {/* ── Edificio + Dpto ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                N° edificio
              </label>
              <Input
                placeholder="Torre A"
                value={form.building_number}
                onChange={handleInputChange("building_number")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                N° departamento
              </label>
              <Input
                placeholder="Piso 3, Dpto 302"
                value={form.apartment_number}
                onChange={handleInputChange("apartment_number")}
              />
            </div>
          </div>

          {/* ── Is default ── */}
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={handleInputChange("is_default")}
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
            <Button type="submit" disabled={loading || loadingDistricts}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Agregar dirección"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
