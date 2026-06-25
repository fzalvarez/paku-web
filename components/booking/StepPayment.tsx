"use client";

import { StepPaymentCulqi } from "./StepPaymentCulqi";

interface StepPaymentProps {
  cartId: string;
  amountCents: number;
  currency?: "PEN" | "USD";
  onPaymentSuccess: (paymentOrderId: string) => void;
  onBack: () => void;
}

export function StepPayment(props: StepPaymentProps) {
  return <StepPaymentCulqi {...props} />;
}
