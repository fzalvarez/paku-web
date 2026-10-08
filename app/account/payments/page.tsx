"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Loader2,
  CheckCircle2,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { EmptyState } from "@/components/account/EmptyState";
import { InlineAlert } from "@/components/account/InlineAlert";
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

      <div className="flex shrink-0 items-center gap-2">
        {card.is_default && (
          <Badge>
            <Star className="fill-primary" />
            Predeterminada
          </Badge>
        )}
        {onDelete && (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onDelete(card.id)}
            disabled={deleting}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Eliminar tarjeta"
          >
            {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
          </Button>
        )}
      </div>
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
      <AccountPageHeader
        title="Métodos de pago"
        description="Gestiona tus tarjetas de crédito y débito de forma segura."
        action={
          savedCards.length > 0 && !showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2" aria-label="Agregar tarjeta">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Agregar tarjeta</span>
            </Button>
          )
        }
      />

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
        <InlineAlert onRetry={loadSavedCards}>{cardsError}</InlineAlert>
      )}

      {/* Estado: sin tarjetas */}
      {!cardsLoading && !cardsError && savedCards.length === 0 && !showForm && (
        <EmptyState
          icon={CreditCard}
          title="Aún no tienes tarjetas guardadas"
          description="Agrega una tarjeta para agilizar el proceso de pago en tus próximas compras."
          action={
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="size-4" />
              Agregar tarjeta
            </Button>
          }
        />
      )}

      {/* Estado: con tarjetas */}
      {!cardsLoading && savedCards.length > 0 && (
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
      )}

      {/* Error al eliminar */}
      {deleteCardError && <InlineAlert>{deleteCardError}</InlineAlert>}

      {/* Sección de seguridad */}
      <div className="mt-2 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
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
