"use client";

import React, { useState } from "react";
import { Loader2, User, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/contexts/AuthContext";
import { usersService } from "@/lib/api/users";
import type { UpdateMeRequest, SetPasswordRequest } from "@/lib/api/users";
import { cn } from "@/lib/utils";

// ── Helper: banner de feedback ─────────────────────────────────────────────────
function Feedback({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
        type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-destructive/10 text-destructive border border-destructive/20"
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
function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
      {/* Cabecera */}
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", iconBg, iconColor)}>
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-sm font-extrabold tracking-tight text-foreground">{title}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
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
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Correo electrónico
        </label>
        <Input value={user?.email ?? ""} disabled className="bg-muted/50 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">El correo no se puede modificar.</p>
      </div>

      {/* Nombre + Apellido */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre</label>
          <Input placeholder="Nombre" value={form.first_name} onChange={set("first_name")} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Apellido</label>
          <Input placeholder="Apellido" value={form.last_name} onChange={set("last_name")} />
        </div>
      </div>

      {/* Teléfono + DNI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Teléfono</label>
          <Input type="tel" placeholder="Teléfono" value={form.phone} onChange={set("phone")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">DNI</label>
          <Input placeholder="DNI" value={form.dni} onChange={set("dni")} />
        </div>
      </div>

      {/* Fecha nacimiento + Sexo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha de nacimiento</label>
          <Input type="date" value={form.birth_date} onChange={set("birth_date")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sexo</label>
          <select
            value={form.sex}
            onChange={set("sex")}
            className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </div>
      </div>

      {feedback && <Feedback type={feedback.type} msg={feedback.msg} />}

      <div className="flex justify-end">
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
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
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

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} variant="outline" className="gap-2">
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
    <div className="flex flex-col gap-6">
      {/* Encabezado de página */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra tu información personal y seguridad de la cuenta.
        </p>
      </div>

      {/* Datos personales */}
      <SectionCard
        icon={User}
        title="Datos personales"
        description="Esta información es visible para los proveedores de servicios."
        iconColor="text-primary"
        iconBg="bg-primary/10"
      >
        <PersonalDataForm />
      </SectionCard>

      {/* Cambiar contraseña */}
      <SectionCard
        icon={Lock}
        title="Seguridad"
        description="Cambia tu contraseña periódicamente para mantener tu cuenta segura."
        iconColor="text-secondary"
        iconBg="bg-secondary/10"
      >
        <PasswordForm />
      </SectionCard>
    </div>
  );
}
