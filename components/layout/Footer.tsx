import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail, Clock } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// ── Íconos de redes sociales (SVG inline) ─────────────────────────────────────

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    label: "Facebook de Paku",
    href: "https://www.facebook.com/pakuperu",
    Icon: FacebookIcon,
    hoverColor: "hover:text-[#1877F2]",
  },
  {
    label: "Instagram de Paku",
    href: "https://www.instagram.com/pakuperu",
    Icon: InstagramIcon,
    hoverColor: "hover:text-[#E1306C]",
  },
  {
    label: "TikTok de Paku",
    href: "https://www.tiktok.com/@pakuperu",
    Icon: TikTokIcon,
    hoverColor: "hover:text-foreground",
  },
] as const;

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
  {
    icon: MessageCircle,
    label: "+51 993 019 869",
    href: "https://wa.me/51993019869",
    external: true,
  },
  {
    icon: Mail,
    label: "admin@paku.com.pe",
    href: "mailto:admin@paku.com.pe",
    external: false,
  },
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

            {/* Redes sociales */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon, hoverColor }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex size-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-colors ${hoverColor} hover:border-transparent hover:bg-primary/10`}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
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

              {/* Si es la columna Legal, mostrar el Libro de Reclamaciones al final */}
              {col.title === "Legal" && (
                <div className="mt-4">
                  <a
                    href="https://enlinea.indecopi.gob.pe/reclamavirtual/#/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Libro de Reclamaciones"
                    className="inline-flex items-center gap-3 rounded transition-opacity hover:opacity-90"
                  >
                    <Image
                      src="/assets/libro_reclamaciones.jpeg"
                      alt="Libro de Reclamaciones"
                      width={360}
                      height={180}
                      className="h-24 w-auto object-contain"
                    />
                    <span className="text-sm text-muted-foreground hidden">
                      Libro de Reclamaciones
                    </span>
                  </a>
                </div>
              )}
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
          <p className="text-xs text-muted-foreground">Hecho con ❤️ en Perú</p>
        </div>
      </div>
    </footer>
  );
}
