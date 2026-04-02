"use client";

import { useState, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { WizardProgress, useWizardNavigation } from "./WizardLayout";
import { StepSelectPet } from "./StepSelectPet";
import { StepSelectService } from "./StepSelectService";
import { StepSelectDate } from "./StepSelectDate";
import { StepSelectAddress } from "./StepSelectAddress";
import { StepReviewCart } from "./StepReviewCart";
import { StepPayment } from "./StepPayment";
import { StepOrderConfirmed } from "./StepOrderConfirmed";
import { ordersService } from "@/lib/api/orders";
import type { Pet } from "@/types/pets";
import type { ServiceOut, ServiceAddon } from "@/types/services";
import type { AddressOut } from "@/types/api";
import type { OrderOut } from "@/types/orders";

export function BookingWizard() {
  const { isAuthenticated } = useAuthContext();
  const { currentStep, goTo, goNext, goBack } = useWizardNavigation("select-pet");

  // Estado del wizard
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceOut | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressOut | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderOut | null>(null);

  // Estado del pago
  const [cartId, setCartId] = useState<string | null>(null);
  const [amountCents, setAmountCents] = useState<number>(0);

  const handleSelectPet = useCallback((petId: string, pet: Pet) => {
    setSelectedPetId(petId);
    setSelectedPet(pet);
  }, []);

  const handleSelectService = useCallback((service: ServiceOut) => {
    setSelectedService(service);
    setSelectedAddonIds([]);
  }, []);

  const handleToggleAddon = useCallback((addon: ServiceAddon) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addon.id) ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
    );
  }, []);

  const handleSelectAddress = useCallback((address: AddressOut) => {
    setSelectedAddress(address);
  }, []);

  // Desde StepReviewCart: cart listo para pagar
  const handleProceedToPayment = useCallback((cId: string, cents: number) => {
    setCartId(cId);
    setAmountCents(cents);
    goTo("payment");
  }, [goTo]);

  // Desde StepPayment: pago exitoso → crear orden y mostrar confirmación
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePaymentSuccess = useCallback(async (_paymentOrderId: string) => {
    if (!cartId || !selectedAddress) return;
    try {
      const order = await ordersService.create({
        cart_id: cartId,
        address_id: selectedAddress.id,
      });
      setConfirmedOrder(order);
      goTo("order-confirmed");
    } catch {
      // Pago exitoso pero error al crear la orden en nuestro sistema.
      // Aún así, avanzamos y mostramos confirmación básica.
      goTo("order-confirmed");
    }
  }, [cartId, selectedAddress, goTo]);

  const handleNewOrder = useCallback(() => {
    setSelectedPetId(null);
    setSelectedPet(null);
    setSelectedService(null);
    setSelectedAddonIds([]);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedAddress(null);
    setConfirmedOrder(null);
    setCartId(null);
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

  return (
    <div className="mx-auto max-w-3xl">
      {currentStep !== "order-confirmed" && (
        <WizardProgress currentStep={currentStep} />
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
          selectedServiceId={selectedService?.id ?? null}
          selectedAddonIds={selectedAddonIds}
          onSelectService={handleSelectService}
          onToggleAddon={handleToggleAddon}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {currentStep === "select-date" && selectedService && (
        <StepSelectDate
          serviceId={selectedService.id}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelectDate={setSelectedDate}
          onSelectTime={setSelectedTime}
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
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedAddress={selectedAddress}
          onBack={goBack}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      {currentStep === "payment" && cartId && (
        <StepPayment
          cartId={cartId}
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
          /* Pago exitoso pero creación de orden falló — pantalla de fallback */
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-green-100">
              <svg viewBox="0 0 24 24" className="size-10 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold">¡Pago recibido!</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Tu pago fue procesado exitosamente. Nuestro equipo se pondrá en contacto contigo para confirmar tu pedido.
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
