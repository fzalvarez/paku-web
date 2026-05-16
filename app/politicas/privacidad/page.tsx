import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Paku",
  description:
    "Conoce cómo Paku recopila, usa y protege tu información personal y la de tu mascota.",
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Encabezado */}
      <header className="mb-10 border-b border-border pb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Legal
        </p>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight">
          Política de Privacidad
        </h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: mayo de 2026
        </p>
      </header>

      {/* Introducción */}
      <p className="mb-10 leading-relaxed text-muted-foreground">
        En Paku respetamos la privacidad de nuestros usuarios y protegemos la
        información personal que se recopila a través de nuestra aplicación móvil,
        sitio web y servicios relacionados. Esta Política de Privacidad explica qué
        información recopilamos, cómo la usamos, cómo la protegemos y qué derechos
        tienen los usuarios sobre sus datos personales.
      </p>

      <div className="space-y-8">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">1. Responsable del tratamiento de datos</h2>
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            El servicio Paku es operado por:
          </p>
          <ul className="mb-3 space-y-1 text-sm text-muted-foreground">
            <li><span className="font-semibold text-foreground">Razón social:</span> [Nombre legal de la empresa responsable de Paku]</li>
            <li><span className="font-semibold text-foreground">RUC:</span> [RUC]</li>
            <li><span className="font-semibold text-foreground">Domicilio:</span> [Dirección legal o comercial]</li>
            <li>
              <span className="font-semibold text-foreground">Correo:</span>{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href="mailto:privacidad@paku.com.pe">
                privacidad@paku.com.pe
              </a>
            </li>
            <li>
              <span className="font-semibold text-foreground">Sitio web:</span>{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href="https://paku.com.pe">
                https://paku.com.pe
              </a>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Para cualquier consulta sobre privacidad puedes escribirnos a{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href="mailto:privacidad@paku.com.pe">
              privacidad@paku.com.pe
            </a>.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">2. Información que recopilamos</h2>

          <h3 className="mb-1.5 font-semibold">Datos del usuario</h3>
          <ul className="mb-4 list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Nombre y apellidos.</li>
            <li>Número de teléfono.</li>
            <li>Correo electrónico.</li>
            <li>Dirección de atención o domicilio.</li>
            <li>Datos de acceso o autenticación.</li>
            <li>Información relacionada con solicitudes, reservas o servicios contratados.</li>
          </ul>

          <h3 className="mb-1.5 font-semibold">Datos de mascotas</h3>
          <ul className="mb-4 list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Nombre de la mascota.</li>
            <li>Especie, raza, tamaño, edad u otras características.</li>
            <li>Historial de grooming, cuidados, preferencias o necesidades especiales.</li>
            <li>Fotografías de la mascota, si el usuario las proporciona.</li>
          </ul>

          <h3 className="mb-1.5 font-semibold">Datos técnicos</h3>
          <ul className="mb-4 list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Tipo de dispositivo y sistema operativo.</li>
            <li>Identificadores técnicos de la app.</li>
            <li>Información de uso, errores, rendimiento y actividad dentro de la aplicación.</li>
          </ul>

          <h3 className="mb-1.5 font-semibold">Datos de ubicación</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Paku puede solicitar información de ubicación o dirección para coordinar servicios
            a domicilio. Esta información se usa únicamente para gestionar la atención,
            asignación de servicios, rutas o comunicación relacionada con el servicio solicitado.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">3. Cómo usamos la información</h2>
          <ul className="list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Crear y administrar cuentas de usuario.</li>
            <li>Registrar mascotas y sus datos asociados.</li>
            <li>Gestionar reservas, servicios y solicitudes de grooming.</li>
            <li>Coordinar atenciones a domicilio.</li>
            <li>Comunicarnos con los usuarios sobre sus servicios.</li>
            <li>Enviar notificaciones relacionadas con reservas, cambios, recordatorios o incidencias.</li>
            <li>Mejorar la experiencia, seguridad y funcionamiento de la app.</li>
            <li>Brindar soporte al usuario.</li>
            <li>Cumplir obligaciones legales o requerimientos de autoridades competentes.</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">4. Pagos</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Si Paku permite realizar pagos dentro o fuera de la aplicación, la información de
            pago podrá ser procesada por proveedores externos especializados. Paku no almacena
            directamente datos completos de tarjetas bancarias, salvo que se indique expresamente
            lo contrario. Los pagos son procesados mediante plataformas seguras de terceros,
            según corresponda.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">5. Notificaciones</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            La app puede enviar notificaciones push, correos electrónicos, mensajes SMS o
            comunicaciones por otros medios para informar sobre reservas, servicios, promociones,
            cambios importantes o información relacionada con la cuenta. El usuario puede
            desactivar algunas notificaciones desde la configuración del dispositivo o de la
            aplicación, cuando esté disponible.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">6. Compartición de información</h2>
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            Podemos compartir información únicamente cuando sea necesario para operar el
            servicio, por ejemplo:
          </p>
          <ul className="mb-3 list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Con groomers, aliados o personal encargado de realizar la atención.</li>
            <li>Con proveedores tecnológicos (almacenamiento, hosting, analítica, notificaciones o soporte).</li>
            <li>Con plataformas de pago, si corresponde.</li>
            <li>Con autoridades, cuando exista una obligación legal.</li>
          </ul>
          <p className="text-sm font-medium text-foreground">
            No vendemos información personal de los usuarios a terceros.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">7. Conservación de datos</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Conservamos los datos personales mientras la cuenta del usuario se encuentre activa
            o mientras sea necesario para brindar el servicio, cumplir obligaciones legales,
            resolver disputas, prevenir fraudes o mantener registros operativos. Cuando los datos
            ya no sean necesarios, podremos eliminarlos, anonimizarlos o bloquearlos conforme a
            la normativa aplicable.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">8. Seguridad de la información</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Aplicamos medidas razonables de seguridad para proteger la información personal
            contra accesos no autorizados, pérdida, uso indebido, alteración o divulgación.
            Sin embargo, ningún sistema digital es completamente seguro. Recomendamos a los
            usuarios proteger sus credenciales de acceso y no compartir información sensible
            innecesariamente.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">9. Derechos del usuario</h2>
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            El usuario puede solicitar:
          </p>
          <ul className="mb-3 list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Acceso a sus datos personales.</li>
            <li>Corrección o actualización de información.</li>
            <li>Eliminación de su cuenta o datos personales.</li>
            <li>Revocación del consentimiento cuando corresponda.</li>
            <li>Oposición al tratamiento de sus datos en los casos permitidos por ley.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Para ejercer estos derechos, escribe a{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href="mailto:privacidad@paku.com.pe">
              privacidad@paku.com.pe
            </a>{" "}
            incluyendo información suficiente para identificarte y atender correctamente el pedido.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">10. Eliminación de cuenta y datos</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Puedes solicitar la eliminación de tu cuenta y datos personales escribiendo a{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href="mailto:privacidad@paku.com.pe">
              privacidad@paku.com.pe
            </a>.
            La eliminación podrá estar sujeta a la conservación de cierta información cuando sea
            necesaria por obligaciones legales, registros de servicios, seguridad, prevención de
            fraude o cumplimiento contractual.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">11. Menores de edad</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Paku no está dirigida a niños menores de 13 años. Si detectamos que hemos recopilado
            información de un menor sin autorización válida, tomaremos medidas razonables para
            eliminar dicha información.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">12. Cambios en esta política</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Podemos actualizar esta Política de Privacidad cuando sea necesario. Los cambios
            serán publicados en esta misma página, indicando la fecha de última actualización.
            El uso continuo de la app después de publicada una actualización implica la
            aceptación de la versión vigente.
          </p>
        </section>

        {/* 13 */}
        <section className="rounded-2xl border border-border bg-muted/30 p-6">
          <h2 className="mb-3 text-xl font-bold">13. Contacto</h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Para consultas sobre esta Política de Privacidad o el tratamiento de datos
            personales, puedes comunicarte con nosotros:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Correo:</span>{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href="mailto:privacidad@paku.com.pe">
                privacidad@paku.com.pe
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
