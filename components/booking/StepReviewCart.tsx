"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { cartService } from "@/lib/api/cart";
import { ApiCallError } from "@/lib/api/client";
import { formatPrice } from "@/types/services";
import { WizardNavButtons } from "./WizardLayout";
import type { CartItemInput, CartItemOut, CartWithItemsOut, PriceChangedDetail } from "@/types/cart";
import type { ServiceOut } from "@/types/services";
import type { Pet } from "@/types/pets";
import type { AddressOut } from "@/types/api";
import type { HoldOut } from "@/types/booking";

// El servicio se atiende por orden de ruta que define el admin; el backend
// todavía exige meta.scheduled_time, así que se envía un valor fijo que no se muestra.
const SCHEDULED_TIME = "09:00";

/** Errores que obligan a volver a elegir la fecha (la reserva ya no sirve). */
const HOLD_LOST_CODES = new Set([
  "HOLD_EXPIRED", "HOLD_REQUIRED", "HOLD_MISMATCH", "HOLD_NOT_FOUND", "HOLD_NOT_OWNED", "INVALID_HOLD_ID",
  "Cart expired",
]);

export function isHoldLost(err: unknown): err is ApiCallError {
  return err instanceof ApiCallError && HOLD_LOST_CODES.has(err.code);
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function CartItemRow({ item }: { item: CartItemOut }) {
  const isBase = item.kind === "service_base";
  return (
    <div className={cn(
      "flex items-start justify-between rounded-xl p-3",
      isBase ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
    )}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {isBase
            ? <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Principal</span>
            : <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Adicional</span>}
          <p className="text-sm font-semibold">{item.name}</p>
        </div>
        {isBase && item.meta?.scheduled_date && (
          <p className="mt-0.5 text-xs text-muted-foreground first-letter:uppercase">📅 {formatDate(item.meta.scheduled_date)}</p>
        )}
      </div>
      <span className="font-bold text-primary">{formatPrice(item.unit_price)}</span>
    </div>
  );
}

interface StepReviewCartProps {
  selectedPet: Pet | null;
  selectedService: ServiceOut | null;
  selectedAddonIds: string[];
  selectedAddress: AddressOut | null;
  hold: HoldOut | null;
  /** Carrito que ya armó el asistente (se reemplaza en lugar de crear otro) */
  cartId: string | null;
  /** Ya existe la orden: el carrito quedó cerrado y no se puede cambiar */
  orderCreated: boolean;
  onCartChange: (cart: CartWithItemsOut) => void;
  /** La reserva venció o ya no sirve: volver a elegir la fecha */
  onHoldLost: (message: string) => void;
  onBack: () => void;
  /** Crea la orden (si no existe) y pasa al pago */
  onProceedToPayment: (cartId: string) => Promise<void>;
}

export function StepReviewCart({
  selectedPet,
  selectedService,
  selectedAddonIds,
  selectedAddress,
  hold,
  cartId,
  orderCreated,
  onCartChange,
  onHoldLost,
  onBack,
  onProceedToPayment,
}: StepReviewCartProps) {
  const [cart, setCart] = useState<CartWithItemsOut | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<PriceChangedDetail | null>(null);
  const [attempt, setAttempt] = useState(0);
  const startedRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Armar el carrito al entrar: precios y nombres los pone el backend (C-07)
  useEffect(() => {
    // Una sola vez por intento (en desarrollo React ejecuta los efectos dos veces y
    // crearía dos carritos); el resultado se descarta si el paso ya se desmontó.
    if (startedRef.current === attempt) return;
    startedRef.current = attempt;
    if (!selectedService || !selectedPet || !hold) return;

    const items: CartItemInput[] = [
      {
        kind: "service_base",
        ref_id: selectedService.id,
        qty: 1,
        meta: { pet_id: selectedPet.id, hold_id: hold.id, scheduled_time: SCHEDULED_TIME },
      },
      ...selectedAddonIds.map((id) => ({ kind: "service_addon" as const, ref_id: id, qty: 1 })),
    ];

    async function build(): Promise<CartWithItemsOut> {
      if (cartId) {
        try {
          const existing = await cartService.get(cartId);
          // Orden ya creada: el carrito está cerrado, solo se muestra
          if (existing.cart.status === "checked_out") return existing;
          if (existing.cart.status === "active") return await cartService.replaceItems(cartId, { items });
        } catch (err) {
          // Carrito vencido o inexistente → se crea uno nuevo (la reserva dirá si sigue vigente)
          if (!(err instanceof ApiCallError) || ![404, 410].includes(err.status)) throw err;
        }
      }
      return cartService.addItems({ items });
    }

    (async () => {
      try {
        const built = await build();
        if (!mountedRef.current) return;
        setCart(built);
        onCartChange(built);
        const validation = await cartService.validate(built.cart.id).catch(() => null);
        if (mountedRef.current && validation) setTotal(validation.total);
      } catch (err) {
        if (!mountedRef.current) return;
        if (isHoldLost(err)) {
          onHoldLost(err.message);
          return;
        }
        setBuildError(err instanceof Error ? err.message : "No se pudo preparar tu pedido. Intenta de nuevo.");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  async function handleProceed() {
    if (!cart) return;
    setProcessError(null);
    setProcessing(true);
    try {
      if (cart.cart.status !== "checked_out") {
        // Checkout recotiza: si un precio cambió responde 409 PRICE_CHANGED y el
        // carrito ya queda con los precios nuevos; al confirmar se vuelve a llamar.
        const result = await cartService.checkout(cart.cart.id);
        setTotal(result.total);
        setCart({ ...cart, cart: { ...cart.cart, status: "checked_out" }, items: result.items });
        setPriceChange(null);
      }
      await onProceedToPayment(cart.cart.id);
    } catch (err) {
      if (isHoldLost(err)) {
        onHoldLost(err.message);
        return;
      }
      if (err instanceof ApiCallError && err.code === "PRICE_CHANGED") {
        const detail = err.detail as PriceChangedDetail;
        setPriceChange(detail);
        setTotal(detail.total);
        const refreshed = await cartService.get(cart.cart.id).catch(() => null);
        if (refreshed) {
          setCart(refreshed);
          onCartChange(refreshed);
        }
        return;
      }
      setProcessError(err instanceof Error ? err.message : "Ocurrió un error al preparar el pago. Intenta de nuevo.");
    } finally {
      setProcessing(false);
    }
  }

  const building = !cart && !buildError;
  const checkedOut = cart?.cart.status === "checked_out";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">Revisa tu pedido</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirma los detalles antes de pagar. Para cambiar el servicio o los adicionales, vuelve atrás.
        </p>
      </div>

      {building && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/60 py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Preparando tu pedido…</span>
        </div>
      )}

      {buildError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            {buildError}
          </div>
          <button
            onClick={() => { setBuildError(null); setAttempt((a) => a + 1); }}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold hover:bg-destructive/20"
          >
            <RefreshCw className="size-3" /> Reintentar
          </button>
        </div>
      )}

      {cart && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Servicio para {selectedPet?.name ?? "tu mascota"}
            </p>
            <div className="space-y-2">
              {cart.items.map((item) => <CartItemRow key={item.id} item={item} />)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              La hora de la visita te la confirmamos cuando armemos la ruta del día.
            </p>
          </div>

          {selectedAddress && (
            <div className="rounded-xl bg-muted/50 px-4 py-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Dirección de servicio</p>
              <p className="text-sm font-semibold">{selectedAddress.address_line}</p>
              {selectedAddress.reference && <p className="text-xs text-muted-foreground">{selectedAddress.reference}</p>}
            </div>
          )}

          {priceChange && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
              <p className="font-bold">Los precios cambiaron</p>
              <ul className="mt-1 space-y-0.5 text-xs">
                {priceChange.items.map((i) => (
                  <li key={i.item_id}>
                    {i.name}: <span className="line-through">{formatPrice(i.old_unit_price)}</span> → {formatPrice(i.new_unit_price)}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs">Revisa el nuevo total y confirma para continuar.</p>
            </div>
          )}

          {checkedOut && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="size-4 shrink-0" />
              Pedido confirmado. Puedes continuar con el pago.
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
            <span className="font-bold">Total</span>
            {total !== null
              ? <span className="text-xl font-extrabold text-primary">{formatPrice(total)}</span>
              : <Loader2 className="size-5 animate-spin text-muted-foreground" />}
          </div>

          {processError && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {processError}
            </div>
          )}
        </div>
      )}

      <WizardNavButtons
        canGoBack={!processing && !orderCreated}
        onBack={onBack}
        nextLabel={processing ? "Preparando pago…" : priceChange ? "Confirmar nuevo total" : "Ir a pagar"}
        nextDisabled={!cart || processing}
        nextLoading={processing}
        onNext={handleProceed}
      />
    </div>
  );
}
