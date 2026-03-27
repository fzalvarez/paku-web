"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, MapPin, ShoppingBag, PawPrint, CreditCard, ChevronRight } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/account/profile",   label: "Mi perfil",           icon: User,        color: "text-primary",   bg: "bg-primary/10" },
  { href: "/account/pets",      label: "Mis mascotas",        icon: PawPrint,    color: "text-secondary", bg: "bg-secondary/10" },
  { href: "/account/addresses", label: "Direcciones",         icon: MapPin,      color: "text-tertiary",  bg: "bg-tertiary/10" },
  { href: "/account/payments",  label: "Métodos de pago",     icon: CreditCard,  color: "text-primary",   bg: "bg-primary/10" },
  { href: "/account/orders",    label: "Mis órdenes",         icon: ShoppingBag, color: "text-secondary", bg: "bg-secondary/10" },
];

function getUserInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, isAuthenticated, user } = useAuthContext();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">Cargando tu cuenta…</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`.trim()
    : user?.email ?? "Usuario";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">
            {NAV_LINKS.find((l) => l.href === pathname)?.label ?? "Mi cuenta"}
          </span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* ── Sidebar ── */}
          <aside className="w-full shrink-0 lg:w-64">
            {/* Tarjeta de usuario */}
            <div className="relative mb-4 overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-secondary/5 to-tertiary/10 p-5 shadow-sm">
              <div className="absolute -right-8 -top-8 size-28 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-6 left-0 size-20 rounded-full bg-secondary/10 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <span className="relative shrink-0">
                  <span className="absolute inset-0 rounded-full bg-linear-to-br from-primary via-secondary to-tertiary p-0.5" />
                  <Avatar className="relative size-14 ring-0 shadow-md">
                    {user?.profile_photo_url && (
                      <AvatarImage src={user.profile_photo_url} alt={displayName} />
                    )}
                    <AvatarFallback className="bg-white text-base font-extrabold text-primary">
                      {getUserInitials(user?.first_name, user?.last_name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold tracking-tight text-foreground">
                    {displayName}
                  </p>
                  {user?.email && (
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  )}
                  <span className="mt-1.5 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Cuenta Paku
                  </span>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-background p-2 shadow-sm">
              {NAV_LINKS.map(({ href, label, icon: Icon, color, bg }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                        active ? "bg-white/20 text-white" : `${bg} ${color}`
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight className="size-3.5 opacity-60" />}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* ── Contenido ── */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
