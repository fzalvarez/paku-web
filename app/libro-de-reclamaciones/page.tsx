import type { Metadata } from "next";
import Image from "next/image";
import ReclamacionesForm from "@/components/libro/ReclamacionesForm";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description: "Libro de Reclamaciones virtual de Paku (SMARTPETSOLUTIONS S.A.C.). Registra tu reclamo o queja.",
};

export default function LibroDeReclamacionesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-6 flex items-center gap-4">
        <Image
          src="/assets/libro_reclamaciones.jpeg"
          alt="Libro de Reclamaciones"
          width={240}
          height={120}
          className="h-16 w-auto object-contain"
        />
        <h1 className="text-2xl font-bold">Libro de Reclamaciones</h1>
      </div>

      <ul className="mb-6 space-y-1 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <li><span className="font-semibold text-foreground">Razón social:</span> SMARTPETSOLUTIONS S.A.C.</li>
        <li><span className="font-semibold text-foreground">RUC:</span> 20615013898</li>
        <li><span className="font-semibold text-foreground">Domicilio:</span> Av. San Borja Sur 586, Dpto. 902, San Borja, Lima, Perú</li>
      </ul>

      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Conforme al Código de Protección y Defensa del Consumidor, contamos con un Libro de Reclamaciones virtual.
        Completa la hoja: al enviarla recibirás su número y una copia en tu correo. Te responderemos en un plazo
        máximo de 15 días hábiles.
      </p>

      <ReclamacionesForm />

      <div className="mt-6 space-y-2 text-xs leading-relaxed text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Reclamo:</span> disconformidad relacionada a los productos o
          servicios. <span className="font-semibold text-foreground">Queja:</span> disconformidad no relacionada a los
          productos o servicios, o malestar o descontento respecto a la atención al público.
        </p>
        <p>
          La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito
          previo para interponer una denuncia ante el INDECOPI.
        </p>
        <p>
          El proveedor deberá dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles.
        </p>
      </div>
    </main>
  );
}
