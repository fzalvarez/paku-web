"use client";

import { useState, useCallback, useRef } from "react";
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  Lock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayments } from "@/hooks/usePayments";
import { paymentsService, getPaymentErrorMessage } from "@/lib/api/payments";
import { CardDataForm } from "@/components/payment/CardDataForm";
import type { SavedCard, CardData } from "@/types/payments";
import type { OrderOut } from "@/types/orders";

// ─── Métodos de pago ──────────────────────────────────────────────────────────

type PaymentMethod = "card" | "simulated";

// ─── Paso del flujo ───────────────────────────────────────────────────────────

type PayStep =
  | "method-select"  // Elegir entre tarjeta o simulado
  | "select-card"    // Lista de tarjetas guardadas
  | "add-new-card"   // Formulario para tarjeta nueva
  | "processing"     // Procesando pago
  | "success"        // Pago exitoso (payment_status="paid")
  | "verifying"      // Cobro intentado, banco no confirmó a tiempo (payment_status="verifying")
  | "failed";        // Error o rechazo (payment_status="failed")

interface StepPaymentCulqiProps {
  /** Orden ya creada (POST /orders) que se va a cobrar con POST /orders/{id}/pay */
  orderId: string;
  amountCents: number;
  currency?: "PEN" | "USD";
  onPaymentSuccess: (order: OrderOut) => void;
  onBack: () => void;
  /** Estado de pago con que llega la orden (p. ej. "failed" al reintentar desde Mis pedidos) */
  initialPaymentStatus?: OrderOut["payment_status"];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BRAND_LABELS: Record<string, string> = {
  visa: "VISA",
  master: "MC",
  mastercard: "MC",
  amex: "AMEX",
  debvisa: "VISA DB",
  debmaster: "MC DB",
};

function getBrandLabel(b: string) {
  return BRAND_LABELS[b?.toLowerCase()] ?? b?.toUpperCase() ?? "??";
}

function getBrandColor(b: string) {
  const bl = b?.toLowerCase();
  if (bl?.includes("visa")) return "bg-blue-800 text-white";
  if (bl?.includes("master")) return "bg-red-600 text-white";
  if (bl?.includes("amex")) return "bg-blue-500 text-white";
  return "bg-muted text-muted-foreground";
}

function formatAmount(centsAmount: number, currency: "PEN" | "USD" = "PEN"): string {
  const amount = centsAmount / 100;
  const currencySymbol = currency === "PEN" ? "S/" : "USD";
  return `${currencySymbol} ${amount.toFixed(2)}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

/** El pago simulado es solo para desarrollo — nunca debe verse en producción. */
const SHOW_SIMULATED_PAYMENT = process.env.NODE_ENV !== "production";

export function StepPaymentCulqi({
  orderId,
  amountCents,
  currency = "PEN",
  onPaymentSuccess,
  onBack,
  initialPaymentStatus,
}: StepPaymentCulqiProps) {
  // Tras un rechazo la orden queda "failed": el siguiente intento debe pasar por
  // retry-payment antes de /pay (ver usePayments.payOrder).
  const needsRetryRef = useRef(initialPaymentStatus === "failed");
  const {
    savedCards,
    cardsLoading,
    cardsError,
    loadSavedCards,
    paying,
    payError,
    payOrder,
    savingCard,
    saveCardError,
  } = usePayments();

  // ─── Estado del flujo ──────────────────────────────────────────────────────

  const [payMethod, setPayMethod] = useState<PaymentMethod>("card");
  const [payStep, setPayStep] = useState<PayStep>("method-select");
  const [selectedCard, setSelectedCard] = useState<SavedCard | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Al seleccionar tarjeta como método, avanzar directamente y cargar tarjetas.
  // Esta lógica se maneja en el handler del botón "Continuar" (ver JSX)
  // para evitar setState síncrono en effects.

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handlePaymentResult = useCallback(
    (order: OrderOut) => {
      if (order.payment_status === "failed") {
        needsRetryRef.current = true;
        setLocalError("Tu pago fue rechazado. Intenta con otra tarjeta.");
        setPayStep("failed");
        return;
      }
      // "paid" o "verifying" — ambos son un flujo exitoso desde la UI, la
      // pantalla de confirmación distingue el mensaje según el estado real.
      setPayStep(order.payment_status === "verifying" ? "verifying" : "success");
      setTimeout(() => onPaymentSuccess(order), 1200);
    },
    [onPaymentSuccess]
  );

  const handlePayWithSavedCard = useCallback(async () => {
    if (!selectedCard) {
      setLocalError("Selecciona una tarjeta");
      return;
    }

    setLocalError(null);

    try {
      const order = await payOrder(orderId, selectedCard.payment_method_id, needsRetryRef.current);
      handlePaymentResult(order);
    } catch (err) {
      needsRetryRef.current = true;
      setLocalError(getPaymentErrorMessage(err));
      setPayStep("failed");
    }
  }, [selectedCard, orderId, payOrder, handlePaymentResult]);

  const handleSaveAndPay = useCallback(
    async (cardData: CardData) => {
      setLocalError(null);

      try {
        // 1. Tokenizar directamente con Culqi
        const token = await paymentsService.createToken(cardData);

        // 2. Cobrar la orden con el token (source_id = tkn_test_xxx)
        const order = await payOrder(orderId, token.id, needsRetryRef.current);
        handlePaymentResult(order);
      } catch (err) {
        needsRetryRef.current = true;
        setLocalError(getPaymentErrorMessage(err));
        setPayStep("failed");
      }
    },
    [orderId, payOrder, handlePaymentResult]
  );

  const displayAmount = formatAmount(amountCents, currency);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* ── PASO: seleccionar método de pago ── */}
      {payStep === "method-select" && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Selecciona un método de pago</h3>

          {/* Tarjeta */}
          <button
            onClick={() => setPayMethod("card")}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
              payMethod === "card"
                ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                : "border-border hover:border-primary/40"
            )}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <CreditCard className="size-5 text-primary" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Tarjeta débito / crédito</p>
              <p className="text-xs text-muted-foreground mt-0.5">Culqi · SSL cifrado</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>

          {/* Pago simulado — oculto en producción */}
          {SHOW_SIMULATED_PAYMENT && (
            <button
              onClick={() => setPayMethod("simulated")}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                payMethod === "simulated"
                  ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                  : "border-border hover:border-primary/40"
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                <CheckCircle2 className="size-5 text-secondary" />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-sm">Pago simulado (solo desarrollo)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Para testing</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          )}

          {/* Botones */}
          <div className="flex items-center justify-between gap-3 pt-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft className="size-4" /> Atrás
            </button>
            <button
              disabled={payMethod === "card" && cardsLoading}
              onClick={() => {
                if (payMethod === "simulated") {
                  setPayStep("success");
                } else {
                  // Las tarjetas ya se cargan solas al montar el hook
                  // (usePayments) — acá solo decidimos con el estado ya
                  // resuelto, nunca disparamos una carga nueva desde acá.
                  setPayStep(savedCards.length > 0 ? "select-card" : "add-new-card");
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {payMethod === "card" && cardsLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Cargando…
                </>
              ) : (
                <>
                  Continuar <ChevronRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── PASO: seleccionar tarjeta guardada ── */}
      {payStep === "select-card" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Selecciona una tarjeta</h3>

          {/* Cargando */}
          {cardsLoading && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/60 py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cargando tarjetas…</span>
            </div>
          )}

          {/* Error cargando */}
          {cardsError && (
            <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4">
              <AlertCircle className="size-5 shrink-0 text-destructive" />
              <p className="flex-1 text-sm text-destructive">{cardsError}</p>
              <button
                onClick={loadSavedCards}
                className="flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="size-3.5" /> Reintentar
              </button>
            </div>
          )}

          {/* Sin tarjetas */}
          {!cardsLoading && !cardsError && savedCards.length === 0 && (
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-linear-to-br from-primary/10 via-secondary/5 to-tertiary/10">
                <CreditCard className="size-10 text-primary/50" />
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-foreground">
                  Aún no tienes tarjetas guardadas
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Agrega una para agilizar el proceso de pago.
                </p>
              </div>
            </div>
          )}

          {/* Lista de tarjetas */}
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
                  <span
                    className={cn(
                      "flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-xs font-extrabold",
                      getBrandColor(card.brand)
                    )}
                  >
                    {getBrandLabel(card.brand)}
                  </span>
                  <div className="flex-1">
                    <p className="font-mono text-sm font-semibold">
                      •••• •••• •••• {card.last4}
                    </p>
                    {card.exp_year > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Vence {String(card.exp_month).padStart(2, "0")}/{card.exp_year}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Agregar nueva tarjeta */}
          {!cardsLoading && (
            <button
              onClick={() => setPayStep("add-new-card")}
              className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 font-semibold text-primary hover:border-primary/60 hover:bg-primary/10"
            >
              <Plus className="size-5" />
              Agregar nueva tarjeta
            </button>
          )}

          {/* Error general */}
          {localError && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span className="flex-1">{localError}</span>
              <button
                onClick={() => setLocalError(null)}
                aria-label="Cerrar error"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex items-center justify-between gap-3 pt-4">
            <button
              onClick={() => {
                setPayStep("method-select");
                setSelectedCard(null);
                setLocalError(null);
              }}
              className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft className="size-4" /> Atrás
            </button>
            <button
              disabled={!selectedCard || paying}
              onClick={handlePayWithSavedCard}
              className={cn(
                "flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50 hover:bg-primary/90"
              )}
            >
              {paying ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Procesando…
                </>
              ) : (
                <>
                  <Lock className="size-4" /> Pagar {displayAmount}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── PASO: agregar nueva tarjeta ── */}
      {payStep === "add-new-card" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Nueva tarjeta</h3>
          <CardDataForm
            onSubmit={handleSaveAndPay}
            isLoading={savingCard || paying}
            error={saveCardError || payError || localError}
            onErrorDismiss={() => setLocalError(null)}
            onCancel={() => {
              if (savedCards.length > 0) {
                setPayStep("select-card");
              } else {
                setPayStep("method-select");
              }
            }}
            amountDisplay={displayAmount}
          />
        </div>
      )}

      {/* ── PASO: éxito ── */}
      {payStep === "success" && (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-green-50 py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="size-8 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-green-900">¡Pago exitoso!</p>
            <p className="text-sm text-green-700">
              Tu pedido ha sido procesado correctamente.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Redirigiendo…
          </p>
        </div>
      )}

      {/* ── PASO: verificando (microcorte al confirmar con el banco, no es un error) ── */}
      {payStep === "verifying" && (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-amber-50 py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-amber-100">
            <Loader2 className="size-8 animate-spin text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-900">Confirmando tu pago…</p>
            <p className="text-sm text-amber-700">
              Estamos confirmando tu pago con el banco 🏦, te avisaremos en cuanto se confirme.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Redirigiendo…
          </p>
        </div>
      )}

      {/* ── PASO: error ── */}
      {payStep === "failed" && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-destructive/10 py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/20">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <div>
              <p className="font-bold">Pago no procesado</p>
              <p className="text-sm text-muted-foreground">
                {localError || "Ocurrió un error al procesar tu pago."}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setPayStep("select-card");
                setLocalError(null);
              }}
              className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft className="size-4" /> Atrás
            </button>
            <button
              onClick={() => {
                setPayStep("select-card");
                setLocalError(null);
              }}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className="size-4" /> Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
