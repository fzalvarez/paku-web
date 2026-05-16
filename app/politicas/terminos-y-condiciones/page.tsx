import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Paku",
  description:
    "Condiciones generales que regulan el uso de la plataforma Paku, la contratación de servicios y la relación entre usuarios y la empresa.",
};

export default function TerminosYCondicionesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10 border-b border-border pb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Legal
        </p>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight">
          Términos y Condiciones
        </h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: mayo de 2026
        </p>
      </header>

      <p className="mb-10 leading-relaxed text-muted-foreground">
        Estos Términos y Condiciones regulan el acceso y uso de la plataforma Paku
        (aplicación móvil, sitio web y servicios relacionados). Al registrarte o utilizar
        los servicios de Paku, aceptas estos términos en su versión vigente. Si no estás
        de acuerdo, por favor no uses la plataforma.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-xl font-bold">1. Identificación del servicio</h2>
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            Paku es una plataforma que conecta a usuarios con servicios de grooming móvil
            y atención para mascotas. El servicio es operado por:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><span className="font-semibold text-foreground">Razón social:</span> [PENDIENTE: razón social legal de la empresa]</li>
            <li><span className="font-semibold text-foreground">RUC:</span> [PENDIENTE: RUC]</li>
            <li><span className="font-semibold text-foreground">Domicilio:</span> [PENDIENTE: dirección legal o comercial]</li>
            <li>
              <span className="font-semibold text-foreground">Correo:</span>{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href="mailto:admin@paku.com.pe">
                admin@paku.com.pe
              </a>
            </li>
            <li>
              <span className="font-semibold text-foreground">Sitio web:</span>{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href="https://paku.com.pe">
                https://paku.com.pe
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">2. Definiciones</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li><span className="font-semibold text-foreground">Usuario:</span> persona natural mayor de 18 años que crea una cuenta en Paku y contrata servicios.</li>
            <li><span className="font-semibold text-foreground">Groomer / Profesional:</span> persona que presta el servicio de grooming coordinado a través de la plataforma.</li>
            <li><span className="font-semibold text-foreground">Servicio:</span> atención de grooming, baño, corte u otros cuidados para mascotas ofrecidos mediante la plataforma.</li>
            <li><span className="font-semibold text-foreground">Reserva:</span> solicitud de servicio registrada por el usuario a través de la app o el sitio web.</li>
            <li><span className="font-semibold text-foreground">Plataforma:</span> el conjunto formado por la app móvil, el sitio web y los sistemas asociados de Paku.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">3. Condiciones de uso</h2>
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">Para usar la plataforma el usuario debe:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
            <li>Ser mayor de 18 años. Paku no está dirigida a menores de 13 años y no recopila intencionalmente datos de niños.</li>
            <li>Registrarse con información veraz, completa y actualizada.</li>
            <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
            <li>Usar la plataforma únicamente con fines lícitos y conforme a estos términos.</li>
            <li>No intentar acceder de forma no autorizada a sistemas, cuentas o datos ajenos.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">4. Registro y cuenta</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El usuario es responsable de la exactitud de la información proporcionada al
            registrarse. Paku puede suspender o eliminar cuentas que incumplan estos
            términos, proporcionen información falsa o realicen actividades fraudulentas.
            Cada usuario puede tener una sola cuenta activa.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">5. Reservas y prestación del servicio</h2>
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            Las reservas se gestionan a través de la plataforma. Al confirmar una reserva,
            el usuario acepta las condiciones específicas del servicio seleccionado.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
            <li>El usuario debe proporcionar una dirección válida y accesible para la atención.</li>
            <li>El usuario es responsable de que la mascota se encuentre en condiciones aptas para recibir el servicio.</li>
            <li>Paku no garantiza disponibilidad en todas las zonas geográficas ni en todos los horarios.</li>
            <li>Las cancelaciones o reprogramaciones están sujetas a las políticas vigentes en el momento de la reserva.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">6. Pagos</h2>
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            Los pagos por servicios se realizan a través de los medios habilitados en la
            plataforma, que pueden incluir tarjetas de crédito/débito, billeteras digitales
            u otros canales. El procesamiento de pagos puede estar gestionado por
            proveedores externos especializados.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
            <li>Los precios se muestran en soles peruanos (PEN) e incluyen los impuestos aplicables, salvo indicación contraria.</li>
            <li>Paku puede actualizar sus tarifas. El precio vigente al momento de la reserva es el que aplica.</li>
            <li>Las políticas de reembolso se informan al momento de la reserva o a través del soporte.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">7. Responsabilidad</h2>
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            Paku presta los servicios con diligencia razonable y profesionales capacitados.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
            <li>La responsabilidad de Paku se limita a los daños directos causados por negligencia comprobada, en los límites establecidos por la ley peruana.</li>
            <li>Paku no será responsable por daños indirectos, lucro cesante, daños a terceros o incidentes ajenos al servicio.</li>
            <li>El usuario es responsable de informar sobre cualquier condición médica, comportamiento especial o necesidad de su mascota antes del servicio.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">8. Propiedad intelectual</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Todo el contenido del sitio y la app (marca, diseño, textos, imágenes, código)
            es propiedad de Paku o de sus licenciantes. Se concede al usuario una licencia
            limitada, no exclusiva e intransferible para usar la plataforma con fines
            personales. Queda prohibida la reproducción, distribución o uso comercial no
            autorizado de cualquier elemento de la plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">9. Privacidad y datos personales</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El tratamiento de los datos personales del usuario se rige por nuestra{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href="/politicas/privacidad">
              Política de Privacidad
            </a>
            , disponible en el sitio. Al usar la plataforma, el usuario consiente el
            tratamiento de sus datos conforme a dicha política.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">10. Modificaciones de los términos</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Paku puede actualizar estos Términos y Condiciones cuando sea necesario. Los
            cambios se publicarán en esta página con la fecha de actualización. El uso
            continuado de la plataforma tras la publicación de los cambios implica la
            aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">11. Suspensión y cancelación</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Paku puede suspender o cancelar el acceso a la plataforma si el usuario
            incumple estos términos, realiza actividades fraudulentas o contrarias a la
            ley, o a petición de autoridades competentes. El usuario puede solicitar la
            cancelación de su cuenta en cualquier momento conforme a la{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href="/eliminar-cuenta">
              guía de eliminación de cuenta
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">12. Ley aplicable y jurisdicción</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Estos Términos y Condiciones se rigen por las leyes de la República del Perú.
            Para la resolución de controversias, las partes se someten a los tribunales
            competentes del domicilio del proveedor, o a los mecanismos alternativos de
            solución de conflictos conforme a la normativa vigente.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-muted/30 p-6">
          <h2 className="mb-3 text-xl font-bold">13. Contacto</h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Para consultas sobre estos términos puedes escribirnos a:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Correo:</span>{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href="mailto:admin@paku.com.pe">
                admin@paku.com.pe
              </a>
            </li>
            <li>
              <span className="font-semibold text-foreground">Sitio web:</span>{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href="https://paku.com.pe">
                https://paku.com.pe
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
