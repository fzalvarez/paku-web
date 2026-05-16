import type { Metadata } from "next";
import { MessageCircle, Mail, Clock, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto | Paku",
  description:
    "Comunícate con el equipo de Paku para resolver dudas sobre reservas, mascotas, pagos o cualquier otro tema.",
};

const CONTACT_CHANNELS = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+51 993 019 869",
    href: "https://wa.me/51993019869?text=Hola%20Paku%2C%20necesito%20ayuda%20con...",
    description: "Respuesta rápida por chat.",
    external: true,
  },
  {
    icon: Mail,
    label: "Correo electrónico",
    value: "admin@paku.com.pe",
    href: "mailto:admin@paku.com.pe",
    description: "Te respondemos en menos de 24 horas hábiles.",
    external: false,
  },
  {
    icon: Clock,
    label: "Horario de atención",
    value: "Lunes a domingo · 8:00 am – 7:00 pm",
    href: null,
    description: "Disponibles todos los días de la semana.",
    external: false,
  },
  {
    icon: MapPin,
    label: "Ubicación",
    value: "[PENDIENTE: completar ciudad/distrito de operación]",
    href: null,
    description: "Servicios a domicilio en Lima, Perú.",
    external: false,
  },
] as const;

const CONTACT_REASONS = [
  {
    emoji: "🔐",
    title: "Problemas con mi cuenta",
    description: "Dificultades para iniciar sesión, cambio de contraseña, acceso a la app.",
  },
  {
    emoji: "📅",
    title: "Reservas y servicios",
    description: "Cancelaciones, reprogramaciones, preguntas sobre el servicio contratado.",
  },
  {
    emoji: "🐾",
    title: "Mascotas",
    description: "Problemas para registrar o editar datos de tu mascota.",
  },
  {
    emoji: "💳",
    title: "Pagos y facturación",
    description: "Cobros incorrectos, reembolsos, comprobantes, métodos de pago.",
  },
  {
    emoji: "✂️",
    title: "Groomers y calidad del servicio",
    description: "Reportar un incidente, calificar a un groomer, sugerencias de mejora.",
  },
  {
    emoji: "🗑️",
    title: "Eliminación de datos",
    description: "Solicitar la eliminación de cuenta o datos personales.",
  },
] as const;

export default function ContactoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10 border-b border-border pb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Ayuda
        </p>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight">Contáctanos</h1>
        <p className="text-muted-foreground">
          Estamos aquí para ayudarte. Escríbenos por WhatsApp o correo y te respondemos
          lo antes posible.
        </p>
      </header>

      {/* Canales de contacto */}
      <section className="mb-12">
        <h2 className="mb-5 text-xl font-bold">Canales de atención</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACT_CHANNELS.map(({ icon: Icon, label, value, href, description, external }) => (
            <div
              key={label}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
                {href ? (
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="mt-0.5 block font-semibold text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="mt-0.5 font-semibold text-foreground">{value}</p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Motivos de contacto */}
      <section className="mb-12">
        <h2 className="mb-2 text-xl font-bold">¿En qué podemos ayudarte?</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Al escribirnos, indica el motivo de tu consulta para que podamos atenderte más rápido.
        </p>
        <ul className="space-y-3">
          {CONTACT_REASONS.map(({ emoji, title, description }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
            >
              <span className="text-xl">{emoji}</span>
              <div>
                <p className="font-semibold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Para eliminación de datos */}
      <section className="rounded-2xl border border-border bg-muted/30 p-6">
        <h2 className="mb-2 text-lg font-bold">Solicitudes de privacidad y datos</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Si deseas ejercer derechos sobre tus datos personales (acceso, corrección,
          eliminación u oposición), escríbenos específicamente a{" "}
          <a
            href="mailto:privacidad@paku.com.pe"
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
          >
            privacidad@paku.com.pe
          </a>
          . Consulta también nuestra{" "}
          <a
            href="/eliminar-cuenta"
            className="underline underline-offset-4 hover:text-foreground"
          >
            guía para eliminar tu cuenta
          </a>
          .
        </p>
      </section>
    </main>
  );
}
