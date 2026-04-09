import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de Paku.",
};

export default function TerminosYCondicionesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">Términos y Condiciones</h1>

      <p className="mb-4 text-sm text-muted-foreground">
        Bienvenido a Paku. Estos términos y condiciones regulan el uso de la
        plataforma, la contratación de servicios y la relación entre los usuarios
        y nuestra empresa. Al utilizar nuestros servicios usted acepta estos
        términos en su versión vigente.
      </p>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">1. Definiciones</h2>
        <p className="text-sm text-muted-foreground">
          <strong>Usuario</strong>: persona natural que utiliza la plataforma.
          <br />
          <strong>Servicios</strong>: los servicios de grooming y atención para
          mascotas ofrecidos por Paku.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">2. Alcance</h2>
        <p className="text-sm text-muted-foreground">
          Estos términos aplican a todas las reservas y transacciones realizadas
          a través del sitio web o la aplicación móvil. Paku puede modificar
          los términos, avisando a los usuarios cuando corresponda.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">3. Reservas y pagos</h2>
        <p className="text-sm text-muted-foreground">
          Las reservas se realizan en línea. El usuario es responsable de
          proporcionar información veraz. Los pagos pueden realizarse mediante
          los medios habilitados en el sitio. Las políticas de cancelación y
          reembolso se especifican al momento de la reserva.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">4. Responsabilidad</h2>
        <p className="text-sm text-muted-foreground">
          Paku presta los servicios con diligencia y profesionales capacitados.
          No obstante, la responsabilidad se limitará a los daños directos
          causados por negligencia comprobada, en los límites previstos por la
          ley peruana. Paku no será responsable por daños indirectos o lucro
          cesante salvo disposición legal en contrario.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">5. Propiedad intelectual</h2>
        <p className="text-sm text-muted-foreground">
          Todo el contenido del sitio, marcas y diseños son propiedad de Paku o
          licenciantes. Queda prohibida la reproducción no autorizada.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">6. Protección de datos</h2>
        <p className="text-sm text-muted-foreground">
          El tratamiento de datos personales se rige por nuestra Política de
          Privacidad, disponible en el sitio. Los usuarios autorizan el
          tratamiento conforme a dicha política.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">7. Ley aplicable y jurisdicción</h2>
        <p className="text-sm text-muted-foreground">
          Estos términos se rigen por las leyes de la República del Perú. Para
          la solución de controversias, las partes se someten a los tribunales
          competentes del domicilio del proveedor o según lo establecido por la
          ley aplicable.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">8. Contacto</h2>
        <p className="text-sm text-muted-foreground">
          Para consultas sobre estos términos puede escribir a
          <a className="ml-1 underline" href="mailto:admin@paku.com.pe">admin@paku.com.pe</a>.
        </p>
      </section>
    </main>
  );
}
