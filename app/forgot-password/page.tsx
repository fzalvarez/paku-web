"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch {
      setError("Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        {sent ? (
          /* ── Estado: email enviado ── */
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="size-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Revisa tu correo</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Si <span className="font-semibold text-foreground">{email}</span> tiene una cuenta,
                recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              ¿No llegó? Revisa tu carpeta de spam o{" "}
              <button
                className="font-semibold text-primary hover:underline"
                onClick={() => setSent(false)}
              >
                intenta de nuevo
              </button>
              .
            </p>
            <Link
              href="/"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          /* ── Estado: formulario ── */
          <>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">¿Olvidaste tu contraseña?</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Ingresa tu correo y te enviaremos un enlace para restablecerla.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />

              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Enviar enlace
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya la recordaste?{" "}
              <Link href="/" className="font-semibold text-primary hover:underline">
                Volver al inicio
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
