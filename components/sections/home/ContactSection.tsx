import { MessageCircle, Mail, Clock, ArrowUpRight } from "lucide-react";

const WHATSAPP_NUMBER = "999999999";
const EMAIL = "admin@paku.com.pe";

// ── Tarjeta: WhatsApp (destacada, estilo bg-primary) ─────────────────────────

function WhatsAppCard() {
  return (
    <a
      href={`https://wa.me/51${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl bg-primary p-8 shadow-xl transition-all active:scale-[0.98]"
    >
      {/* Blob decorativo */}
      <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-3xl transition-all group-hover:bg-white/20" />

      <div>
        <div className="mb-6 flex items-start justify-between">
          <MessageCircle className="size-12 text-primary-foreground" strokeWidth={1.5} />
          <ArrowUpRight className="size-6 text-primary-foreground/50 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="mb-1 text-sm font-bold uppercase tracking-widest text-primary-foreground/70">
          WhatsApp
        </p>
        <h3 className="mb-2 text-3xl font-extrabold tracking-tight text-primary-foreground">
          +51 {WHATSAPP_NUMBER}
        </h3>
        <p className="font-medium text-primary-foreground/80">
          Escríbenos y te respondemos al instante.
        </p>
      </div>

      <div className="mt-12 flex items-center justify-center rounded-full bg-white/20 px-6 py-4 text-lg font-bold text-primary-foreground backdrop-blur-md">
        Chatear ahora
      </div>
    </a>
  );
}

// ── Tarjeta: Correo electrónico ───────────────────────────────────────────────

function EmailCard() {
  return (
    <a
      href={`mailto:${EMAIL}`}
      className="group flex flex-col justify-between rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div>
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
          <Mail className="size-7 text-primary" strokeWidth={1.5} />
        </div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Correo electrónico
        </p>
        <h3 className="mb-3 text-xl font-extrabold leading-snug text-foreground break-all">
          {EMAIL}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Envíanos tu consulta y te responderemos en menos de 24 horas.
        </p>
      </div>
      <div className="mt-8 border-t border-border pt-5">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          Enviar correo
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </a>
  );
}

// ── Tarjeta: Horario ─────────────────────────────────────────────────────────

function ScheduleCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border">
      <div>
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10">
          <Clock className="size-7 text-amber-500" strokeWidth={1.5} />
        </div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Horario de atención
        </p>
        <h3 className="mb-3 text-2xl font-extrabold tracking-tight text-foreground">
          8:00 am – 7:00 pm
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Atendemos todos los días de la semana para que tu mascota nunca espere.
        </p>
      </div>
      <div className="mt-8 border-t border-border pt-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
            <span className="text-xs font-extrabold text-amber-600">7d</span>
          </div>
          <span className="text-sm font-semibold text-foreground">Lunes a domingo</span>
        </div>
      </div>
    </div>
  );
}

// ── Sección principal ─────────────────────────────────────────────────────────

export function ContactSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <header className="mb-12">
        <h2 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
          Contáctanos
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Estamos disponibles todos los días para resolver tus dudas y ayudarte
          a agendar el mejor servicio para tu mascota.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <WhatsAppCard />
        <EmailCard />
        <ScheduleCard />
      </div>
    </section>
  );
}
