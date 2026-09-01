"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePayments } from "@/hooks/usePayments";
import { CardDataForm } from "@/components/payment/CardDataForm";
import type { SavedCard, CardData } from "@/types/payments";

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
  return "bg-slate-600 text-white";
}

// ─── Componente de tarjeta guardada ───────────────────────────────────────────

interface SavedCardItemProps {
  card: SavedCard;
  onDelete?: (id: string) => void;
  deleting?: boolean;
}

function SavedCardItem({ card, onDelete, deleting }: SavedCardItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-sm",
        card.is_default ? "border-primary/30" : "border-border/60"
      )}
    >
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-xs font-extrabold",
            getBrandColor(card.brand)
          )}
        >
          {getBrandLabel(card.brand)}
        </span>
        <div>
          <p className="font-mono text-sm font-semibold">
            •••• •••• •••• {card.last4}
          </p>
          {card.exp_year > 0 && (
            <p className="text-xs text-muted-foreground">
              Vence {String(card.exp_month).padStart(2, "0")}/{card.exp_year}
            </p>
          )}
        </div>
      </div>

      {card.is_default && (
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          Default
        </span>
      )}

      {onDelete && (
        <button
          onClick={() => onDelete(card.id)}
          disabled={deleting}
          className="shrink-0 rounded-lg p-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Eliminar tarjeta"
        >
          {deleting ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
          )}
        </button>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const { user } = useAuthContext();
  const {
    savedCards,
    cardsLoading,
    cardsError,
    loadSavedCards,
    savingCard,
    saveCardError,
    saveCard,
    deletingCardId,
    deleteCardError,
    deleteCard,
  } = usePayments();

  const [showForm, setShowForm] = useState(false);

  // Cargar tarjetas al montar
  useEffect(() => {
    loadSavedCards();
  }, [loadSavedCards]);

  // Agregar nueva tarjeta
  const handleSaveCard = async (cardData: CardData) => {
    try {
      await saveCard({
        cardData,
        userEmail: user?.email ?? "",
        userFirstName: user?.first_name ?? "",
        userLastName: user?.last_name ?? "",
        userPhone: user?.phone ?? "000000000",
      });
      setShowForm(false);
    } catch {
      // error ya visible en saveCardError
    }
  };

  // Eliminar tarjeta
  const handleDelete = async (id: string) => {
    try {
      await deleteCard(id);
    } catch {
      // error ya visible en deleteCardError
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-primary">
            Métodos de pago
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Gestiona tus tarjetas de crédito y débito de forma segura.
          </p>
        </div>
      </div>

      {/* Formulario nueva tarjeta */}
      {showForm && (
        <CardDataForm
          onSubmit={handleSaveCard}
          isLoading={savingCard}
          error={saveCardError}
          onErrorDismiss={() => {}}
          onCancel={() => setShowForm(false)}
          submitLabel="Guardar tarjeta"
        />
      )}

      {/* Estado: cargando */}
      {cardsLoading && !showForm && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background py-12 shadow-sm">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Cargando tarjetas…
          </span>
        </div>
      )}

      {/* Estado: error cargando */}
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
              Agrega una tarjeta para agilizar el proceso de pago en tus
              próximas compras.
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

      {/* Estado: con tarjetas */}
      {!cardsLoading && savedCards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Tus tarjetas</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-4" /> Agregar
              </button>
            )}
          </div>

          <div className="space-y-3">
            {savedCards.map((card) => (
              <SavedCardItem
                key={card.id}
                card={card}
                onDelete={handleDelete}
                deleting={deletingCardId === card.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error al eliminar */}
      {deleteCardError && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{deleteCardError}</p>
        </div>
      )}

      {/* Sección de seguridad */}
      <div className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="relative size-9 shrink-0">
            <div className="absolute inset-0 rounded-[42%_58%_54%_46%/56%_44%_58%_42%] bg-secondary/10" />
            <div className="absolute inset-0 flex items-center justify-center text-secondary">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div>
            <p className="font-bold text-foreground">Pagos 100% seguros</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Trabajamos con Culqi y cumplimos con los estándares de seguridad PCI-DSS.
              Los datos de tu tarjeta se tokenizan de forma segura y nunca se almacenan en nuestros servidores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
