"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddresses } from "@/hooks/useAddresses";
import { AddressFormDialog } from "@/components/common/AddressFormDialog";
import { WizardNavButtons } from "./WizardLayout";
import type { AddressOut, AddressCreateIn } from "@/types/api";

interface StepSelectAddressProps {
  selectedAddressId: string | null;
  onSelectAddress: (address: AddressOut) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSelectAddress({
  selectedAddressId,
  onSelectAddress,
  onNext,
  onBack,
}: StepSelectAddressProps) {
  const { addresses, loading, create } = useAddresses();
  const [formOpen, setFormOpen] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  // Auto-seleccionar la dirección default si no hay ninguna seleccionada
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      onSelectAddress(def);
    }
  }, [addresses, selectedAddressId, onSelectAddress]);

  // Auto-seleccionar la última dirección creada
  useEffect(() => {
    if (!lastCreatedId || addresses.length === 0) return;
    const newAddr = addresses.find((a) => a.id === lastCreatedId);
    if (newAddr) {
      onSelectAddress(newAddr);
      setTimeout(() => setLastCreatedId(null), 0);
    }
  }, [lastCreatedId, addresses, onSelectAddress]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">¿Dónde realizamos el servicio?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          El servicio es a domicilio. Selecciona o agrega tu dirección.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {addresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;
            return (
              <button
                key={addr.id}
                onClick={() => onSelectAddress(addr)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  isSelected ? "border-primary bg-primary" : "border-border"
                )}>
                  {isSelected && <CheckCircle2 className="size-3 text-primary-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-primary" />
                    <p className="truncate font-semibold">{addr.address_line}</p>
                    {addr.is_default && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Principal
                      </span>
                    )}
                  </div>
                  {addr.label && <p className="mt-0.5 text-xs text-muted-foreground">{addr.label}</p>}
                  {addr.reference && <p className="text-xs text-muted-foreground">{addr.reference}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground/70">Distrito: {addr.district_id}</p>
                </div>
              </button>
            );
          })}

          {/* Agregar nueva dirección */}
          <button
            onClick={() => setFormOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4 transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="size-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">Agregar nueva dirección</span>
          </button>
        </div>
      )}

      <AddressFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (data: AddressCreateIn) => {
          const newAddr = await create(data);
          setLastCreatedId(newAddr.id);
          setFormOpen(false);
        }}
      />

      <WizardNavButtons
        canGoBack
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!selectedAddressId}
        nextLabel="Continuar"
      />
    </div>
  );
}
