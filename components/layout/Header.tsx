"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Settings, CreditCard, HelpCircle, LogOut, ChevronDown, ShoppingCart as ShoppingCartIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { AuthDialog } from "@/components/common/AuthDialog";
import { CartButton } from "@/components/common/CartButton";
import { useAuthContext } from "@/contexts/AuthContext";

const NAV_LINKS = [
  { label: "Inicio", href: ROUTES.HOME },
] as const;

// ── Helper: iniciales del usuario ─────────────────────────────────────────────
function getUserInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

// ── Sub-componente: Menú de usuario (desktop) ─────────────────────────────────
function UserMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuthContext();

  const initials = getUserInitials(user?.first_name, user?.last_name, user?.email);
  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
    : user?.email ?? "Usuario";

  return (
    <DropdownMenu>
      {/* ── Trigger: pill con avatar + nombre + chevron ── */}
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2.5 rounded-full border border-border bg-background px-2 py-1.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
          {/* Avatar con borde gradiente */}
          <span className="relative shrink-0">
            <span className="absolute inset-0 rounded-full bg-linear-to-br from-primary via-secondary to-tertiary p-[1.5px]" />
            <Avatar size="sm" className="relative ring-0">
              {user?.profile_photo_url && (
                <AvatarImage src={user.profile_photo_url} alt={displayName} />
              )}
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </span>

          <span className="hidden max-w-28 truncate text-sm font-semibold text-foreground sm:block">
            {user?.first_name ?? displayName}
          </span>

          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      {/* ── Contenido del menú ── */}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 overflow-hidden rounded-2xl border border-border/60 p-0 shadow-xl"
      >
        {/* Cabecera con gradiente de marca */}
        <div className="relative overflow-hidden bg-linear-to-br from-primary/10 via-secondary/5 to-tertiary/10 px-4 pb-3 pt-4">
          {/* Círculo decorativo */}
          <div className="absolute -right-6 -top-6 size-20 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-4 left-4 size-16 rounded-full bg-secondary/10 blur-xl" />

          <div className="relative flex items-center gap-3">
            {/* Avatar grande */}
            <span className="relative shrink-0">
              <span className="absolute inset-0 rounded-full bg-linear-to-br from-primary via-secondary to-tertiary p-0.5" />
              <Avatar size="default" className="relative ring-0 shadow-sm">
                {user?.profile_photo_url && (
                  <AvatarImage src={user.profile_photo_url} alt={displayName} />
                )}
                <AvatarFallback className="bg-white text-sm font-extrabold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </span>

            {/* Info */}
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold tracking-tight text-foreground">
                {displayName}
              </p>
              {user?.email && (
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              )}
              {/* Badge rol */}
              <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                Cuenta Paku
              </span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href="/account/profile"
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Settings className="size-4" />
                </span>
                <div>
                  <p className="font-semibold leading-none">Ajustes de cuenta</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Perfil, contraseña y preferencias</p>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/account/orders"
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/5 hover:text-secondary focus:bg-secondary/5 focus:text-secondary"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <CreditCard className="size-4" />
                </span>
                <div>
                  <p className="font-semibold leading-none">Pagos</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Historial y métodos de pago</p>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1.5" />

          <DropdownMenuItem asChild>
            <a
              href="mailto:soporte@paku.pe"
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <HelpCircle className="size-4" />
              </span>
              <div>
                <p className="font-semibold leading-none">Centro de ayuda</p>
                <p className="mt-0.5 text-xs text-muted-foreground">soporte@paku.pe</p>
              </div>
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1.5" />

          <DropdownMenuItem
            onClick={onLogout}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 focus:bg-destructive/5 focus:text-destructive"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <LogOut className="size-4" />
            </span>
            <p className="font-semibold leading-none">Cerrar sesión</p>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [cartOpen, setCartOpen] = useState(false);
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
          <Link href={ROUTES.HOME} className="flex items-center">
            <Image
              src="/assets/imagotipo.png"
              alt="Paku"
              width={120}
              height={52}
              className="h-12 w-auto object-contain"
              priority
            />
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
              <div className="h-8 w-36 animate-pulse rounded-full bg-muted" />
            ) : user ? (
              <>
                <CartButton
                  open={cartOpen}
                  onOpenChange={setCartOpen}
                  onCheckout={() => {
                    // TODO: navegar a /checkout cuando la página exista
                  }}
                />
                <UserMenu onLogout={logout} />
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

            <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3">
              {loading ? (
                <div className="h-16 animate-pulse rounded-xl bg-muted" />
              ) : user ? (
                <>
                  {/* Cabecera de usuario mobile — estilo de marca */}
                  <div className="relative mb-1 overflow-hidden rounded-xl bg-linear-to-br from-primary/10 via-secondary/5 to-tertiary/10 px-3 py-3">
                    <div className="absolute -right-4 -top-4 size-14 rounded-full bg-primary/10 blur-xl" />
                    <div className="relative flex items-center gap-3">
                      <span className="relative shrink-0">
                        <span className="absolute inset-0 rounded-full bg-linear-to-br from-primary via-secondary to-tertiary p-0.5" />
                        <Avatar size="sm" className="relative ring-0">
                          {user.profile_photo_url && (
                            <AvatarImage src={user.profile_photo_url} alt={user.first_name ?? "Usuario"} />
                          )}
                          <AvatarFallback className="bg-white text-xs font-extrabold text-primary">
                            {getUserInitials(user.first_name, user.last_name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold tracking-tight text-foreground">
                          {user.first_name ? `${user.first_name} ${user.last_name ?? ""}`.trim() : user.email}
                        </p>
                        {user.email && (
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Links de navegación mobile */}
                  <button
                    onClick={() => { setMobileOpen(false); setCartOpen(true); }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShoppingCartIcon className="size-3.5" />
                    </span>
                    <span className="flex-1 text-left">Mi carrito</span>
                  </button>
                  <Link
                    href="/account/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Settings className="size-3.5" />
                    </span>
                    Ajustes de cuenta
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/5 hover:text-secondary"
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                      <CreditCard className="size-3.5" />
                    </span>
                    Pagos
                  </Link>
                  <a
                    href="mailto:soporte@paku.pe"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <HelpCircle className="size-3.5" />
                    </span>
                    Centro de ayuda
                  </a>
                  <button
                    onClick={() => { setMobileOpen(false); logout(); }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                      <LogOut className="size-3.5" />
                    </span>
                    Cerrar sesión
                  </button>
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
