"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { ApiCallError } from "@/lib/api/client";
import { WizardNavButtons } from "./WizardLayout";
import type { CartItemOut, CartValidateOut } from "@/types/cart";
import type { ServiceOut, ServiceAddon } from "@/types/services";
import type { Pet } from "@/types/pets";
import type { AddressOut } from "@/types/api";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  });
}

interface CartItemRowProps {
  item: CartItemOut;
  onRemove: (id: string) => void;
  removing: boolean;
}

function CartItemRow({ item, onRemove, removing }: CartItemRowProps) {
  const isBase = item.kind === "service_base";
  const isAddon = item.kind === "service_addon";

  return (
    <div className={cn(
      "flex items-start justify-between rounded-xl p-3",
      isBase ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
    )}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {isBase && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Principal</span>}
          {isAddon && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Adicional</span>}
          <p className="text-sm font-semibold">{item.name}</p>
        </div>
        {item.meta?.scheduled_date && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            📅 {formatDate(item.meta.scheduled_date)} a las {item.meta.scheduled_time}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-primary">S/ {(item.qty * item.unit_price).toFixed(2)}</span>
        <button
          onClick={() => onRemove(item.id)}
          disabled={removing}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

interface StepReviewCartProps {
  // Datos del wizard
  selectedPet: Pet | null;
  selectedService: ServiceOut | null;
  selectedAddonIds: string[];
  selectedDate: string | null;
  selectedTime: string | null;
  selectedAddress: AddressOut | null;
  // Callbacks
  onBack: () => void;
  onProceedToPayment: (cartId: string, amountCents: number) => void;
}

export function StepReviewCart({
  selectedPet,
  selectedService,
  selectedAddonIds,
  selectedDate,
  selectedTime,
  selectedAddress,
  onBack,
  onProceedToPayment,
}: StepReviewCartProps) {
  const { cart, loading, mutating, error, addItems, removeItem, validate, checkout } = useCart();
  const [cartBuilt, setCartBuilt] = useState(false);
  const [buildingCart, setBuildingCart] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [validation, setValidation] = useState<CartValidateOut | null>(null);
  const [validating, setValidating] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  // Construir el carrito al entrar al paso si no está construido
  useEffect(() => {
    if (cartBuilt || buildingCart || !selectedService || !selectedPet || !selectedDate || !selectedTime) return;

    async function buildCart() {
      if (!selectedService || !selectedPet || !selectedDate || !selectedTime) return;
      setBuildingCart(true);
      setBuildError(null);
      try {
        const addonObjects: ServiceAddon[] = (selectedService.available_addons ?? []).filter(
          (a) => selectedAddonIds.includes(a.id)
        );

        const items = [
          {
            kind: "service_base" as const,
            ref_id: selectedService.id,
            name: selectedService.name,
            qty: 1,
            unit_price: selectedService.price,
            meta: {
              pet_id: selectedPet.id,
              scheduled_date: selectedDate,
              scheduled_time: selectedTime,
            },
          },
          ...addonObjects.map((addon) => ({
            kind: "service_addon" as const,
            ref_id: addon.id,
            name: addon.name,
            qty: 1,
            unit_price: addon.price,
            meta: {
              base_service_id: selectedService.id,
            },
          })),
        ];

        await addItems({ items });
        setCartBuilt(true);
      } catch (err) {
        if (err instanceof ApiCallError) {
          setBuildError(`Error al crear el carrito: ${err.message}`);
        } else {
          setBuildError("No se pudo crear el carrito. Intenta de nuevo.");
        }
      } finally {
        setBuildingCart(false);
      }
    }

    buildCart();
  }, [cartBuilt, buildingCart, selectedService, selectedPet, selectedDate, selectedTime, selectedAddonIds, addItems]);

  // Validar carrito cuando esté construido
  useEffect(() => {
    if (!cartBuilt || !cart?.cart.id || validating) return;
    async function runValidation() {
      setValidating(true);
      try {
        const result = await validate();
        setValidation(result);
      } catch {
        // Si falla la validación, no bloqueamos pero mostramos advertencia
      } finally {
        setValidating(false);
      }
    }
    runValidation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartBuilt, cart?.cart.id]);

  async function handleProceedToPayment() {
    if (!cart?.cart.id) return;
    setProcessError(null);

    try {
      // Validar carrito
      setValidating(true);
      const validResult = await validate();
      setValidation(validResult);
      setValidating(false);

      if (!validResult.valid) {
        setProcessError("El carrito tiene errores: " + validResult.errors.join(", "));
        return;
      }

      // Hacer checkout (bloquea el carrito y congela el precio)
      setCheckingOut(true);
      await checkout();
      setCheckingOut(false);

      // Pasar al paso de pago con el cartId y el total en céntimos
      const totalCents = Math.round((validResult.total ?? total) * 100);
      onProceedToPayment(cart.cart.id, totalCents);
    } catch (err) {
      setCheckingOut(false);
      setValidating(false);
      if (err instanceof ApiCallError) {
        setProcessError(`Error: ${err.message}`);
      } else {
        setProcessError("Ocurrió un error al preparar el pago. Intenta de nuevo.");
      }
    }
  }

  const isProcessing = buildingCart || mutating || validating || checkingOut;
  const total = cart?.items.reduce((acc, item) => acc + item.qty * item.unit_price, 0) ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">Revisa tu pedido</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirma los detalles antes de finalizar. El carrito expira en 2 horas.
        </p>
      </div>

      {/* Estado de construcción del carrito */}
      {(buildingCart || loading) && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/60 py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Preparando tu carrito…</span>
        </div>
      )}

      {buildError && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {buildError}
        </div>
      )}

      {!buildingCart && !loading && cart && (
        <div className="space-y-4">
          {/* Items del carrito */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Servicio seleccionado</p>
            <div className="space-y-2">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onRemove={(id) => removeItem(id)}
                  removing={mutating}
                />
              ))}
            </div>
          </div>

          {/* Dirección */}
          {selectedAddress && (
            <div className="rounded-xl bg-muted/50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Dirección de servicio</p>
              <p className="text-sm font-semibold">{selectedAddress.address_line}</p>
              {selectedAddress.reference && <p className="text-xs text-muted-foreground">{selectedAddress.reference}</p>}
            </div>
          )}

          {/* Validación */}
          {validating && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Validando carrito…
            </div>
          )}
          {validation && !validating && (
            <div className={cn(
              "rounded-xl px-4 py-3 text-sm",
              validation.valid
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-destructive/10 border border-destructive/20 text-destructive"
            )}>
              {validation.valid ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  Carrito validado correctamente
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="size-4" /> Hay problemas en el carrito
                  </div>
                  <ul className="mt-1 list-inside list-disc text-xs">
                    {validation.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
            <span className="font-bold">Total</span>
            <span className="text-xl font-extrabold text-primary">
              S/ {(validation?.total ?? total).toFixed(2)}
            </span>
          </div>

          {/* Error de proceso */}
          {(error || processError) && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {processError ?? error}
            </div>
          )}
        </div>
      )}

      {/* Nota del carrito expirado */}
      {!buildingCart && !loading && !cart && cartBuilt && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          El carrito expiró. Por favor, vuelve a comenzar.
        </div>
      )}

      <WizardNavButtons
        canGoBack={!isProcessing}
        onBack={onBack}
        nextLabel={
          checkingOut ? "Preparando pago…" :
          validating ? "Validando…" :
          "Ir a pagar"
        }
        nextDisabled={!cart || isProcessing || (validation !== null && !validation.valid)}
        nextLoading={isProcessing}
        onNext={handleProceedToPayment}
      />
    </div>
  );
}
