import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail, Clock } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// ── Datos de navegación ───────────────────────────────────────────────────────

const NAV_COLUMNS = [
  {
    title: "Servicios",
    links: [
      { label: "Inicio", href: ROUTES.HOME },
      { label: "Paku Spa", href: ROUTES.PAKU_SPA },
      { label: "Blog", href: ROUTES.BLOG },
    ],
  },
  {
    title: "Mi cuenta",
    links: [
      { label: "Mi perfil", href: ROUTES.ACCOUNT.PROFILE },
      { label: "Mis mascotas", href: ROUTES.ACCOUNT.PETS },
      { label: "Mis direcciones", href: ROUTES.ACCOUNT.ADDRESSES },
      { label: "Mis pedidos", href: ROUTES.ACCOUNT.ORDERS },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos y condiciones", href: ROUTES.POLITICAS.TERMINOS },
      { label: "Política de privacidad", href: ROUTES.POLITICAS.PRIVACIDAD },
    ],
  },
] as const;

const CONTACT_ITEMS = [
  { icon: MessageCircle, label: "+51 999999999", href: "https://wa.me/51999999999", external: true },
  { icon: Mail, label: "admin@paku.com.pe", href: "mailto:admin@paku.com.pe", external: false },
  { icon: Clock, label: "Lun – Dom · 8am – 7pm", href: null, external: false },
] as const;

// ── Componente ────────────────────────────────────────────────────────────────

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background">
      {/* Cuerpo principal */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">

          {/* ── Marca + contacto (2 columnas en lg) ── */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link href={ROUTES.HOME} className="mb-5 inline-block">
              <Image
                src="/assets/logo-paku.png"
                alt="Paku"
                width={96}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </Link>

            <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              El grooming móvil más moderno del Perú. Agendamos en segundos y
              cuidamos a tu mascota en la puerta de tu hogar.
            </p>

            {/* Contacto rápido */}
            <ul className="flex flex-col gap-3">
              {CONTACT_ITEMS.map((item) => {
                const Icon = item.icon;
                const inner = (
                  <span className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                    <Icon className="size-4 shrink-0 text-primary" />
                    {item.label}
                  </span>
                );
                return (
                  <li key={item.label}>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                      >
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── Columnas de navegación (3 columnas en lg) ── */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Paku. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Hecho con ❤️ en Perú
          </p>
        </div>
      </div>
    </footer>
  );
}
