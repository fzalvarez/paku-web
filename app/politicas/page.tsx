import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, Cookie, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Políticas Legales | Paku",
  description:
    "Consulta los términos, la política de privacidad y la política de cookies de Paku.",
};

const POLICIES = [
  {
    href: ROUTES.POLITICAS.TERMINOS,
    icon: FileText,
    title: "Términos y Condiciones",
    description:
      "Normas que regulan el uso de la plataforma, la contratación de servicios y la relación entre usuarios y Paku.",
    updated: "Mayo 2026",
  },
  {
    href: ROUTES.POLITICAS.PRIVACIDAD,
    icon: Shield,
    title: "Política de Privacidad",
    description:
      "Cómo recopilamos, usamos y protegemos tu información personal y la de tu mascota.",
    updated: "Mayo 2026",
  },
  {
    href: ROUTES.POLITICAS.COOKIES,
    icon: Cookie,
    title: "Política de Cookies",
    description:
      "Tipos de cookies que usamos, para qué sirven y cómo puedes gestionarlas desde tu navegador.",
    updated: "Mayo 2026",
  },
] as const;

export default function PoliticasPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Encabezado */}
      <header className="mb-12 border-b border-border pb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Legal
        </p>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight">Políticas</h1>
        <p className="max-w-xl text-muted-foreground">
          Consulta aquí todos los documentos legales y de privacidad que rigen el uso
          de los servicios de Paku.
        </p>
      </header>

      {/* Lista de políticas */}
      <ul className="space-y-4">
        {POLICIES.map(({ href, icon: Icon, title, description, updated }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-start gap-5 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {title}
                  </h2>
                  <ChevronRight className="size-4 mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  Actualizado: {updated}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Nota legal */}
      <p className="mt-12 text-center text-xs text-muted-foreground">
        Al usar los servicios de Paku aceptas los documentos vigentes publicados en esta
        sección.{" "}
        <a
          href="mailto:privacidad@paku.com.pe"
          className="underline underline-offset-4 hover:text-foreground"
        >
          ¿Tienes dudas? Escríbenos.
        </a>
      </p>
    </main>
  );
}
