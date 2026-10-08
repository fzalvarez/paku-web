"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { servicesService } from "@/lib/api/services";
import { petsService } from "@/lib/api/pets";
import { bookingService } from "@/lib/api/booking";
import { ordersService } from "@/lib/api/orders";
import { timeLima } from "@/lib/utils/dates";
import { notifyCartUpdated } from "@/hooks/useCart";
import { WizardProgress, useWizardNavigation } from "./WizardLayout";
import { StepSelectPet } from "./StepSelectPet";
import { StepSelectService } from "./StepSelectService";
import { StepSelectDate } from "./StepSelectDate";
import { StepSelectAddress } from "./StepSelectAddress";
import { StepReviewCart } from "./StepReviewCart";
import { StepPaymentCulqi } from "./StepPaymentCulqi";
import { StepOrderConfirmed } from "./StepOrderConfirmed";
import type { Pet } from "@/types/pets";
import type { ServiceOut, ServiceAddon } from "@/types/services";
import type { AddressOut } from "@/types/api";
import type { OrderOut } from "@/types/orders";
import type { HoldOut } from "@/types/booking";
import type { CartWithItemsOut } from "@/types/cart";
import type { BookingStep } from "./WizardLayout";

// ── Clave y helpers de sessionStorage ────────────────────────────────────────

const SESSION_KEY = "paku:booking_wizard";

interface WizardSnapshot {
  step: BookingStep;
  selectedPetId: string | null;
  selectedPet: Pet | null;
  selectedService: ServiceOut | null;
  selectedAddonIds: string[];
  selectedDate: string | null;
  selectedAddress: AddressOut | null;
  /** Reserva del cupo del día (C-15) */
  hold: HoldOut | null;
  cartId: string | null;
  pendingOrderId: string | null;
  amountCents: number;
}

function saveSnapshot(snap: WizardSnapshot) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(snap));
  } catch { /* noop */ }
}

const STEPS_AFTER_DATE: BookingStep[] = ["select-address", "review-cart"];
const HOLD_EXPIRED_NOTICE = "Tu reserva del cupo venció. Vuelve a elegir la fecha.";

/**
 * Snapshot guardado, corregido si la reserva venció mientras la pestaña
 * estaba cerrada (sin orden creada todavía): se vuelve a elegir la fecha.
 */
function loadSnapshot(): { snap: WizardSnapshot; holdExpired: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as WizardSnapshot;
    const holdExpired =
      !snap.pendingOrderId && !!snap.hold && new Date(snap.hold.expires_at).getTime() <= Date.now();
    if (!holdExpired) return { snap, holdExpired: false };
    return {
      snap: {
        ...snap,
        hold: null,
        cartId: null,
        step: STEPS_AFTER_DATE.includes(snap.step) ? "select-date" : snap.step,
      },
      holdExpired: STEPS_AFTER_DATE.includes(snap.step),
    };
  } catch { return null; }
}

function clearSnapshot() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
}

/** Libera el cupo de una reserva que ya no se usará. Best-effort: si falla, vence sola. */
function releaseHold(hold: HoldOut | null) {
  if (hold && hold.status === "held") bookingService.cancelHold(hold.id).catch(() => undefined);
}

function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
}

// ── Componente ────────────────────────────────────────────────────────────────

export function BookingWizard() {
  const { isAuthenticated } = useAuthContext();
  const searchParams = useSearchParams();
  const preselectServiceId = searchParams.get("service");
  const preselectPetId = searchParams.get("pet");

  // useState con lazy initializer — se ejecuta solo en cliente, evita mismatch SSR
  const [restored] = useState(() => loadSnapshot());
  const savedOnce = restored?.snap ?? null;

  const { currentStep, goTo, goNext, goBack } = useWizardNavigation(
    savedOnce?.step ?? "select-pet"
  );

  const [selectedPetId, setSelectedPetId]       = useState<string | null>(savedOnce?.selectedPetId ?? null);
  const [selectedPet, setSelectedPet]           = useState<Pet | null>(savedOnce?.selectedPet ?? null);
  const [selectedService, setSelectedService]   = useState<ServiceOut | null>(savedOnce?.selectedService ?? null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(savedOnce?.selectedAddonIds ?? []);
  const [selectedDate, setSelectedDate]         = useState<string | null>(savedOnce?.selectedDate ?? null);
  const [selectedAddress, setSelectedAddress]   = useState<AddressOut | null>(savedOnce?.selectedAddress ?? null);
  const [hold, setHold]                         = useState<HoldOut | null>(savedOnce?.hold ?? null);
  const [dateNotice, setDateNotice]             = useState<string | null>(restored?.holdExpired ? HOLD_EXPIRED_NOTICE : null);
  const [confirmedOrder, setConfirmedOrder]     = useState<OrderOut | null>(null);
  const [cartId, setCartId]                     = useState<string | null>(savedOnce?.cartId ?? null);
  const [pendingOrderId, setPendingOrderId]     = useState<string | null>(savedOnce?.pendingOrderId ?? null);
  const [amountCents, setAmountCents]           = useState<number>(savedOnce?.amountCents ?? 0);

  // Preseleccionar servicio cuando se llega desde /booking?service=<id>
  // (ej. botón "Reservar" de un producto en /paku-spa). Solo aplica en un
  // inicio limpio — si ya había una reserva en curso guardada, no la pisamos.
  // El precio para la mascota se toma en el paso de servicio.
  useEffect(() => {
    if (savedOnce || !preselectServiceId) return;
    let cancelled = false;
    servicesService
      .getProduct(preselectServiceId)
      .then((service) => {
        if (!cancelled) setSelectedService(service);
      })
      .catch(() => { /* si falla, el usuario simplemente lo elige a mano en el paso 2 */ });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preseleccionar mascota cuando se llega desde /booking?pet=<id> (ej. panel de
  // la mascota). Mismo criterio que ?service=: solo en un inicio limpio. El
  // usuario sigue en el paso 1, así que pasa por todas sus validaciones (peso).
  useEffect(() => {
    if (savedOnce || !preselectPetId || !isAuthenticated) return;
    let cancelled = false;
    petsService
      .detail(preselectPetId)
      .then((pet) => {
        if (cancelled) return;
        setSelectedPetId(pet.id);
        setSelectedPet(pet);
      })
      .catch(() => { /* si falla, la elige a mano */ });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Persistir en sessionStorage cada vez que cambie cualquier dato relevante
  useEffect(() => {
    // No guardar pasos finales — al completar/cancelar se limpia el snapshot
    if (currentStep === "order-confirmed") return;
    saveSnapshot({
      step: currentStep,
      selectedPetId,
      selectedPet,
      selectedService,
      selectedAddonIds,
      selectedDate,
      selectedAddress,
      hold,
      cartId,
      pendingOrderId,
      amountCents,
    });
  }, [
    currentStep, selectedPetId, selectedPet, selectedService,
    selectedAddonIds, selectedDate, selectedAddress, hold,
    cartId, pendingOrderId, amountCents,
  ]);

  // La reserva y el carrito son de una mascota y un servicio: si cambian, se liberan.
  const resetReservation = useCallback(() => {
    releaseHold(hold);
    setHold(null);
    setSelectedDate(null);
    setCartId(null);
  }, [hold]);

  const handleSelectPet = useCallback((petId: string, pet: Pet) => {
    if (petId !== selectedPetId) resetReservation();
    setSelectedPetId(petId);
    setSelectedPet(pet);
  }, [selectedPetId, resetReservation]);

  const handleSelectService = useCallback((service: ServiceOut) => {
    if (service.id !== selectedService?.id) {
      resetReservation();
      setSelectedAddonIds([]);
    }
    setSelectedService(service);
  }, [selectedService, resetReservation]);

  const handleToggleAddon = useCallback((addon: ServiceAddon) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addon.id) ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
    );
  }, []);

  const handleSelectAddress = useCallback((address: AddressOut) => {
    setSelectedAddress(address);
  }, []);

  const handleReserved = useCallback((newHold: HoldOut) => {
    setHold(newHold);
    if (newHold.date) setSelectedDate(newHold.date);
    setDateNotice(null);
  }, []);

  // Al entrar al carrito la reserva vence junto con él (C-15)
  const handleCartChange = useCallback((cart: CartWithItemsOut) => {
    setCartId(cart.cart.id);
    notifyCartUpdated();
    if (cart.cart.expires_at) {
      const expiresAt = cart.cart.expires_at;
      setHold((prev) => (prev ? { ...prev, expires_at: expiresAt } : prev));
    }
  }, []);

  // HOLD_EXPIRED y similares: el cupo ya no está reservado → volver a elegir la fecha.
  // El carrito queda inservible (su reserva venció), así que se arma uno nuevo.
  const handleHoldLost = useCallback((message: string) => {
    setHold(null);
    setCartId(null);
    setDateNotice(message);
    goTo("select-date");
  }, [goTo]);

  const handleProceedToPayment = useCallback(async (cId: string) => {
    if (!selectedAddress) {
      throw new Error("Selecciona una dirección antes de continuar al pago.");
    }
    setCartId(cId);

    if (pendingOrderId) {
      goTo("payment");
      return;
    }

    // POST /orders confirma la reserva (ya no vence). Si venció → 409 HOLD_EXPIRED,
    // que StepReviewCart maneja volviendo a la fecha.
    const order = await ordersService.create({
      cart_id: cId,
      address_id: selectedAddress.id,
    });
    setPendingOrderId(order.id);
    notifyCartUpdated();
    setAmountCents(Math.round(order.total_snapshot * 100));
    setHold((prev) => (prev ? { ...prev, status: "confirmed" } : prev));
    goTo("payment");
  }, [goTo, pendingOrderId, selectedAddress]);

  // POST /orders/{id}/pay cobra y confirma la orden en una sola operación
  // atómica del lado del backend. StepPaymentCulqi ya filtró el caso
  // "failed" antes de llamar a este callback — acá solo llegan órdenes
  // "paid" o "verifying".
  const handlePaymentSuccess = useCallback((order: OrderOut) => {
    clearSnapshot();
    setConfirmedOrder(order);
    goTo("order-confirmed");
  }, [goTo]);

  const handleNewOrder = useCallback(() => {
    clearSnapshot(); // Limpiar al iniciar nuevo pedido
    setSelectedPetId(null);
    setSelectedPet(null);
    setSelectedService(null);
    setSelectedAddonIds([]);
    setSelectedDate(null);
    setSelectedAddress(null);
    setHold(null);
    setDateNotice(null);
    setConfirmedOrder(null);
    setCartId(null);
    setPendingOrderId(null);
    setAmountCents(0);
    goTo("select-pet");
  }, [goTo]);

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-bold">Inicia sesión para reservar un servicio</p>
        <p className="text-sm text-muted-foreground">
          Necesitas una cuenta para poder agendar un servicio a domicilio.
        </p>
        <button
          onClick={() => window.dispatchEvent(new Event("paku:open-auth"))}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  const showHoldBanner = !!hold && hold.status === "held" && STEPS_AFTER_DATE.includes(currentStep);

  return (
    <div className="mx-auto max-w-3xl">
      {currentStep !== "order-confirmed" && (
        <WizardProgress currentStep={currentStep} />
      )}

      {showHoldBanner && hold && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CalendarCheck className="size-4 shrink-0" />
          <span>
            Cupo reservado para el <span className="font-semibold">{hold.date ? formatDay(hold.date) : "día elegido"}</span>.
            Se libera a las {timeLima(hold.expires_at)} si no completas la compra.
          </span>
        </div>
      )}

      {currentStep === "select-pet" && (
        <StepSelectPet
          selectedPetId={selectedPetId}
          onSelectPet={handleSelectPet}
          onNext={goNext}
        />
      )}

      {currentStep === "select-service" && (
        <StepSelectService
          petId={selectedPetId}
          petName={selectedPet?.name}
          selectedServiceId={selectedService?.id ?? null}
          selectedAddonIds={selectedAddonIds}
          onSelectService={handleSelectService}
          onToggleAddon={handleToggleAddon}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {currentStep === "select-date" && selectedService && selectedPetId && (
        <StepSelectDate
          serviceId={selectedService.id}
          petId={selectedPetId}
          selectedDate={selectedDate}
          hold={hold}
          notice={dateNotice}
          onSelectDate={setSelectedDate}
          onReserved={handleReserved}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {currentStep === "select-address" && (
        <StepSelectAddress
          selectedAddressId={selectedAddress?.id ?? null}
          onSelectAddress={handleSelectAddress}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {currentStep === "review-cart" && (
        <StepReviewCart
          selectedPet={selectedPet}
          selectedService={selectedService}
          selectedAddonIds={selectedAddonIds}
          selectedAddress={selectedAddress}
          hold={hold}
          cartId={cartId}
          orderCreated={!!pendingOrderId}
          onCartChange={handleCartChange}
          onHoldLost={handleHoldLost}
          onBack={goBack}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      {currentStep === "payment" && cartId && pendingOrderId && (
        <StepPaymentCulqi
          orderId={pendingOrderId}
          amountCents={amountCents}
          currency="PEN"
          onPaymentSuccess={handlePaymentSuccess}
          onBack={goBack}
        />
      )}

      {currentStep === "order-confirmed" && (
        confirmedOrder ? (
          <StepOrderConfirmed
            order={confirmedOrder}
            onNewOrder={handleNewOrder}
          />
        ) : (
          /* Pago exitoso pero la orden no llegó a la pantalla (p. ej. recarga) — fallback */
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-green-100">
              <svg viewBox="0 0 24 24" className="size-10 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold">¡Pago recibido!</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Tu pago fue procesado exitosamente. Puedes ver el estado de tu pedido en Mis pedidos.
            </p>
            <button
              onClick={handleNewOrder}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              Volver al inicio
            </button>
          </div>
        )
      )}
    </div>
  );
}
