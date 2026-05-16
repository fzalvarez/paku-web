import type { Metadata } from "next";
import { Trash2, ShieldCheck, Clock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Eliminar Cuenta | Paku",
  description:
    "Instrucciones para solicitar la eliminación de tu cuenta y datos personales en Paku.",
};

const STEPS = [
  {
    icon: Mail,
    title: "Envía tu solicitud",
    body: (
      <>
        Escribe un correo a{" "}
        <a
          href="mailto:privacidad@paku.com.pe"
          className="font-semibold underline underline-offset-4 hover:text-foreground"
        >
          privacidad@paku.com.pe
        </a>{" "}
        con el asunto <strong>«Solicitud de eliminación de cuenta»</strong>. Incluye
        el nombre y el correo electrónico con los que te registraste en Paku.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Verificamos tu identidad",
    body: "Podemos solicitarte información adicional para confirmar que eres el titular de la cuenta antes de proceder.",
  },
  {
    icon: Trash2,
    title: "Eliminamos tu cuenta",
    body: "Una vez verificada la solicitud, procederemos a eliminar tu cuenta y los datos asociados según lo descrito a continuación.",
  },
  {
    icon: Clock,
    title: "Confirmación en hasta 30 días",
    body: "Atenderemos tu solicitud en un plazo máximo de 30 días hábiles desde la recepción. Recibirás una confirmación por correo cuando el proceso se haya completado.",
  },
];

export default function EliminarCuentaPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10 border-b border-border pb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Cuenta
        </p>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight">
          Eliminar mi cuenta
        </h1>
        <p className="text-sm text-muted-foreground">
          Puedes solicitar la eliminación de tu cuenta y datos personales en cualquier
          momento. El proceso es sencillo y gratuito.
        </p>
      </header>

      {/* Pasos */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-bold">¿Cómo solicito la eliminación?</h2>
        <ol className="space-y-5">
          {STEPS.map(({ title, body }, i) => (
            <li key={title} className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {i + 1}
              </div>
              <div className="pt-1.5">
                <p className="mb-1 font-semibold text-foreground">{title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Qué se elimina */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold">¿Qué datos se eliminan?</h2>
        <div className="rounded-xl border border-border bg-muted/30 p-5">
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              <span>Información de perfil: nombre, correo electrónico, teléfono.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              <span>Direcciones de atención registradas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              <span>Datos y perfiles de mascotas asociadas a la cuenta.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              <span>Preferencias, configuraciones e historial de uso de la app.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              <span>Credenciales de acceso y datos de autenticación.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Qué puede conservarse */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold">¿Qué información puede conservarse?</h2>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          En algunos casos, parte de la información podrá ser conservada por un período
          limitado cuando sea necesario por:
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-5">
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">⚠</span>
              <span>
                <strong className="text-foreground">Obligaciones legales</strong>: registros
                contables, fiscales o requerimientos de autoridades competentes según la
                normativa peruana vigente.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">⚠</span>
              <span>
                <strong className="text-foreground">Registros de servicios</strong>: historial
                de reservas o transacciones completadas que formen parte de nuestros
                registros operativos o contables.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">⚠</span>
              <span>
                <strong className="text-foreground">Seguridad y prevención de fraude</strong>:
                información mínima necesaria para detectar actividades fraudulentas o
                proteger a otros usuarios.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">⚠</span>
              <span>
                <strong className="text-foreground">Disputas o reclamaciones activas</strong>:
                información relevante para resolver incidencias o reclamaciones en curso.
              </span>
            </li>
          </ul>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Una vez transcurrido el plazo legal aplicable, dicha información será eliminada
          o anonimizada de forma definitiva.
        </p>
      </section>

      {/* CTA de contacto */}
      <section className="rounded-2xl border border-border bg-muted/30 p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-5" />
          </div>
          <div>
            <h2 className="mb-2 text-lg font-bold">¿Listo para proceder?</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              Escríbenos a{" "}
              <a
                href="mailto:privacidad@paku.com.pe"
                className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
              >
                privacidad@paku.com.pe
              </a>{" "}
              con el asunto <strong>«Solicitud de eliminación de cuenta»</strong> y nos
              ponemos en contacto contigo en un máximo de 30 días hábiles.
            </p>
            <p className="text-xs text-muted-foreground">
              También puedes consultar nuestra{" "}
              <a
                href="/politicas/privacidad"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Política de Privacidad
              </a>{" "}
              para más información sobre el tratamiento de tus datos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
