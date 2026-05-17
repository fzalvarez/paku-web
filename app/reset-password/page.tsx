"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/api/auth";

// ── Reglas de contraseña (igual que en AuthDialog) ────────────────────────────
const PASSWORD_RULES = [
  { id: "length",    label: "Mínimo 8 caracteres",   test: (v: string) => v.length >= 8 },
  { id: "uppercase", label: "Al menos una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "digit",     label: "Al menos un número",     test: (v: string) => /\d/.test(v) },
] as const;

// ── Inner component (needs useSearchParams) ───────────────────────────────────
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ruleResults = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) })),
    [password]
  );
  const passwordValid = ruleResults.every((r) => r.passed);

  // Si no hay token en la URL, mostrar error inmediato
  const missingToken = !token;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordValid) return;
    setError(null);
    setLoading(true);
    try {
      await authService.resetPassword({ token, new_password: password });
      setSuccess(true);
      // Redirigir al home tras 3 s
      setTimeout(() => router.push("/"), 3000);
    } catch {
      setError(
        "El enlace es inválido o ha expirado. Solicita uno nuevo desde ¿Olvidaste tu contraseña?."
      );
    } finally {
      setLoading(false);
    }
  }

  if (missingToken) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Enlace inválido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No se encontró un token de recuperación en este enlace.
          </p>
        </div>
        <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="size-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">¡Contraseña actualizada!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu contraseña se restableció correctamente. Serás redirigido en unos segundos…
          </p>
        </div>
        <Link href="/" className="text-sm font-semibold text-primary hover:underline">
          Ir al inicio ahora
        </Link>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Nueva contraseña</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Elige una contraseña segura para tu cuenta Paku.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Campo contraseña */}
        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {/* Indicadores en tiempo real */}
          {password.length > 0 && (
            <ul className="flex flex-col gap-0.5 pl-0.5">
              {ruleResults.map((r) => (
                <li
                  key={r.id}
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    r.passed ? "text-green-600" : "text-muted-foreground"
                  )}
                >
                  {r.passed ? <Check className="size-3 shrink-0" /> : <X className="size-3 shrink-0" />}
                  {r.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}{" "}
            <Link href="/forgot-password" className="font-semibold underline">
              Solicitar nuevo enlace
            </Link>
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading || !passwordValid}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Restablecer contraseña
        </Button>
      </form>
    </>
  );
}

// ── Page (Suspense requerido por useSearchParams en Next.js App Router) ────────
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
