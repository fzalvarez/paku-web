"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Plus, Minus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServices } from "@/hooks/useServices";
import { servicesService } from "@/lib/api/services";
import { WizardNavButtons } from "./WizardLayout";
import { formatPrice } from "@/types/services";
import type { ServiceOut, ServiceAddon } from "@/types/services";

interface StepSelectServiceProps {
  petId: string | null;
  selectedServiceId: string | null;
  selectedAddonIds: string[];
  onSelectService: (service: ServiceOut) => void;
  onToggleAddon: (addon: ServiceAddon) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSelectService({
  petId,
  selectedServiceId,
  selectedAddonIds,
  onSelectService,
  onToggleAddon,
  onNext,
  onBack,
}: StepSelectServiceProps) {
  const { services, categories, loading, error, refetch, filterByCategory, selectedCategorySlug } =
    useServices(petId ?? undefined);

  // Estado para addons del producto seleccionado (se cargan al hacer clic)
  const [addonsLoading, setAddonsLoading] = useState(false);
  const [loadedAddons, setLoadedAddons] = useState<ServiceAddon[]>([]);
  const [loadedForId, setLoadedForId] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  async function handleSelectService(service: ServiceOut) {
    onSelectService(service);
    // Cargar addons del producto si no los tenemos aún
    if (loadedForId !== service.id) {
      setAddonsLoading(true);
      setLoadedAddons([]);
      try {
        const detail = await servicesService.getProduct(service.id, petId ? { pet_id: petId } : undefined);
        setLoadedAddons((detail.available_addons ?? []).filter((a) => a.is_active));
        setLoadedForId(service.id);
      } catch {
        setLoadedAddons([]);
      } finally {
        setAddonsLoading(false);
      }
    }
  }

  const totalCents =
    (selectedService?.price ?? 0) +
    loadedAddons
      .filter((a) => selectedAddonIds.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">Selecciona el servicio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige un servicio base y los adicionales que quieras agregar.
        </p>
      </div>

      {/* Filtros por categoría */}
      {categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => filterByCategory(null)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-all",
              !selectedCategorySlug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-primary/10"
            )}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => filterByCategory(cat.slug)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                selectedCategorySlug === cat.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary/10"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-semibold">No se pudieron cargar los servicios</p>
          <p className="mt-0.5 text-xs opacity-80">{error}</p>
          <button
            onClick={refetch}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold hover:bg-destructive/20"
          >
            <RefreshCw className="size-3" /> Reintentar
          </button>
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No hay servicios disponibles.</p>
      )}

      {/* Lista de servicios */}
      {!loading && services.length > 0 && (
        <div className="space-y-3">
          {services.map((service) => {
            const isSelected = service.id === selectedServiceId;
            return (
              <div
                key={service.id}
                className={cn(
                  "rounded-2xl border-2 bg-card transition-all",
                  isSelected
                    ? "border-primary ring-4 ring-primary/10"
                    : "border-transparent hover:border-primary/30"
                )}
              >
                {/* Cabecera del servicio */}
                <button
                  onClick={() => handleSelectService(service)}
                  className="flex w-full items-start justify-between gap-4 p-4 text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {isSelected && <CheckCircle2 className="size-4 shrink-0 text-primary" />}
                      <h3 className="font-bold">{service.name}</h3>
                    </div>
                    {service.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                    )}
                    <p className="mt-1 text-xs capitalize text-muted-foreground">{service.species}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-lg font-extrabold text-primary">
                      {formatPrice(service.price, service.currency)}
                    </span>
                  </div>
                </button>

                {/* Addons del servicio seleccionado */}
                {isSelected && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    {addonsLoading ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" /> Cargando adicionales…
                      </div>
                    ) : loadedAddons.length > 0 ? (
                      <>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Adicionales opcionales
                        </p>
                        <div className="space-y-2">
                          {loadedAddons.map((addon) => {
                            const isAddonSelected = selectedAddonIds.includes(addon.id);
                            return (
                              <button
                                key={addon.id}
                                onClick={() => onToggleAddon(addon)}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all",
                                  isAddonSelected
                                    ? "bg-primary/5 border border-primary/20"
                                    : "bg-muted/50 hover:bg-muted"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "flex size-5 items-center justify-center rounded-full border-2 transition-all",
                                      isAddonSelected ? "border-primary bg-primary" : "border-border"
                                    )}
                                  >
                                    {isAddonSelected ? (
                                      <Minus className="size-3 text-primary-foreground" />
                                    ) : (
                                      <Plus className="size-3 text-muted-foreground" />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium">{addon.name}</span>
                                </div>
                                <span className="text-sm font-bold text-primary">
                                  +{formatPrice(addon.price, addon.currency)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">Sin adicionales disponibles.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resumen de precio */}
      {selectedService && (
        <div className="mt-6 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Total estimado
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedService.name}
              {selectedAddonIds.length > 0 &&
                ` + ${selectedAddonIds.length} adicional${selectedAddonIds.length > 1 ? "es" : ""}`}
            </p>
          </div>
          <span className="text-2xl font-extrabold text-primary">
            {formatPrice(totalCents, selectedService.currency)}
          </span>
        </div>
      )}

      <WizardNavButtons
        canGoBack
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!selectedServiceId}
        nextLabel="Continuar"
      />
    </div>
  );
}
