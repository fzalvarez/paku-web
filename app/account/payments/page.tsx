"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CreditCard, Plus, Lock, AlertCircle, Loader2,
  CheckCircle2, X, RefreshCw, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayments } from "@/hooks/usePayments";

// ── Tipos globales para el SDK de MP ──────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MercadoPago: any;
  }
}

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
  return "bg-slate-600 text-white";
}
function formatExpiry(month: number, year: number) {
  return `${String(month).padStart(2, "0")}/${year}`;
}

// ── Componente: tarjeta guardada ──────────────────────────────────────────────

interface SavedCardItemProps {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  onDelete: (id: string) => void;
  deleting: boolean;
}

function SavedCardItem({ id, brand, last4, exp_month, exp_year, onDelete, deleting }: SavedCardItemProps) {
  const [confirm, setConfirm] = useState(false);
  const isExpired = (() => {
    const now = new Date();
    return (
      exp_year < now.getFullYear() ||
      (exp_year === now.getFullYear() && exp_month < now.getMonth() + 1)
    );
  })();

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border bg-background shadow-sm transition-shadow hover:shadow-md",
      isExpired ? "border-orange-200" : "border-border/60"
    )}>
      {/* Franja de color por marca */}
      <div className={cn("h-1 w-full", getBrandColor(brand))} />

      <div className="flex items-center gap-4 p-4">
        {/* Badge marca */}
        <span className={cn(
          "flex h-10 w-14 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold shadow-sm",
          getBrandColor(brand)
        )}>
          {getBrandLabel(brand)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-semibold">•••• •••• •••• {last4}</p>
          <p className={cn(
            "mt-0.5 text-xs",
            isExpired ? "font-semibold text-orange-600" : "text-muted-foreground"
          )}>
            {isExpired ? "⚠ Expirada — " : "Vence "}
            {formatExpiry(exp_month, exp_year)}
          </p>
        </div>

        {/* Acción eliminar */}
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            disabled={deleting}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            aria-label="Eliminar tarjeta"
          >
            <Trash2 className="size-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">¿Eliminar?</span>
            <button
              onClick={() => onDelete(id)}
              disabled={deleting}
              className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-40"
            >
              {deleting ? <Loader2 className="size-3 animate-spin" /> : "Sí"}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente: formulario nueva tarjeta ──────────────────────────────────────

interface AddCardFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function AddCardForm({ onSuccess, onCancel }: AddCardFormProps) {
  const { savingCard, saveCardError, saveCard } = usePayments();
  const mpRef        = useRef<unknown>(null);
  const sdkReadyRef  = useRef(false);
  const unmountRef   = useRef<(() => void) | null>(null);
  const [fieldReady, setFieldReady] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [saved, setSaved]           = useState(false);

  const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "";

  // Cargar SDK
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
      const s   = document.createElement("script");
      s.id      = "mp-sdk";
      s.src     = "https://sdk.mercadopago.com/js/v2";
      s.async   = true;
      s.onload  = () => {
        mpRef.current     = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "es-PE" });
        sdkReadyRef.current = true;
        resolve();
      };
      document.head.appendChild(s);
    });
  }, [MP_PUBLIC_KEY]);

  // Montar Secure Fields
  useEffect(() => {
    if (!MP_PUBLIC_KEY) return;

    let cancelled = false;
    (async () => {
      await ensureSdk();
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mp = mpRef.current as any;
      if (!mp) return;
      try {
        unmountRef.current?.();
        const common = {
          color: "inherit", fontSize: "14px", fontFamily: "inherit",
          "::placeholder": { color: "#94a3b8" },
        };
        const fNum = mp.fields.create("cardNumber",     { placeholder: "1234 5678 9012 3456", style: common });
        const fExp = mp.fields.create("expirationDate", { placeholder: "MM/AA",               style: common });
        const fCvv = mp.fields.create("securityCode",   { placeholder: "•••",                 style: common });

        fNum.mount("acp-card-number");
        fExp.mount("acp-card-exp");
        fCvv.mount("acp-card-cvv");

        fNum.on("ready", () => { if (!cancelled) setFieldReady(true); });

        unmountRef.current = () => {
          try { fNum.unmount?.(); fExp.unmount?.(); fCvv.unmount?.(); } catch { /* noop */ }
        };
      } catch {
        if (!cancelled) setLocalError("No se pudo cargar el formulario. Recarga la página.");
      }
    })();

    return () => {
      cancelled = true;
      unmountRef.current?.();
      unmountRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    setLocalError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mp = mpRef.current as any;
      const tokenResult = await mp.fields.createCardToken({});
      if (!tokenResult?.id) throw new Error("No se pudo tokenizar la tarjeta.");
      await saveCard(tokenResult.id);
      setSaved(true);
      setTimeout(onSuccess, 1200);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Error al guardar la tarjeta.");
    }
  }

  const activeError = localError ?? saveCardError;

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="size-7 text-green-600" />
        </div>
        <p className="font-bold text-foreground">¡Tarjeta guardada!</p>
        <p className="text-sm text-muted-foreground">Tu tarjeta ha sido agregada correctamente.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-background shadow-sm">
      {/* Header del formulario */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="size-4 text-primary" />
          </div>
          <p className="font-bold text-foreground">Nueva tarjeta</p>
        </div>
        <button
          onClick={onCancel}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          aria-label="Cancelar"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="p-5">
        {!MP_PUBLIC_KEY && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            <AlertCircle className="size-4 shrink-0" />
            Falta <code className="mx-1 font-mono text-xs">NEXT_PUBLIC_MP_PUBLIC_KEY</code> en .env.local
          </div>
        )}

        {/* Seguridad */}
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
          <Lock className="size-3.5 shrink-0" />
          Cifrado y protegido por Mercado Pago · PCI-DSS
        </div>

        {/* Número */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Número de tarjeta
          </label>
          <div
            id="acp-card-number"
            className={cn(
              "flex h-12 items-center rounded-xl border border-border bg-muted/30 px-4 text-sm",
              "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
              !fieldReady && "animate-pulse"
            )}
          />
        </div>

        {/* Vencimiento + CVV */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Vencimiento
            </label>
            <div
              id="acp-card-exp"
              className="flex h-12 items-center rounded-xl border border-border bg-muted/30 px-4 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              CVV
            </label>
            <div
              id="acp-card-cvv"
              className="flex h-12 items-center rounded-xl border border-border bg-muted/30 px-4 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
            />
          </div>
        </div>

        {/* Error */}
        {activeError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span className="flex-1">{activeError}</span>
            <button onClick={() => setLocalError(null)} aria-label="Cerrar">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            disabled={!fieldReady || savingCard}
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all",
              "disabled:cursor-not-allowed disabled:opacity-50 hover:bg-primary/90"
            )}
          >
            {savingCard ? (
              <><Loader2 className="size-4 animate-spin" /> Guardando…</>
            ) : (
              <><Lock className="size-4" /> Guardar tarjeta</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const { savedCards, cardsLoading, cardsError, loadSavedCards } = usePayments();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Nota: la API actual no expone DELETE /api/payment-methods
  // Mostramos el botón pero informamos al usuario
  async function handleDelete(id: string) {
    setDeletingId(id);
    // TODO: implementar cuando el backend exponga el endpoint
    await new Promise((r) => setTimeout(r, 600));
    setDeletingId(null);
    alert("La eliminación de tarjetas estará disponible próximamente.");
  }

  function handleAddSuccess() {
    setShowForm(false);
    loadSavedCards();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Métodos de pago
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra tus tarjetas guardadas para pagos más rápidos.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            Nueva tarjeta
          </button>
        )}
      </div>

      {/* Info de seguridad */}
      <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
          <Lock className="size-4" />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">Pagos 100% seguros</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Tus datos de pago están cifrados y protegidos. Nunca almacenamos los números
            completos de tus tarjetas. Utilizamos Mercado Pago, certificado PCI-DSS.
          </p>
        </div>
      </div>

      {/* Formulario nueva tarjeta */}
      {showForm && (
        <AddCardForm
          onSuccess={handleAddSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Estado: cargando */}
      {cardsLoading && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background py-12 shadow-sm">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Cargando tarjetas…</span>
        </div>
      )}

      {/* Estado: error */}
      {!cardsLoading && cardsError && (
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

      {/* Estado: sin tarjetas */}
      {!cardsLoading && !cardsError && savedCards.length === 0 && !showForm && (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-linear-to-br from-primary/10 via-secondary/5 to-tertiary/10">
            <CreditCard className="size-10 text-primary/50" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-foreground">
              Aún no tienes tarjetas guardadas
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Agrega una tarjeta para agilizar el proceso de pago en tus próximas compras.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Agregar tarjeta
          </button>
        </div>
      )}

      {/* Lista de tarjetas */}
      {!cardsLoading && savedCards.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {savedCards.length} tarjeta{savedCards.length !== 1 ? "s" : ""} guardada{savedCards.length !== 1 ? "s" : ""}
          </p>
          {savedCards.map((card) => (
            <SavedCardItem
              key={card.id}
              {...card}
              onDelete={handleDelete}
              deleting={deletingId === card.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
