"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import type { RegisterRequest } from "@/types/auth";

// ── Tipos internos ────────────────────────────────────────────────────────────
type AuthTab = "login" | "register";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tab inicial al abrir el dialog */
  defaultTab?: AuthTab;
}

// ── Sub-componente: Tab selector ──────────────────────────────────────────────
function TabSelector({
  active,
  onChange,
}: {
  active: AuthTab;
  onChange: (tab: AuthTab) => void;
}) {
  return (
    <div className="flex rounded-xl bg-muted p-1">
      {(["login", "register"] as AuthTab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
            active === tab
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab === "login" ? "Iniciar sesión" : "Registrarse"}
        </button>
      ))}
    </div>
  );
}

// ── Sub-componente: Separador ─────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

// ── Sub-componente: Campo de contraseña ───────────────────────────────────────
function PasswordInput({
  value,
  onChange,
  placeholder = "Contraseña",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
        required
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

// ── Formulario: Login ─────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <PasswordInput value={password} onChange={setPassword} />

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
        Iniciar sesión
      </Button>
    </form>
  );
}

// ── Formulario: Registro ──────────────────────────────────────────────────────
const INITIAL_REGISTER: RegisterRequest = {
  email: "",
  password: "",
  phone: "",
  first_name: "",
  last_name: "",
  sex: "male",
  birth_date: "",
  role: "user",
  dni: "",
};

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, login } = useAuthContext();
  const [form, setForm] = useState<RegisterRequest>(INITIAL_REGISTER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof RegisterRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      // register in context performs login automatically in AuthProvider.login flow,
      // but some backends don't return tokens on register — ensure we login with credentials
      await login({ email: form.email, password: form.password });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("No se pudo completar el registro. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Nombre y apellido */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Nombre"
          value={form.first_name}
          onChange={set("first_name")}
          required
          autoComplete="given-name"
        />
        <Input
          placeholder="Apellido"
          value={form.last_name}
          onChange={set("last_name")}
          required
          autoComplete="family-name"
        />
      </div>

      {/* Email */}
      <Input
        type="email"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={set("email")}
        required
        autoComplete="email"
      />

      {/* Contraseña */}
      <PasswordInput
        value={form.password}
        onChange={(v) => setForm((p) => ({ ...p, password: v }))}
      />

      {/* Teléfono + DNI */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="tel"
          placeholder="Teléfono"
          value={form.phone}
          onChange={set("phone")}
          required
          autoComplete="tel"
        />
        <Input
          placeholder="DNI"
          value={form.dni}
          onChange={set("dni")}
          required
        />
      </div>

      {/* Fecha de nacimiento + Sexo */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="date"
          placeholder="Fecha de nacimiento"
          value={form.birth_date}
          onChange={set("birth_date")}
          required
        />
        <select
          value={form.sex}
          onChange={set("sex")}
          required
          className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
        </select>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="mt-1 w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
        Crear cuenta
      </Button>
    </form>
  );
}

// ── Dialog principal ──────────────────────────────────────────────────────────
export function AuthDialog({ open, onOpenChange, defaultTab = "register" }: AuthDialogProps) {
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const { loginWithGoogle } = useAuthContext();

  function handleSuccess() {
    onOpenChange(false);
    // TODO: actualizar estado de sesión global cuando esté implementado
  }

  async function handleGoogleSignIn() {
    setSocialError(null);
    setSocialLoading(true);
    try {
      const result = await loginWithGoogle();
      // loginWithGoogle in context saves tokens and sets user
      if (result.isNewUser) {
        console.log("[Auth] Usuario nuevo — redirigir a completar perfil");
      }
      handleSuccess();
    } catch (err) {
      console.error(err);
      setSocialError("No se pudo iniciar sesión con Google. Intenta de nuevo.");
    } finally {
      setSocialLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold tracking-tight">
            {tab === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </DialogTitle>
          <DialogDescription>
            {tab === "login"
              ? "Ingresa tus credenciales para acceder a Paku."
              : "Regístrate gratis y agenda el primer servicio."}
          </DialogDescription>
        </DialogHeader>

        {/* Selector de tab */}
        <TabSelector active={tab} onChange={setTab} />

        {/* Formularios email/password */}
        {tab === "login" ? (
          <LoginForm onSuccess={handleSuccess} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} />
        )}

        {/* Separador */}
        <Divider label="o continúa con" />

        {/* Botón Google */}
        <Button
          variant="outline"
          className="w-full gap-3"
          onClick={handleGoogleSignIn}
          disabled={socialLoading}
        >
          {socialLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            // Logo Google SVG inline (no necesita dependencia)
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continuar con Google
        </Button>

        {socialError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {socialError}
          </p>
        )}

        {/* Cambio de tab contextual */}
        <p className="text-center text-sm text-muted-foreground">
          {tab === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                className="font-semibold text-primary hover:underline"
                onClick={() => setTab("register")}
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                className="font-semibold text-primary hover:underline"
                onClick={() => setTab("login")}
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
