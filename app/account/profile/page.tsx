"use client";

import React, { useState } from "react";
import { Loader2, User, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/contexts/AuthContext";
import { usersService } from "@/lib/api/users";
import type { UpdateMeRequest, SetPasswordRequest } from "@/lib/api/users";
import { cn } from "@/lib/utils";

// Estilos de campo — deliberadamente discretos: el label y el valor no
// deben competir en color/tamaño con los títulos de la página o sección.
const FIELD_LABEL_CLASS = "text-sm font-medium text-muted-foreground";
const FIELD_INPUT_CLASS = "h-11";

// ── Helper: banner de feedback ─────────────────────────────────────────────────
function Feedback({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
        type === "success"
          ? "border border-green-200 bg-green-50 text-green-700"
          : "border border-destructive/20 bg-destructive/10 text-destructive"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="size-4 shrink-0" />
      ) : (
        <AlertCircle className="size-4 shrink-0" />
      )}
      {msg}
    </div>
  );
}

// ── Sección reutilizable ───────────────────────────────────────────────────────

const ACCENT_CLASSES = {
  primary: {
    text: "text-primary",
    blobBg: "bg-primary/10",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  secondary: {
    text: "text-secondary",
    blobBg: "bg-secondary/10",
    button: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  },
} as const;

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  accent = "primary",
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  accent?: keyof typeof ACCENT_CLASSES;
}) {
  const a = ACCENT_CLASSES[accent];
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm sm:p-7">
      {/* Cabecera */}
      <div className="flex items-start gap-3.5">
        <div className="relative size-10 shrink-0">
          <div className={cn("absolute inset-0 rounded-[46%_54%_58%_42%/48%_42%_58%_52%]", a.blobBg)} />
          <div className={cn("absolute inset-0 flex items-center justify-center", a.text)}>
            <Icon className="size-4.5" />
          </div>
        </div>
        <div>
          <p className="text-lg font-extrabold tracking-tight text-foreground">{title}</p>
          {description && <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="mt-5 border-t border-border/60 pt-5">{children}</div>
    </div>
  );
}

// ── Formulario: datos personales ──────────────────────────────────────────────
function PersonalDataForm() {
  const { user, refreshUser } = useAuthContext();
  const [form, setForm] = useState<UpdateMeRequest>({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    phone: user?.phone ?? "",
    sex: user?.sex ?? "male",
    birth_date: user?.birth_date ?? "",
    dni: user?.dni ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const set = (key: keyof UpdateMeRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      await usersService.updateMe(form);
      await refreshUser();
      setFeedback({ type: "success", msg: "Perfil actualizado correctamente." });
    } catch {
      setFeedback({ type: "error", msg: "No se pudo actualizar el perfil. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Email (solo lectura) */}
      <div className="flex flex-col gap-1.5">
        <label className={FIELD_LABEL_CLASS}>
          Correo electrónico
        </label>
        <Input value={user?.email ?? ""} disabled className={cn(FIELD_INPUT_CLASS, "disabled:opacity-70")} />
        <p className="text-xs text-muted-foreground">El correo no se puede modificar.</p>
      </div>

      {/* Nombre + Apellido */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Nombre</label>
          <Input className={FIELD_INPUT_CLASS} placeholder="Nombre" value={form.first_name} onChange={set("first_name")} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Apellido</label>
          <Input className={FIELD_INPUT_CLASS} placeholder="Apellido" value={form.last_name} onChange={set("last_name")} />
        </div>
      </div>

      {/* Teléfono + DNI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Teléfono</label>
          <Input className={FIELD_INPUT_CLASS} type="tel" placeholder="123 456 789" value={form.phone} onChange={set("phone")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>DNI</label>
          <Input className={FIELD_INPUT_CLASS} placeholder="12345678" value={form.dni} onChange={set("dni")} />
        </div>
      </div>

      {/* Fecha nacimiento + Sexo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Fecha de nacimiento</label>
          <Input className={FIELD_INPUT_CLASS} type="date" value={form.birth_date} onChange={set("birth_date")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Género</label>
          <select
            value={form.sex}
            onChange={set("sex")}
            className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </div>
      </div>

      {feedback && <Feedback type={feedback.type} msg={feedback.msg} />}

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="size-4 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}

// ── Formulario: cambiar contraseña ────────────────────────────────────────────
function PasswordForm() {
  const [form, setForm] = useState<SetPasswordRequest & { confirm: string }>({
    current_password: "",
    new_password: "",
    confirm: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (form.new_password !== form.confirm) {
      setFeedback({ type: "error", msg: "Las contraseñas no coinciden." });
      return;
    }
    if (form.new_password.length < 8) {
      setFeedback({ type: "error", msg: "La nueva contraseña debe tener al menos 8 caracteres." });
      return;
    }
    setLoading(true);
    try {
      await usersService.setPassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setFeedback({ type: "success", msg: "Contraseña actualizada correctamente." });
      setForm({ current_password: "", new_password: "", confirm: "" });
    } catch {
      setFeedback({ type: "error", msg: "No se pudo cambiar la contraseña. Verifica tu contraseña actual." });
    } finally {
      setLoading(false);
    }
  }

  function PasswordField({
    label, value, show, onToggle, onChange, placeholder,
  }: {
    label: string; value: string; show: boolean;
    onToggle: () => void; onChange: (v: string) => void; placeholder: string;
  }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className={FIELD_LABEL_CLASS}>{label}</label>
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(FIELD_INPUT_CLASS, "pr-10")}
            required
          />
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PasswordField
        label="Contraseña actual"
        value={form.current_password ?? ""}
        show={showCurrent}
        onToggle={() => setShowCurrent((p) => !p)}
        onChange={(v) => setForm((p) => ({ ...p, current_password: v }))}
        placeholder="Tu contraseña actual"
      />
      <PasswordField
        label="Nueva contraseña"
        value={form.new_password}
        show={showNew}
        onToggle={() => setShowNew((p) => !p)}
        onChange={(v) => setForm((p) => ({ ...p, new_password: v }))}
        placeholder="Mínimo 8 caracteres"
      />
      <PasswordField
        label="Confirmar nueva contraseña"
        value={form.confirm}
        show={showNew}
        onToggle={() => setShowNew((p) => !p)}
        onChange={(v) => setForm((p) => ({ ...p, confirm: v }))}
        placeholder="Repite la nueva contraseña"
      />

      {feedback && <Feedback type={feedback.type} msg={feedback.msg} />}

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={loading}
          className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Cambiar contraseña
        </Button>
      </div>
    </form>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuthContext();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado de página */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-primary md:text-4xl">Mi perfil</h1>
        <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
          Administra tu información personal y seguridad de la cuenta.
        </p>
      </div>

      {/* Datos personales */}
      <SectionCard
        icon={User}
        title="Datos personales"
        description="Esta información es visible para los proveedores de servicios."
        accent="primary"
      >
        <PersonalDataForm />
      </SectionCard>

      {/* Cambiar contraseña */}
      <SectionCard
        icon={Lock}
        title="Seguridad"
        description="Cambia tu contraseña periódicamente para mantener tu cuenta segura."
        accent="secondary"
      >
        <PasswordForm />
      </SectionCard>
    </div>
  );
}
