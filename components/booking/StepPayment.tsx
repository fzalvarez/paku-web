"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CreditCard, Plus, CheckCircle2, Loader2, AlertCircle,
  RefreshCw, ChevronRight, ArrowLeft, Lock, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayments } from "@/hooks/usePayments";
import type { SavedCard, PaymentStatus } from "@/types/payments";

// ── Helpers ───────────────────────────────────────────────────────────────────

const BRAND_LABELS: Record<string, string> = {
  visa: "VISA", master: "MC", mastercard: "MC",
  amex: "AMEX", debvisa: "VISA DB", debmaster: "MC DB",
};
function getBrandLabel(b: string) {
  return BRAND_LABELS[b?.toLowerCase()] ?? b?.toUpperCase() ?? "??";
}
function getBrandColor(b: string) {
  const bl = b?.toLowerCase();
  if (bl?.includes("visa"))   return "bg-blue-800 text-white";
  if (bl?.includes("master")) return "bg-red-600 text-white";
  if (bl?.includes("amex"))   return "bg-blue-500 text-white";
  return "bg-muted text-muted-foreground";
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Pasos del sub-flujo de pago:
 *  select-card   → lista de tarjetas guardadas + botón nueva tarjeta
 *  add-new-card  → formulario de nueva tarjeta (Secure Fields de MP)
 *  confirm-cvv   → CVV de tarjeta guardada seleccionada
 *  processing    → spinner mientras se procesa / polling
 *  failed        → error de pago
 */
type PayStep = "select-card" | "add-new-card" | "confirm-cvv" | "processing" | "failed";

interface StepPaymentProps {
  cartId: string;
  amountCents: number;   // ej. 6500 = S/ 65.00
  currency?: string;
  onPaymentSuccess: (paymentOrderId: string) => void;
  onBack: () => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MercadoPago: any;
  }
}

// ── Componente principal ──────────────────────────────────────────────────────

export function StepPayment({
  cartId,
  amountCents,
  currency = "PEN",
  onPaymentSuccess,
  onBack,
}: StepPaymentProps) {
  const {
    savedCards, cardsLoading, cardsError, loadSavedCards,
    paying, payError, pay,
    polling, pollError, startPolling,
    savingCard, saveCardError, saveCard,
  } = usePayments();

  const [payStep, setPayStep]           = useState<PayStep>("select-card");
  const [selectedCard, setSelectedCard] = useState<SavedCard | null>(null);
  const [installments, setInstallments] = useState(1);
  const [localError, setLocalError]     = useState<string | null>(null);

  // ── SDK de Mercado Pago ───────────────────────────────────────────────────
  const mpRef       = useRef<unknown>(null);
  const sdkReadyRef = useRef(false);
  const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "";

  const ensureSdk = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (sdkReadyRef.current) { resolve(); return; }
      if (document.getElementById("mp-sdk")) {
        const wait = setInterval(() => {
          if (window.MercadoPago) {
            clearInterval(wait);
            if (!mpRef.current) mpRef.current = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "es-PE" });
            sdkReadyRef.current = true;
            resolve();
          }
        }, 100);
        return;
      }
      const script  = document.createElement("script");
      script.id     = "mp-sdk";
      script.src    = "https://sdk.mercadopago.com/js/v2";
      script.async  = true;
      script.onload = () => {
        mpRef.current     = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "es-PE" });
        sdkReadyRef.current = true;
        resolve();
      };
      document.head.appendChild(script);
    });
  }, [MP_PUBLIC_KEY]);

  useEffect(() => { if (MP_PUBLIC_KEY) ensureSdk(); }, [MP_PUBLIC_KEY, ensureSdk]);

  // ── Flujo tarjeta nueva (Secure Fields) ──────────────────────────────────
  const newCardUnmountRef = useRef<(() => void) | null>(null);
  const [newCardReady, setNewCardReady] = useState(false);
  const [saveNewCard, setSaveNewCard]   = useState(false);

  const mountNewCardForm = useCallback(async () => {
    setNewCardReady(false);
    setLocalError(null);
    await ensureSdk();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mp = mpRef.current as any;
    if (!mp) return;

    try {
      newCardUnmountRef.current?.();

      const common = {
        color: "inherit",
        fontSize: "14px",
        fontFamily: "inherit",
        "::placeholder": { color: "#94a3b8" },
      };

      const fNumber = mp.fields.create("cardNumber",      { placeholder: "1234 5678 9012 3456", style: common });
      const fExp    = mp.fields.create("expirationDate",  { placeholder: "MM/AA",               style: common });
      const fCvv    = mp.fields.create("securityCode",    { placeholder: "•••",                 style: common });

      fNumber.mount("mp-new-card-number");
      fExp.mount("mp-new-card-exp");
      fCvv.mount("mp-new-card-cvv");

      fNumber.on("ready", () => setNewCardReady(true));

      newCardUnmountRef.current = () => {
        try { fNumber.unmount?.(); fExp.unmount?.(); fCvv.unmount?.(); } catch { /* noop */ }
      };
    } catch {
      setLocalError("No se pudo cargar el formulario de tarjeta. Recarga la página.");
    }
  }, [ensureSdk]);

  useEffect(() => {
    if (payStep === "add-new-card") {
      const t = setTimeout(mountNewCardForm, 200);
      return () => {
        clearTimeout(t);
        // Desmontar campos si salimos del paso antes de que acaben de cargar
        newCardUnmountRef.current?.();
        newCardUnmountRef.current = null;
      };
    }
  }, [payStep, mountNewCardForm]);

  // ── Flujo CVV tarjeta guardada ────────────────────────────────────────────
  const cvvFieldRef     = useRef<unknown>(null);
  const cvvContainerRef = useRef<HTMLDivElement>(null);
  const [cvvReady, setCvvReady] = useState(false);

  const mountCvv = useCallback(async () => {
    setCvvReady(false);
    setLocalError(null);
    await ensureSdk();
    if (!cvvContainerRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mp = mpRef.current as any;
    if (!mp) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      try { (cvvFieldRef.current as any)?.unmount?.(); } catch { /* noop */ }
      const field = mp.fields.create("securityCode", {
        placeholder: "•••",
        style: { color: "inherit", fontSize: "15px", fontFamily: "inherit" },
      });
      field.mount(cvvContainerRef.current.id);
      cvvFieldRef.current = field;
      field.on("ready", () => setCvvReady(true));
      field.on("validityChange", ({ errorMessages }: { errorMessages: string[] }) => {
        setCvvReady(errorMessages.length === 0);
      });
    } catch {
      setLocalError("No se pudo cargar el campo de seguridad. Recarga la página.");
    }
  }, [ensureSdk]);

  useEffect(() => {
    if (payStep === "confirm-cvv" && selectedCard) {
      const t = setTimeout(mountCvv, 200);
      return () => clearTimeout(t);
    }
  }, [payStep, selectedCard, mountCvv]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function poll(orderId: string) {
    startPolling(orderId, (finalStatus: PaymentStatus) => {
      if (finalStatus === "PAID") {
        onPaymentSuccess(orderId);
      } else {
        setPayStep("failed");
        setLocalError(
          finalStatus === "FAILED"
            ? "El pago fue rechazado. Intenta con otra tarjeta."
            : "El pago fue cancelado."
        );
      }
    });
  }

  // ── Pagar con tarjeta guardada ────────────────────────────────────────────
  async function handlePayWithSaved() {
    if (!selectedCard) return;
    setLocalError(null);
    setPayStep("processing");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mp = mpRef.current as any;
      const tokenResult = await mp.fields.createCardToken({ cardId: selectedCard.id });
      if (!tokenResult?.id) throw new Error("No se pudo generar el token de seguridad.");
      const orderId = await pay({
        cart_id: cartId,
        amount: amountCents,
        currency,
        saved_payment_method_id: selectedCard.id,
        card_token: tokenResult.id,
        installments,
      });
      poll(orderId);
    } catch (err) {
      setPayStep("confirm-cvv");
      setLocalError(err instanceof Error ? err.message : "Error al procesar el pago.");
    }
  }

  // ── Pagar con tarjeta nueva ───────────────────────────────────────────────
  async function handlePayWithNewCard() {
    setLocalError(null);
    setPayStep("processing");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mp = mpRef.current as any;
      const tokenResult = await mp.fields.createCardToken({});
      if (!tokenResult?.id) throw new Error("No se pudo tokenizar la tarjeta.");

      const paymentMethodId: string = tokenResult.paymentMethodId ?? "visa";

      if (saveNewCard) {
        // Guardar tarjeta y pagar con la guardada
        const saved = await saveCard(tokenResult.id);
        const orderId = await pay({
          cart_id: cartId, amount: amountCents, currency,
          saved_payment_method_id: saved.id,
          card_token: tokenResult.id,
          installments,
        });
        await loadSavedCards();
        poll(orderId);
      } else {
        const orderId = await pay({
          cart_id: cartId, amount: amountCents, currency,
          card_token: tokenResult.id,
          payment_method_id: paymentMethodId,
          installments,
          save_card: false,
        });
        poll(orderId);
      }
    } catch (err) {
      setPayStep("add-new-card");
      setLocalError(err instanceof Error ? err.message : "Error al procesar el pago.");
    }
  }

  // ── Display ───────────────────────────────────────────────────────────────
  const displayAmount = `S/ ${(amountCents / 100).toFixed(2)}`;
  const activeError   = localError ?? payError ?? pollError ?? saveCardError;

  // ── Estado: procesando ────────────────────────────────────────────────────
  if (payStep === "processing") {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
        <div>
          <p className="text-xl font-extrabold">Procesando pago…</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {polling ? "Confirmando con Mercado Pago…" : "Enviando solicitud de pago…"}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">No cierres esta ventana.</p>
      </div>
    );
  }

  // ── Estado: fallido ───────────────────────────────────────────────────────
  if (payStep === "failed") {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-10 text-destructive" />
        </div>
        <div>
          <p className="text-xl font-extrabold text-destructive">Pago no procesado</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{activeError}</p>
        </div>
        <button
          onClick={() => { setPayStep("select-card"); setLocalError(null); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="size-4" /> Intentar de nuevo
        </button>
      </div>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold">
          {payStep === "add-new-card" ? "Nueva tarjeta" : "Pago"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {payStep === "add-new-card"
            ? "Ingresa los datos de tu tarjeta de forma segura."
            : "Elige cómo quieres pagar tu servicio."}
        </p>
      </div>

      {/* Monto */}
      <div className="mb-5 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
        <span className="text-sm font-semibold text-muted-foreground">Total a pagar</span>
        <span className="text-2xl font-extrabold text-primary">{displayAmount}</span>
      </div>

      {/* ── PASO: seleccionar tarjeta ──────────────────────────────────────── */}
      {payStep === "select-card" && (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Tus tarjetas guardadas
          </p>

          {cardsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {cardsError && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {cardsError}
              <button onClick={loadSavedCards} className="ml-auto flex items-center gap-1 underline">
                <RefreshCw className="size-3" /> Reintentar
              </button>
            </div>
          )}

          {!cardsLoading && savedCards.length === 0 && !cardsError && (
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center">
              <CreditCard className="mx-auto mb-2 size-8 text-muted-foreground/50" />
              <p className="text-sm font-semibold text-muted-foreground">No tienes tarjetas guardadas</p>
              <p className="mt-1 text-xs text-muted-foreground">Agrega una para continuar.</p>
            </div>
          )}

          {!cardsLoading && savedCards.length > 0 && (
            <div className="space-y-2">
              {savedCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                    selectedCard?.id === card.id
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <span className={cn(
                    "flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-xs font-extrabold",
                    getBrandColor(card.brand)
                  )}>
                    {getBrandLabel(card.brand)}
                  </span>
                  <div className="flex-1">
                    <p className="font-mono text-sm font-semibold">•••• •••• •••• {card.last4}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence {String(card.exp_month).padStart(2, "0")}/{card.exp_year}
                    </p>
                  </div>
                  {selectedCard?.id === card.id && (
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Botón agregar nueva tarjeta */}
          <button
            onClick={() => { setSelectedCard(null); setLocalError(null); setPayStep("add-new-card"); }}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-border px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="size-4" />
            Agregar tarjeta nueva
          </button>

          {/* Nav */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              ← Atrás
            </button>
            <button
              disabled={!selectedCard}
              onClick={() => setPayStep("confirm-cvv")}
              className={cn(
                "flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50 hover:bg-primary/90"
              )}
            >
              Continuar <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── PASO: formulario nueva tarjeta ─────────────────────────────────── */}
      {payStep === "add-new-card" && (
        <div>
          {!MP_PUBLIC_KEY && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              <AlertCircle className="size-4 shrink-0" />
              Falta configurar <code className="mx-1 font-mono">NEXT_PUBLIC_MP_PUBLIC_KEY</code> en .env.local
            </div>
          )}

          {/* Badge seguridad */}
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
            <Lock className="size-3.5 shrink-0" />
            Tus datos están cifrados y protegidos por Mercado Pago
          </div>

          {/* Número de tarjeta */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Número de tarjeta
            </label>
            <div
              id="mp-new-card-number"
              className={cn(
                "flex h-12 items-center rounded-xl border border-border bg-background px-4 text-sm",
                "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
                !newCardReady && "bg-muted/30"
              )}
            />
          </div>

          {/* Expiración + CVV en grid */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Vencimiento
              </label>
              <div
                id="mp-new-card-exp"
                className="flex h-12 items-center rounded-xl border border-border bg-background px-4 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                CVV
              </label>
              <div
                id="mp-new-card-cvv"
                className="flex h-12 items-center rounded-xl border border-border bg-background px-4 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              />
            </div>
          </div>

          {/* Cuotas */}
          <div className="mb-4 flex items-center gap-3">
            <label className="shrink-0 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Cuotas
            </label>
            <select
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {[1, 2, 3, 6, 12].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "1 cuota (sin intereses)" : `${n} cuotas`}
                </option>
              ))}
            </select>
          </div>

          {/* Checkbox guardar tarjeta */}
          <label className="mb-5 flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50">
            <input
              type="checkbox"
              checked={saveNewCard}
              onChange={(e) => setSaveNewCard(e.target.checked)}
              className="size-4 accent-primary"
            />
            <div>
              <p className="text-sm font-semibold">Guardar tarjeta para futuras compras</p>
              <p className="text-xs text-muted-foreground">
                Solo guardamos los últimos 4 dígitos y la fecha de vencimiento.
              </p>
            </div>
          </label>

          {/* Error */}
          {activeError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span className="flex-1">{activeError}</span>
              <button onClick={() => setLocalError(null)} aria-label="Cerrar error">
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => { setPayStep("select-card"); setLocalError(null); setSaveNewCard(false); }}
              className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft className="size-4" /> Atrás
            </button>
            <button
              disabled={!newCardReady || paying || savingCard}
              onClick={handlePayWithNewCard}
              className={cn(
                "flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50 hover:bg-primary/90"
              )}
            >
              {paying || savingCard ? (
                <><Loader2 className="size-4 animate-spin" /> Procesando…</>
              ) : (
                <><Lock className="size-4" /> Pagar {displayAmount}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── PASO: confirmar CVV tarjeta guardada ───────────────────────────── */}
      {payStep === "confirm-cvv" && selectedCard && (
        <div>
          {/* Tarjeta seleccionada */}
          <div className="mb-5 flex items-center gap-4 rounded-xl bg-muted/50 px-4 py-3">
            <span className={cn(
              "flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-xs font-extrabold",
              getBrandColor(selectedCard.brand)
            )}>
              {getBrandLabel(selectedCard.brand)}
            </span>
            <div className="flex-1">
              <p className="font-mono text-sm font-semibold">•••• •••• •••• {selectedCard.last4}</p>
              <p className="text-xs text-muted-foreground">
                Vence {String(selectedCard.exp_month).padStart(2, "0")}/{selectedCard.exp_year}
              </p>
            </div>
            <button
              onClick={() => { setPayStep("select-card"); setCvvReady(false); }}
              className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Cambiar
            </button>
          </div>

          {/* CVV */}
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Código de seguridad (CVV)
          </label>
          <div
            id="mp-cvv-container"
            ref={cvvContainerRef}
            className={cn(
              "mb-5 flex h-12 items-center rounded-xl border border-border bg-muted/30 px-4",
              "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
              !cvvReady && "animate-pulse"
            )}
          />

          {/* Cuotas */}
          <div className="mb-5 flex items-center gap-3">
            <label className="shrink-0 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Cuotas
            </label>
            <select
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {[1, 2, 3, 6, 12].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "1 cuota (sin intereses)" : `${n} cuotas`}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {activeError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span className="flex-1">{activeError}</span>
              <button onClick={() => setLocalError(null)} aria-label="Cerrar error">
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => { setPayStep("select-card"); setCvvReady(false); setLocalError(null); }}
              className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft className="size-4" /> Atrás
            </button>
            <button
              disabled={!cvvReady || paying}
              onClick={handlePayWithSaved}
              className={cn(
                "flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50 hover:bg-primary/90"
              )}
            >
              {paying ? (
                <><Loader2 className="size-4 animate-spin" /> Procesando…</>
              ) : (
                <><Lock className="size-4" /> Pagar {displayAmount}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
