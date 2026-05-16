import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies | Paku",
  description:
    "Información sobre el uso de cookies y tecnologías similares en el sitio web de Paku.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Encabezado */}
      <header className="mb-10 border-b border-border pb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Legal
        </p>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight">
          Política de Cookies
        </h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: mayo de 2026
        </p>
      </header>

      <p className="mb-10 leading-relaxed text-muted-foreground">
        En Paku utilizamos cookies y tecnologías similares para que el sitio web
        funcione correctamente, para analizar su uso y para mejorar tu experiencia.
        Esta política explica qué son las cookies, qué tipos usamos y cómo puedes
        gestionarlas.
      </p>

      <div className="space-y-8">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">1. ¿Qué son las cookies?</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Las cookies son pequeños archivos de texto que un sitio web almacena en tu
            dispositivo (ordenador, teléfono o tablet) cuando lo visitas. Permiten que
            el sitio recuerde tus preferencias y acciones durante un período de tiempo,
            para que no tengas que volver a introducirlos cada vez que vuelves al sitio
            o navegas de una página a otra.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">2. Tipos de cookies que usamos</h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="mb-1 font-semibold">Cookies estrictamente necesarias</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Son imprescindibles para el funcionamiento del sitio. Permiten navegar
                por las páginas, usar funciones como el inicio de sesión o el carrito
                de servicios. Sin estas cookies, algunos servicios no pueden prestarse.
                No requieren tu consentimiento.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="mb-1 font-semibold">Cookies de funcionalidad</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Recuerdan tus preferencias (como el idioma o la región) para ofrecerte
                una experiencia más personalizada. La información recogida es anónima
                y no puede identificarte en otros sitios.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="mb-1 font-semibold">Cookies de análisis y rendimiento</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Recopilan información sobre cómo los visitantes usan el sitio:
                páginas visitadas, tiempo de navegación, errores encontrados, etc.
                Toda la información es anónima y se utiliza únicamente para mejorar
                el funcionamiento del sitio.
              </p>
            </div>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">3. Cookies de terceros</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Algunos de nuestros socios tecnológicos (como proveedores de autenticación,
            plataformas de pago o herramientas de análisis) pueden instalar sus propias
            cookies en tu dispositivo. Estas cookies están sujetas a las políticas de
            privacidad de cada proveedor. No controlamos el contenido ni el uso de
            dichas cookies.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">4. ¿Cómo gestionar las cookies?</h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Puedes configurar tu navegador para aceptar, rechazar o eliminar cookies en
            cualquier momento. Ten en cuenta que desactivar ciertas cookies puede afectar
            la funcionalidad del sitio. A continuación encontrarás enlaces a las
            instrucciones de los navegadores más comunes:
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-xl font-bold">5. Cambios en esta política</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Podemos actualizar esta Política de Cookies cuando sea necesario. Los cambios
            se publicarán en esta misma página con la fecha de última actualización. Te
            recomendamos revisarla periódicamente.
          </p>
        </section>

        {/* 6 */}
        <section className="rounded-2xl border border-border bg-muted/30 p-6">
          <h2 className="mb-3 text-xl font-bold">6. Contacto</h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Si tienes preguntas sobre el uso de cookies en nuestro sitio, puedes
            escribirnos a:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Correo:</span>{" "}
              <a
                className="underline underline-offset-4 hover:text-foreground"
                href="mailto:privacidad@paku.com.pe"
              >
                privacidad@paku.com.pe
              </a>
            </li>
            <li>
              <span className="font-semibold text-foreground">Sitio web:</span>{" "}
              <a
                className="underline underline-offset-4 hover:text-foreground"
                href="https://paku.com.pe"
              >
                https://paku.com.pe
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
