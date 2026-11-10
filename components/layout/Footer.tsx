import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail, Clock, MapPin } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// ── Datos de navegación ───────────────────────────────────────────────────────

const NAV_COLUMNS = [
  {
    title: "Servicios",
    links: [
      { label: "Inicio", href: ROUTES.HOME },
      { label: "Paku Spa", href: ROUTES.PAKU_SPA },
      { label: "Tips y chismes", href: ROUTES.BLOG },
      { label: "Nosotros", href: ROUTES.NOSOTROS },
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
      { label: "Política de cookies", href: ROUTES.POLITICAS.COOKIES },
      { label: "Cancelación y reembolso", href: ROUTES.POLITICAS.CANCELACION },
      { label: "Eliminar cuenta", href: ROUTES.ELIMINAR_CUENTA },
      { label: "Soporte", href: ROUTES.SOPORTE },
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
  { icon: MapPin, label: "Av. San Borja Sur 586, Dpto. 902, San Borja, Lima, Perú", href: null, external: false },
] as const;

// ── Componente ────────────────────────────────────────────────────────────────

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#171954] rounded-t-[40px]">
      {/* Cuerpo principal */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-2 md:gap-12 lg:grid-cols-5">
          {/* ── Marca + contacto (2 columnas en lg) ── */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            {/* Logo */}
            <Link href={ROUTES.HOME} className="mb-5 inline-block">
              <Image
                src="/assets/logo-mono-dark.png"
                alt="Paku — Grooming móvil para mascotas en Perú"
                width={96}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </Link>

            <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/80">
              El grooming móvil más moderno del Perú. Agendamos en segundos y
              cuidamos a tu mascota en la puerta de tu hogar.
            </p>

            {/* Contacto rápido, como pills */}
            <ul className="flex flex-wrap gap-2">
              {CONTACT_ITEMS.map((item) => {
                const Icon = item.icon;
                const inner = (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3.5 py-2 text-xs font-semibold text-white/85 transition-colors hover:bg-white/12 hover:text-white">
                    <Icon className="size-3.5 shrink-0 text-white" />
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
            <div key={col.title} className={col.title === "Legal" ? "col-span-2 md:col-span-1" : ""}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
                {col.title}
              </p>
              <nav aria-label={col.title}>
                <ul
                  className={
                    col.title === "Legal"
                      ? "flex flex-wrap gap-x-5 gap-y-2.5"
                      : "flex flex-col gap-2.5"
                  }
                >
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Si es la columna Legal, mostrar el Libro de Reclamaciones al final, como badge */}
              {col.title === "Legal" && (
                <div className="mt-5">
                  <Link
                    href={ROUTES.LIBRO_RECLAMACIONES}
                    aria-label="Libro de Reclamaciones"
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-white py-2 pl-2 pr-3.5 transition-opacity hover:opacity-90"
                  >
                    <Image
                      src="/assets/libro_reclamaciones.jpeg"
                      alt=""
                      width={90}
                      height={45}
                      className="h-8 w-auto rounded-lg object-contain"
                    />
                    <span className="text-xs font-extrabold text-[#171954]">
                      Libro de Reclamaciones
                    </span>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-white/60">
            &copy; {currentYear} Paku · SMARTPETSOLUTIONS S.A.C. · RUC 20615013898. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/60">Hecho con ❤️ en Perú</p>
        </div>
      </div>
    </footer>
  );
}
