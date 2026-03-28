import { BookingWizard } from "@/components/booking/BookingWizard";

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Reserva un servicio
        </h1>
        <p className="mt-3 text-muted-foreground">
          Grooming profesional a domicilio para tu mascota.
        </p>
      </div>
      <BookingWizard />
    </div>
  );
}
