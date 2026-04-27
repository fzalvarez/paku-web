"use client";

import { useState, useCallback } from "react";
import {
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  CalendarDays,
  PawPrint,
  MapPin,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Pasos del wizard
export type BookingStep =
  | "select-pet" // Paso 1: Seleccionar mascota
  | "select-service" // Paso 2: Seleccionar servicio + addons
  | "select-date" // Paso 3+4: Fecha/hora + disponibilidad
  | "select-address" // Paso 3: Dirección de entrega
  | "review-cart" // Paso 5+6: Revisar carrito
  | "payment" // Paso 7: Pago con Mercado Pago
  | "order-confirmed"; // Paso 9+10: Orden creada

const STEPS: { id: BookingStep; label: string; icon: React.ReactNode }[] = [
  { id: "select-pet", label: "Mascota", icon: <PawPrint className="size-4" /> },
  {
    id: "select-service",
    label: "Servicio",
    icon: <ClipboardList className="size-4" />,
  },
  {
    id: "select-date",
    label: "Fecha",
    icon: <CalendarDays className="size-4" />,
  },
  {
    id: "select-address",
    label: "Dirección",
    icon: <MapPin className="size-4" />,
  },
  {
    id: "review-cart",
    label: "Revisar",
    icon: <ShoppingCart className="size-4" />,
  },
  { id: "payment", label: "Pago", icon: <CreditCard className="size-4" /> },
];

const STEP_ORDER: BookingStep[] = [
  "select-pet",
  "select-service",
  "select-date",
  "select-address",
  "review-cart",
  "payment",
  "order-confirmed",
];

interface WizardProgressProps {
  currentStep: BookingStep;
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  return (
    <nav className="mb-8 w-full">
      <ol className="flex items-center justify-between gap-0 w-full">
        {STEPS.map((step, idx) => {
          const stepIdx = STEP_ORDER.indexOf(step.id);
          const isCompleted = stepIdx < currentIdx;
          const isActive = step.id === currentStep;

          return (
            <li key={step.id} className="flex items-center relative">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isActive && "border-primary bg-primary/10 text-primary",
                    !isCompleted &&
                      !isActive &&
                      "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-[11px] font-semibold sm:block",
                    isActive
                      ? "text-primary"
                      : isCompleted
                        ? "text-primary/70"
                        : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-1 transition-all absolute top-1/2 -translate-y-1/2 left-[113%] w-20",
                    stepIdx < currentIdx ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Hook para navegar entre pasos
export function useWizardNavigation(initialStep: BookingStep = "select-pet") {
  const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep);

  const goTo = useCallback((step: BookingStep) => {
    setCurrentStep(step);
  }, []);

  const goNext = useCallback(() => {
    const idx = STEP_ORDER.indexOf(currentStep);
    if (idx < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[idx + 1]);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    const idx = STEP_ORDER.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(STEP_ORDER[idx - 1]);
    }
  }, [currentStep]);

  const canGoBack =
    STEP_ORDER.indexOf(currentStep) > 0 && currentStep !== "order-confirmed";

  return { currentStep, goTo, goNext, goBack, canGoBack };
}

// Botones de navegación inferiores del wizard
interface WizardNavButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  children?: React.ReactNode;
}

export function WizardNavButtons({
  onBack,
  onNext,
  canGoBack,
  nextLabel = "Continuar",
  nextDisabled,
  nextLoading,
  children,
}: WizardNavButtonsProps) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {canGoBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
        >
          ← Atrás
        </button>
      ) : (
        <span />
      )}
      {children ?? (
        <button
          onClick={onNext}
          disabled={nextDisabled || nextLoading}
          className={cn(
            "flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:bg-primary/90 active:scale-95",
          )}
        >
          {nextLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="size-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Cargando…
            </span>
          ) : (
            <>
              {nextLabel}
              <ChevronRight className="size-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
