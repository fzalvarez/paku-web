"use client";

import { useState, useCallback } from "react";
import { AlertCircle, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardData } from "@/types/payments";

interface CardDataFormProps {
  onSubmit: (cardData: CardData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
  onCancel?: () => void;
  amountDisplay?: string;
  /** Texto del botón de envío. Por defecto: "Pagar {amountDisplay}" si hay
   * monto, o "Guardar tarjeta" si no (ej. cuando solo se está guardando
   * una tarjeta sin cobrar, como en /account/payments). */
  submitLabel?: string;
}

/**
 * Formulario para capturar datos de tarjeta de crédito.
 * Los datos se pasan directamente a Culqi para tokenización — nunca al backend propio.
 */
export function CardDataForm({
  onSubmit,
  isLoading = false,
  error,
  onErrorDismiss,
  onCancel,
  amountDisplay,
  submitLabel,
}: CardDataFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [email, setEmail] = useState("");

  // Detectar marca de tarjeta
  const detectBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, "");
    if (/^4/.test(cleaned)) return "visa";
    if (/^5[1-5]/.test(cleaned)) return "mastercard";
    if (/^3[47]/.test(cleaned)) return "amex";
    return "";
  };

  const brand = detectBrand(cardNumber);
  const isFormValid =
    cardNumber.replace(/\s/g, "").length >= 13 &&
    cardHolder.trim().length >= 2 &&
    expiryMonth.length === 2 &&
    expiryYear.length === 4 &&
    cvv.length >= 3 &&
    email.includes("@");

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ").slice(0, 19);
  };

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return;

    try {
      const cardData: CardData = {
        card_number: cardNumber.replace(/\s/g, ""),
        cvv,
        expiration_month: expiryMonth,
        expiration_year: expiryYear,
        email,
      };

      await onSubmit(cardData);
    } catch (err) {
      console.error("Error enviando datos de tarjeta:", err);
    }
  }, [cardNumber, cvv, expiryMonth, expiryYear, email, isFormValid, onSubmit]);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={onErrorDismiss}
            aria-label="Cerrar error"
            className="shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Número de tarjeta */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Número de tarjeta
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            disabled={isLoading}
            className={cn(
              "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-mono",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              "disabled:bg-muted disabled:text-muted-foreground",
              brand && "border-primary/40"
            )}
            maxLength={19}
          />
          {brand && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-muted-foreground">
              {brand}
            </span>
          )}
        </div>
      </div>

      {/* Titular */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Titular de la tarjeta
        </label>
        <input
          type="text"
          placeholder="Nombre Apellido"
          value={cardHolder}
          onChange={(e) =>
            setCardHolder(e.target.value.toUpperCase())
          }
          disabled={isLoading}
          className={cn(
            "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:bg-muted disabled:text-muted-foreground"
          )}
        />
      </div>

      {/* Vencimiento y CVV */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Mes
          </label>
          <select
            value={expiryMonth}
            onChange={(e) => setExpiryMonth(e.target.value)}
            disabled={isLoading}
            className={cn(
              "w-full rounded-xl border border-border bg-background px-3 py-3 text-sm",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              "disabled:bg-muted disabled:text-muted-foreground"
            )}
          >
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={String(m).padStart(2, "0")}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Año
          </label>
          <select
            value={expiryYear}
            onChange={(e) => setExpiryYear(e.target.value)}
            disabled={isLoading}
            className={cn(
              "w-full rounded-xl border border-border bg-background px-3 py-3 text-sm",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              "disabled:bg-muted disabled:text-muted-foreground"
            )}
          >
            <option value="">YY</option>
            {Array.from({ length: 20 }, (_, i) => {
              const year = new Date().getFullYear() + i;
              // Culqi exige el año completo de 4 dígitos — se guarda así,
              // aunque en el selector se muestre corto (más compacto).
              return (
                <option key={year} value={String(year)}>
                  {String(year).slice(-2)}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            CVV
          </label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            disabled={isLoading}
            className={cn(
              "w-full rounded-xl border border-border bg-background px-3 py-3 text-sm font-mono",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              "disabled:bg-muted disabled:text-muted-foreground"
            )}
            maxLength={4}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Correo electrónico
        </label>
        <input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className={cn(
            "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:bg-muted disabled:text-muted-foreground"
          )}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Se usa para el recibo y confirmación del pago
        </p>
      </div>

      {/* Aviso de seguridad */}
      <div className="flex items-start gap-3 rounded-xl bg-primary/5 px-3 py-3">
        <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-xs text-primary">
          Tus datos de tarjeta se envían directamente a Culqi y se tokenizar de forma segura. Nunca almacenamos el PAN ni CVV en nuestros servidores.
        </p>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-between gap-3 pt-4">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className={cn(
            "flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all",
            "disabled:cursor-not-allowed disabled:opacity-50 hover:bg-primary/90"
          )}
        >
          {isLoading ? (
            <>
              <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Procesando…
            </>
          ) : (
            <>
              <Lock className="size-4" />
              {submitLabel ?? (amountDisplay ? `Pagar ${amountDisplay}` : "Guardar tarjeta")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
