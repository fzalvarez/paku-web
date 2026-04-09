import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y tratamiento de datos de Paku.",
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">Política de Privacidad</h1>

      <p className="mb-4 text-sm text-muted-foreground">
        En Paku valoramos la privacidad y el tratamiento responsable de los datos
        personales. Esta política describe cómo recolectamos, usamos, protegemos y
        compartimos la información que obtenemos a través de nuestro sitio y
        servicios. Esta política está alineada con la normativa peruana aplicable,
        en particular la Ley N° 29733 - Ley de Protección de Datos Personales y su
        reglamento.
      </p>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">1. Datos que recopilamos</h2>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          <li>Datos de identificación (nombre, documento, teléfono).</li>
          <li>Datos de contacto (correo electrónico, dirección).</li>
          <li>Datos de las mascotas (nombre, edad, raza) cuando aplique.</li>
          <li>Datos de pago y facturación (almacenados de forma segura o por
            proveedores de pago).</li>
          <li>Información de uso del sitio, cookies y registros técnicos.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">2. Finalidades del tratamiento</h2>
        <p className="text-sm text-muted-foreground">
          Tratamos los datos personales para: prestar y mejorar los servicios,
          gestionar reservas y pagos, comunicarnos con los usuarios, cumplir
          obligaciones legales y mejorar la experiencia en la plataforma.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">3. Bases legales</h2>
        <p className="text-sm text-muted-foreground">
          El tratamiento se sustenta en el consentimiento del titular, en la
          ejecución de un contrato y en el cumplimiento de obligaciones legales
          aplicables, según corresponda.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">4. Destinatarios y transferencias</h2>
        <p className="text-sm text-muted-foreground">
          Podemos compartir datos con proveedores que prestan servicios (plataforma
          de pagos, alojamientos, logística). En caso de transferencias fuera del
          país o a terceros, garantizamos medidas de protección adecuadas.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">5. Conservación de datos</h2>
        <p className="text-sm text-muted-foreground">
          Conservamos los datos mientras sea necesario para las finalidades
          indicadas, para el cumplimiento de obligaciones legales o para atender
          reclamaciones. Los plazos pueden variar según la categoría de datos y
          la normativa aplicable.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">6. Derechos de los titulares</h2>
        <p className="text-sm text-muted-foreground">
          Usted tiene derecho a acceder, rectificar, suprimir, limitar el
          tratamiento, oponerse y solicitar la portabilidad de sus datos. Para
          ejercer sus derechos puede contactarnos mediante el correo
          <a className="ml-1 underline" href="mailto:admin@paku.com.pe">admin@paku.com.pe</a>.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">7. Seguridad</h2>
        <p className="text-sm text-muted-foreground">
          Implementamos medidas técnicas y organizativas razonables para proteger
          los datos personales frente a pérdida, acceso no autorizado o
          divulgación. Sin embargo, ningún sistema es totalmente infalible.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">8. Cookies y tecnologías similares</h2>
        <p className="text-sm text-muted-foreground">
          Utilizamos cookies para mejorar la usabilidad, analizar el tráfico y
          ofrecer funcionalidades. Puede gestionar sus preferencias de cookies
          desde su navegador. Para más detalles consulte la sección de cookies
          (si aplica) en este sitio.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">9. Cambios en la política</h2>
        <p className="text-sm text-muted-foreground">
          Esta política puede actualizarse. En caso de cambios relevantes los
          notificaremos mediante el sitio o por correo. La versión vigente se
          encuentra en esta página.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">10. Contacto</h2>
        <p className="text-sm text-muted-foreground">
          Si tiene consultas o desea ejercer sus derechos, escríbanos a
          <a className="ml-1 underline" href="mailto:admin@paku.com.pe">admin@paku.com.pe</a>.
        </p>
      </section>
    </main>
  );
}
