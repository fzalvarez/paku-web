import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cancelación y Reembolso | Paku",
  description:
    "Condiciones para cancelar o reprogramar un servicio de Paku Spa, cargos aplicables, saldo a favor y devoluciones.",
};

const WHATSAPP = "https://wa.me/51993019869";
const EMAIL = "soporte@paku.com.pe";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

export default function CancelacionReembolsoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10 border-b border-border pb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Legal</p>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight">Política de Cancelación y Reembolso</h1>
        <p className="text-sm text-muted-foreground">Última actualización: octubre de 2026</p>
      </header>

      <p className="mb-6 leading-relaxed text-muted-foreground">
        Esta política aplica a los servicios de Paku Spa (grooming a domicilio) operados por SMARTPETSOLUTIONS
        S.A.C. Las condiciones y los cargos se muestran antes de pagar y antes de confirmar cualquier cambio.
      </p>

      <div className="mb-10 rounded-2xl border border-border bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">Cómo solicitar una cancelación, reprogramación o devolución</p>
        <p className="mt-1">
          Escríbenos por{" "}
          <a className="underline underline-offset-4 hover:text-foreground" href={WHATSAPP}>
            WhatsApp al +51 993 019 869
          </a>{" "}
          o a{" "}
          <a className="underline underline-offset-4 hover:text-foreground" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>{" "}
          indicando tu correo de registro y el número de pedido. Los plazos se calculan con la hora de Perú y el
          momento en que registramos tu solicitud.
        </p>
      </div>

      <div className="space-y-8">
        <Section title="1. Cancelación">
          <List
            items={[
              <>
                Hasta las <strong>12:00 m. del día anterior</strong> al servicio, inclusive: devolución del{" "}
                <strong>100 %</strong>.
              </>,
              <>
                Después de ese plazo: cargo del <strong>30 % del servicio</strong>, con un máximo de{" "}
                <strong>S/ 40</strong>, y devolución del saldo.
              </>,
              "Antes de confirmar te indicaremos el importe pagado, el cargo y el monto que recibirás.",
            ]}
          />
        </Section>

        <Section title="2. Reprogramación">
          <List
            items={[
              <>
                Hasta las <strong>6:00 p. m. del día anterior</strong>, inclusive: una reprogramación{" "}
                <strong>gratuita</strong> por reserva, según disponibilidad.
              </>,
              <>
                Después de ese plazo: cargo del <strong>30 % del servicio</strong>, con un máximo de{" "}
                <strong>S/ 40</strong>.
              </>,
              "Te mostraremos las fechas disponibles y cualquier diferencia de pago antes de confirmar el cambio.",
              "Los cambios atribuibles a Paku no cuentan como tu reprogramación gratuita.",
              "Reprogramar después del plazo de cancelación no reinicia el derecho a devolución total.",
            ]}
          />
        </Section>

        <Section title="3. Cliente ausente">
          <List
            items={[
              "El groomer espera hasta 10 minutos desde su llegada al domicilio indicado, dentro del rango horario confirmado, y te avisa e intenta contactarte.",
              "Si llegamos antes del rango, la espera empieza al inicio del rango. Si llegamos fuera del rango, no se aplica el cargo.",
              <>
                Si se confirma la ausencia, se aplica un único cargo del <strong>30 %</strong> (máximo{" "}
                <strong>S/ 40</strong>). Puedes elegir usar el resto como saldo a favor para otra cita o solicitar su
                devolución.
              </>,
            ]}
          />
        </Section>

        <Section title="4. Saldo a favor">
          <List
            items={[
              "El saldo a favor se aplica a una nueva reserva y el remanente se conserva. No es un cupón promocional.",
              "Ejemplo: pagaste S/ 120 y corresponde un cargo de S/ 36: te quedan S/ 84. Si reservas otro servicio de S/ 120, solo completas S/ 36, sin otro cargo por el mismo incidente.",
              "Si decides no continuar, puedes solicitar la devolución de tu saldo.",
            ]}
          />
        </Section>

        <Section title="5. Cancelación atribuible a Paku">
          <List
            items={[
              "Si Paku cancela el servicio, o no puede atenderte dentro de la disponibilidad acordada al reservar, eliges entre reprogramar sin costo o la devolución del 100 %.",
              "En las devoluciones totales no descontamos comisiones de la pasarela de pago.",
            ]}
          />
        </Section>

        <Section title="6. Mascota que no puede ser atendida">
          <List
            items={[
              "Si por un problema médico inesperado o estrés no es posible atender a tu mascota con seguridad y el servicio no comenzó: devolución completa o reprogramación sin cargo.",
              "Si la condición fue informada al reservar y aceptada por Paku, no se aplica ninguna penalidad.",
              "Los casos con información relevante omitida o con atención parcial se revisan individualmente antes de determinar el importe correspondiente.",
            ]}
          />
        </Section>

        <Section title="7. Devoluciones">
          <List
            items={[
              "Tramitamos las devoluciones procedentes en un máximo de 2 días hábiles, al mismo medio de pago utilizado (tarjeta o billetera digital).",
              "El tiempo en que el dinero se refleja en tu cuenta depende de tu banco o billetera digital.",
              "Te informaremos el estado de tu solicitud: solicitada, enviada a la pasarela de pago y confirmada.",
            ]}
          />
        </Section>

        <Section title="8. Reservas pendientes de confirmación">
          <p className="text-sm leading-relaxed text-muted-foreground">
            No se aplican cargos a reservas que aún están pendientes de confirmación por parte de Paku.
          </p>
        </Section>

        <section className="rounded-2xl border border-border bg-muted/30 p-6">
          <h2 className="mb-3 text-xl font-bold">Contacto</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">WhatsApp:</span>{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href={WHATSAPP}>
                +51 993 019 869
              </a>
            </li>
            <li>
              <span className="font-semibold text-foreground">Correo:</span>{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
            </li>
            <li>
              <span className="font-semibold text-foreground">Libro de Reclamaciones:</span>{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href="/libro-de-reclamaciones">
                paku.com.pe/libro-de-reclamaciones
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
