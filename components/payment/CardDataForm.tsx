"use client";

import { useState, useCallback } from "react";
import { AlertCircle, Loader2, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
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
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={onErrorDismiss}
            aria-label="Cerrar error"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <X />
          </Button>
        </div>
      )}

      {/* Número de tarjeta */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-number">Número de tarjeta</Label>
        <div className="relative">
          <Input
            id="card-number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            disabled={isLoading}
            className={cn("font-mono", brand && "border-primary/40 pr-24")}
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-holder">Titular de la tarjeta</Label>
        <Input
          id="card-holder"
          type="text"
          autoComplete="cc-name"
          placeholder="Nombre Apellido"
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
          disabled={isLoading}
        />
      </div>

      {/* Vencimiento y CVV */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-exp-month">Mes</Label>
          <NativeSelect
            id="card-exp-month"
            value={expiryMonth}
            onChange={(e) => setExpiryMonth(e.target.value)}
            disabled={isLoading}
          >
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={String(m).padStart(2, "0")}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-exp-year">Año</Label>
          <NativeSelect
            id="card-exp-year"
            value={expiryYear}
            onChange={(e) => setExpiryYear(e.target.value)}
            disabled={isLoading}
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
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-cvv">CVV</Label>
          <Input
            id="card-cvv"
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            disabled={isLoading}
            className="font-mono"
            maxLength={4}
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-email">Correo electrónico</Label>
        <Input
          id="card-email"
          type="email"
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Se usa para el recibo y confirmación del pago
        </p>
      </div>

      {/* Aviso de seguridad */}
      <div className="flex items-start gap-3 rounded-xl bg-primary/5 px-3 py-3">
        <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-xs text-primary">
          Tus datos de tarjeta se envían directamente a Culqi y se tokenizan de forma segura. Nunca almacenamos el PAN ni CVV en nuestros servidores.
        </p>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={!isFormValid || isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Procesando…
            </>
          ) : (
            <>
              <Lock className="size-4" />
              {submitLabel ?? (amountDisplay ? `Pagar ${amountDisplay}` : "Guardar tarjeta")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
