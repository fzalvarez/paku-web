"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Plus, Minus, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServices } from "@/hooks/useServices";
import { servicesService } from "@/lib/api/services";
import { storeService } from "@/lib/api/store";
import { WizardNavButtons } from "./WizardLayout";
import { formatPrice } from "@/types/services";
import type { ServiceOut, ServiceAddon } from "@/types/services";
import type { QuoteOut } from "@/types/api";

interface StepSelectServiceProps {
  petId: string | null;
  petName?: string;
  selectedServiceId: string | null;
  selectedAddonIds: string[];
  onSelectService: (service: ServiceOut) => void;
  onToggleAddon: (addon: ServiceAddon) => void;
  onNext: () => void;
  onBack: () => void;
}

// Cotización del backend para una combinación servicio + adicionales.
type QuoteState = { key: string; quote: QuoteOut | null; error: string | null };

function quoteKey(serviceId: string, addonIds: string[]): string {
  return [serviceId, ...[...addonIds].sort()].join("|");
}

export function StepSelectService({
  petId,
  petName,
  selectedServiceId,
  selectedAddonIds,
  onSelectService,
  onToggleAddon,
  onNext,
  onBack,
}: StepSelectServiceProps) {
  const { services, categories, loading, error, refetch, filterByCategory, selectedCategorySlug } =
    useServices(petId ?? undefined);

  // Adicionales del servicio seleccionado (precios para esta mascota)
  const [addonsLoading, setAddonsLoading] = useState(false);
  const [loadedAddons, setLoadedAddons] = useState<ServiceAddon[]>([]);
  const [loadedForId, setLoadedForId] = useState<string | null>(null);
  const [quoteState, setQuoteState] = useState<QuoteState | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const currentKey = selectedService ? quoteKey(selectedService.id, selectedAddonIds) : null;
  const quote = quoteState?.key === currentKey ? quoteState : null;
  const quoteLoading = currentKey !== null && selectedService?.price != null && quote === null;

  // Servicio elegido que esta mascota no puede comprar (raza o especie, C-08), p. ej.
  // preseleccionado desde /paku-spa: no aparece en su catálogo. Solo se evalúa con "Todos".
  const unavailableNotice =
    !loading && !error && !selectedCategorySlug && services.length > 0 &&
    !!selectedServiceId && !selectedService;

  // Recargar adicionales del servicio ya elegido (p. ej. al volver de un paso posterior)
  useEffect(() => {
    if (!selectedServiceId || loadedForId === selectedServiceId || loading) return;
    let cancelled = false;
    servicesService
      .getProduct(selectedServiceId, petId ? { pet_id: petId } : undefined)
      .then((detail) => {
        if (cancelled) return;
        setLoadedAddons((detail.available_addons ?? []).filter((a) => a.is_active));
        setLoadedForId(selectedServiceId);
      })
      .catch(() => { if (!cancelled) setLoadedAddons([]); });
    return () => { cancelled = true; };
  }, [selectedServiceId, loadedForId, loading, petId]);

  // Total: lo calcula el backend (POST /store/quote) con especie, raza y peso de la mascota
  useEffect(() => {
    if (!petId || !selectedService || selectedService.price == null || !currentKey) return;
    let cancelled = false;
    storeService
      .quote({ pet_id: petId, product_id: selectedService.id, addon_ids: selectedAddonIds })
      .then((q) => { if (!cancelled) setQuoteState({ key: currentKey, quote: q, error: null }); })
      .catch((err) => {
        if (cancelled) return;
        setQuoteState({
          key: currentKey,
          quote: null,
          error: err instanceof Error ? err.message : "No se pudo calcular el total.",
        });
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId, currentKey]);

  async function handleSelectService(service: ServiceOut) {
    if (service.price == null) return;
    onSelectService(service);
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

  const canContinue = !!selectedService && selectedService.price != null && !quote?.error;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">Selecciona el servicio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige un servicio base y los adicionales que quieras agregar.
          {petName ? ` Los precios son para ${petName}.` : ""}
        </p>
      </div>

      {unavailableNotice && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <AlertCircle className="size-4 shrink-0" />
          El servicio que elegiste no está disponible para {petName ?? "esta mascota"}. Elige otro.
        </div>
      )}

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
        <p className="py-8 text-center text-sm text-muted-foreground">No hay servicios disponibles para esta mascota.</p>
      )}

      {/* Lista de servicios */}
      {!loading && services.length > 0 && (
        <div className="space-y-3">
          {services.map((service) => {
            const isSelected = service.id === selectedServiceId;
            const hasPrice = service.price != null;
            return (
              <div
                key={service.id}
                className={cn(
                  "rounded-2xl border-2 bg-card transition-all",
                  isSelected
                    ? "border-primary ring-4 ring-primary/10"
                    : hasPrice ? "border-transparent hover:border-primary/30" : "border-transparent opacity-60"
                )}
              >
                {/* Cabecera del servicio */}
                <button
                  onClick={() => handleSelectService(service)}
                  disabled={!hasPrice}
                  className="flex w-full items-start justify-between gap-4 p-4 text-left disabled:cursor-not-allowed"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {isSelected && <CheckCircle2 className="size-4 shrink-0 text-primary" />}
                      <h3 className="font-bold">{service.name}</h3>
                    </div>
                    {service.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {hasPrice ? (
                      <span className="text-lg font-extrabold text-primary">
                        {formatPrice(service.price as number, service.currency)}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">Sin precio para tu mascota</span>
                    )}
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
                            const addonHasPrice = addon.price != null;
                            return (
                              <button
                                key={addon.id}
                                onClick={() => onToggleAddon(addon)}
                                disabled={!addonHasPrice && !isAddonSelected}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all disabled:cursor-not-allowed disabled:opacity-60",
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
                                  {addonHasPrice ? `+${formatPrice(addon.price as number, addon.currency)}` : "Sin precio"}
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

      {/* Total calculado por el backend */}
      {selectedService && (
        <div className="mt-6 rounded-xl bg-primary/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="text-sm text-muted-foreground">
                {selectedService.name}
                {selectedAddonIds.length > 0 &&
                  ` + ${selectedAddonIds.length} adicional${selectedAddonIds.length > 1 ? "es" : ""}`}
              </p>
            </div>
            {quoteLoading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : quote?.quote ? (
              <span className="text-2xl font-extrabold text-primary">
                {formatPrice(quote.quote.total, quote.quote.currency)}
              </span>
            ) : null}
          </div>
          {quote?.error && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="size-3.5 shrink-0" /> {quote.error}
            </p>
          )}
        </div>
      )}

      <WizardNavButtons
        canGoBack
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!canContinue}
        nextLabel="Continuar"
      />
    </div>
  );
}
