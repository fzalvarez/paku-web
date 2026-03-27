"use client";

import { useState } from "react";
import { Loader2, MapPin, Star, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressFormDialog } from "@/components/common/AddressFormDialog";
import { useAddresses } from "@/hooks/useAddresses";
import { ApiCallError } from "@/lib/api/client";
import type { AddressOut, AddressCreateIn, AddressUpdateIn } from "@/types/api";

// ── Tarjeta de dirección ──────────────────────────────────────────────────────

interface AddressCardProps {
  address: AddressOut;
  onEdit: (address: AddressOut) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  actionLoading: string | null; // id de la address con acción en curso
}

function AddressCard({ address, onEdit, onDelete, onSetDefault, actionLoading }: AddressCardProps) {
  const busy = actionLoading === address.id;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-background shadow-sm transition-shadow hover:shadow-md ${
        address.is_default ? "border-primary/40" : "border-border/60"
      }`}
    >
      {/* Franja top de marca */}
      <div className={`h-1 w-full ${address.is_default ? "bg-linear-to-r from-primary to-secondary" : "bg-border/40"}`} />

      <div className="p-4">
        {/* Badge predeterminada */}
        {address.is_default && (
          <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Star className="size-3 fill-primary" />
            Predeterminada
          </span>
        )}

        {/* Icono + datos */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${address.is_default ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            <MapPin className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            {address.label && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                {address.label}
              </p>
            )}
            <p className="font-semibold leading-snug text-foreground">{address.address_line}</p>
            {address.reference && (
              <p className="mt-0.5 text-sm text-muted-foreground">{address.reference}</p>
            )}
            {(address.building_number || address.apartment_number) && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {[address.building_number, address.apartment_number].filter(Boolean).join(" — ")}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Distrito: {address.district_id}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3">
          {!address.is_default && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs"
              onClick={() => onSetDefault(address.id)}
              disabled={busy}
            >
              {busy ? <Loader2 className="size-3 animate-spin" /> : <Star className="size-3" />}
              Predeterminada
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 text-xs"
            onClick={() => onEdit(address)}
            disabled={busy}
          >
            <Pencil className="size-3" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-7 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(address.id)}
            disabled={busy}
          >
            {busy ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function AddressesPage() {
  const { addresses, loading, error, create, update, remove, setDefault } = useAddresses();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AddressOut | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // ── Crear o editar ──────────────────────────────────────────────────────────

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(address: AddressOut) {
    setEditTarget(address);
    setFormOpen(true);
  }

  async function handleFormSubmit(payload: AddressCreateIn) {
    if (editTarget) {
      // En edición solo enviamos los campos que cambiaron (AddressUpdateIn)
      const updatePayload: AddressUpdateIn = {
        district_id: payload.district_id,
        address_line: payload.address_line,
        reference: payload.reference,
        building_number: payload.building_number,
        apartment_number: payload.apartment_number,
        label: payload.label,
        type: payload.type,
        is_default: payload.is_default,
      };
      await update(editTarget.id, updatePayload);
    } else {
      await create(payload);
    }
  }

  // ── Eliminar ────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    setActionError(null);
    setActionLoading(id);
    try {
      await remove(id);
    } catch (err) {
      if (err instanceof ApiCallError && err.status === 409) {
        setActionError("No puedes eliminar la única dirección registrada.");
      } else {
        setActionError("No se pudo eliminar la dirección. Intenta de nuevo.");
      }
    } finally {
      setActionLoading(null);
    }
  }

  // ── Marcar predeterminada ───────────────────────────────────────────────────

  async function handleSetDefault(id: string) {
    setActionError(null);
    setActionLoading(id);
    try {
      await setDefault(id);
    } catch {
      setActionError("No se pudo actualizar la dirección predeterminada.");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Direcciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tus direcciones de entrega y servicio.
          </p>
        </div>
        {addresses.length > 0 && (
          <Button onClick={openCreate} size="sm" className="shrink-0 gap-2">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nueva dirección</span>
          </Button>
        )}
      </div>

      {/* Error de acción */}
      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <MapPin className="size-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Carga inicial */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <div key={n} className="rounded-2xl border border-border/60 bg-background p-4">
              <div className="flex gap-3">
                <div className="size-10 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error de carga */}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Lista vacía */}
      {!loading && !error && addresses.length === 0 && (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-linear-to-br from-tertiary/10 via-secondary/5 to-primary/10">
            <MapPin className="size-10 text-tertiary/50" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-foreground">
              No tienes direcciones registradas
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Agrega una dirección para facilitar la reserva de servicios.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="size-4" />
            Agregar dirección
          </Button>
        </div>
      )}

      {/* Grid de tarjetas */}
      {!loading && !error && addresses.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...addresses]
            .sort((a, b) => Number(b.is_default) - Number(a.is_default))
            .map((address) => (
              <li key={address.id}>
                <AddressCard
                  address={address}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                  actionLoading={actionLoading}
                />
              </li>
            ))}
        </ul>
      )}

      {/* Dialog de formulario */}
      <AddressFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        address={editTarget}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
