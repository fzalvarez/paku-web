"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { AuthDialog } from "@/components/common/AuthDialog";
import { useAuthContext } from "@/contexts/AuthContext";

const NAV_LINKS = [
  { label: "Inicio", href: ROUTES.HOME },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const { user, loading, logout } = useAuthContext();

  function openLogin() {
    setAuthTab("login");
    setAuthOpen(true);
  }

  function openRegister() {
    setAuthTab("register");
    setAuthOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Paku
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA desktop */}
          <div className="hidden items-center gap-3 md:flex">
            {loading ? (
              <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <>
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="size-4 text-muted-foreground" />
                  {user.first_name ?? user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="mr-1.5 size-4" />
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={openLogin}>
                  Iniciar sesión
                </Button>
                <Button size="sm" onClick={openRegister}>
                  Registrarse
                </Button>
              </>
            )}
          </div>

          {/* Botón hamburguesa mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Nav mobile */}
        <div
          className={cn(
            "overflow-hidden border-b border-border bg-background transition-all duration-200 md:hidden",
            mobileOpen ? "max-h-96" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {loading ? (
                <div className="h-8 animate-pulse rounded-md bg-muted" />
              ) : user ? (
                <>
                  <span className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-foreground">
                    <User className="size-4 text-muted-foreground" />
                    {user.first_name ?? user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => { setMobileOpen(false); logout(); }}
                  >
                    <LogOut className="mr-1.5 size-4" />
                    Salir
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => { setMobileOpen(false); openLogin(); }}
                  >
                    Iniciar sesión
                  </Button>
                  <Button
                    size="sm"
                    className="justify-start"
                    onClick={() => { setMobileOpen(false); openRegister(); }}
                  >
                    Registrarse
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Dialog de autenticación */}
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab={authTab}
      />
    </>
  );
}
