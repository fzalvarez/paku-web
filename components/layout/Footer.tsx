import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const POLICY_LINKS = [
  { label: "Términos y condiciones", href: ROUTES.POLITICAS.TERMINOS },
  { label: "Política de privacidad", href: ROUTES.POLITICAS.PRIVACIDAD },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Logo / Marca */}
          <Link
            href={ROUTES.HOME}
            className="text-sm font-semibold text-foreground"
          >
            Paku
          </Link>

          {/* Links de políticas */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {POLICY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Paku. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
