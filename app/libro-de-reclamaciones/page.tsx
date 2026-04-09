import type { Metadata } from "next";
import Image from "next/image";
import ReclamacionesForm from "@/components/libro/ReclamacionesForm";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description: "Información y guía para presentar reclamos relacionados con Paku.",
};

export default function LibroDeReclamacionesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">Libro de Reclamaciones</h1>

      <p className="mb-4 text-sm text-muted-foreground">
        En Paku nos interesa atender sus consultas y reclamos de manera
        eficiente. Esta página explica cómo presentar un reclamo y proporciona
        acceso al Libro de Reclamaciones electrónico del Indecopi cuando sea
        necesario.
      </p>

      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Image
          src="/assets/libro_reclamaciones.jpeg"
          alt="Libro de Reclamaciones"
          width={240}
          height={120}
          className="h-24 w-auto object-contain"
        />

        <div>
          <p className="text-sm text-muted-foreground">
            Si desea presentar una queja formal sobre un servicio, producto o
            atención, siga estos pasos:
          </p>
          <ol className="ml-5 mt-3 list-decimal text-sm text-muted-foreground">
            <li>Contacte primero a nuestro equipo a <a className="underline" href="mailto:admin@paku.com.pe">admin@paku.com.pe</a> o WhatsApp al <a className="underline" href="https://wa.me/51993019869">+51 993 019 869</a>.</li>
            <li>Adjunte evidencia (factura, fotos, descripción detallada) y espere nuestra respuesta.</li>
            <li>Si no recibe solución o la respuesta no es satisfactoria, puede presentar un reclamo ante Indecopi usando el Libro de Reclamaciones electrónico.</li>
          </ol>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Acceso al Libro de Reclamaciones electrónico</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Puede acceder al libro de reclamaciones electrónico del Indecopi aquí:
        </p>
        <a
          className="inline-flex items-center gap-2 rounded bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          href="https://enlinea.indecopi.gob.pe/reclamavirtual/#/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ir al Libro de Reclamaciones de Indecopi
        </a>
      </section>

      {/* Formulario interactivo para preparar la reclamación */}
      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Formulario de reclamación</h2>
        <p className="mb-3 text-sm text-muted-foreground">A continuación puede preparar su reclamación antes de ser redirigido al sistema de Reclamovirtual.</p>
        {/* Client component: formulario */}
        <ReclamacionesForm />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Soporte y tiempos</h2>
        <p className="text-sm text-muted-foreground">
          Nuestro equipo revisa las solicitudes en el menor tiempo posible. Los
          plazos pueden variar según la complejidad del caso; siempre comunicaremos
          el estado y las acciones tomadas por correo o WhatsApp.
        </p>
      </section>
    </main>
  );
}
