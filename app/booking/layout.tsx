import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservar servicio | Paku",
  description: "Reserva un servicio de grooming a domicilio para tu mascota.",
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
