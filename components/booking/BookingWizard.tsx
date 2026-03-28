"use client";

import { useState, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { WizardProgress, useWizardNavigation } from "./WizardLayout";
import { StepSelectPet } from "./StepSelectPet";
import { StepSelectService } from "./StepSelectService";
import { StepSelectDate } from "./StepSelectDate";
import { StepSelectAddress } from "./StepSelectAddress";
import { StepReviewCart } from "./StepReviewCart";
import { StepOrderConfirmed } from "./StepOrderConfirmed";
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

  const handleOrderCreated = useCallback((order: OrderOut) => {
    setConfirmedOrder(order);
    goTo("order-confirmed");
  }, [goTo]);

  const handleNewOrder = useCallback(() => {
    setSelectedPetId(null);
    setSelectedPet(null);
    setSelectedService(null);
    setSelectedAddonIds([]);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedAddress(null);
    setConfirmedOrder(null);
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
    <div className="mx-auto max-w-2xl">
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
          onOrderCreated={handleOrderCreated}
        />
      )}

      {currentStep === "order-confirmed" && confirmedOrder && (
        <StepOrderConfirmed
          order={confirmedOrder}
          onNewOrder={handleNewOrder}
        />
      )}
    </div>
  );
}
