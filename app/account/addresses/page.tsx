"use client";

import { useState } from "react";
import { Loader2, MapPin, Star, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { EmptyState } from "@/components/account/EmptyState";
import { InlineAlert } from "@/components/account/InlineAlert";
import { AddressFormDialog } from "@/components/common/AddressFormDialog";
import { useAddresses } from "@/hooks/useAddresses";
import { useDistricts } from "@/hooks/useDistricts";
import { ApiCallError } from "@/lib/api/client";
import type { AddressOut, AddressCreateIn, AddressUpdateIn } from "@/types/api";

// ── Tarjeta de dirección ──────────────────────────────────────────────────────

interface AddressCardProps {
  address: AddressOut;
  districtName?: string;
  onEdit: (address: AddressOut) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  actionLoading: string | null; // id de la address con acción en curso
}

function AddressCard({
  address,
  districtName,
  onEdit,
  onDelete,
  onSetDefault,
  actionLoading,
}: AddressCardProps) {
  const busy = actionLoading === address.id;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-background shadow-sm transition-shadow hover:shadow-md ${
        address.is_default ? "border-primary/30" : "border-border/60"
      }`}
    >
      <div className="p-4">
        {/* Badge predeterminada */}
        {address.is_default && (
          <Badge className="mb-3">
            <Star className="fill-primary" />
            Predeterminada
          </Badge>
        )}

        {/* Icono + datos */}
        <div className="flex items-start gap-3">
          <div className="relative size-11 shrink-0">
            <div
              className={`absolute inset-0 rounded-[46%_54%_58%_42%/48%_42%_58%_52%] ${address.is_default ? "bg-primary/10" : "bg-muted"}`}
            />
            <div className={`absolute inset-0 flex items-center justify-center ${address.is_default ? "text-primary" : "text-muted-foreground"}`}>
              <MapPin className="size-4" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {address.label && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                {address.label}
              </p>
            )}
            <p className="font-semibold leading-snug text-foreground">
              {address.address_line}
            </p>
            {address.reference && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {address.reference}
              </p>
            )}
            {(address.building_number || address.apartment_number) && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {[address.building_number, address.apartment_number]
                  .filter(Boolean)
                  .join(" — ")}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Distrito: {districtName ?? address.district_id}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3">
          {!address.is_default && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => onSetDefault(address.id)}
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Star className="size-3" />
              )}
              Predeterminada
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs"
            onClick={() => onEdit(address)}
            disabled={busy}
          >
            <Pencil className="size-3" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(address.id)}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function AddressesPage() {
  const { addresses, loading, error, create, update, remove, setDefault } =
    useAddresses();
  const { districts } = useDistricts();
  const districtNameById = new Map(districts.map((d) => [d.id, d.name]));

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
      <AccountPageHeader
        title="Direcciones"
        description="Registra los lugares donde realizaremos el servicio."
        action={
          addresses.length > 0 && (
            <Button onClick={openCreate} className="gap-2" aria-label="Nueva dirección">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Nueva dirección</span>
            </Button>
          )
        }
      />

      {/* Error de acción */}
      {actionError && <InlineAlert>{actionError}</InlineAlert>}

      {/* Carga inicial */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border/60 bg-background p-4"
            >
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
      {!loading && error && <InlineAlert>{error}</InlineAlert>}

      {/* Lista vacía */}
      {!loading && !error && addresses.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="No tienes direcciones registradas"
          description="Agrega una dirección para facilitar la reserva de servicios."
          action={
            <Button onClick={openCreate} className="gap-2">
              <Plus className="size-4" />
              Agregar dirección
            </Button>
          }
        />
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
                  districtName={districtNameById.get(address.district_id)}
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
