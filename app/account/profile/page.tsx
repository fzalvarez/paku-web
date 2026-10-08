"use client";

import React, { useState } from "react";
import { Loader2, User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { InlineAlert } from "@/components/account/InlineAlert";
import { useAuthContext } from "@/contexts/AuthContext";
import { usersService } from "@/lib/api/users";
import type { UpdateMeRequest, SetPasswordRequest } from "@/lib/api/users";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

// ── Sección reutilizable ───────────────────────────────────────────────────────

const ACCENT_CLASSES = {
  primary: {
    text: "text-primary",
    blobBg: "bg-primary/10",
  },
  secondary: {
    text: "text-secondary",
    blobBg: "bg-secondary/10",
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
        <Label>
          Correo electrónico
        </Label>
        <Input value={user?.email ?? ""} disabled className="disabled:opacity-70" />
        <p className="text-xs text-muted-foreground">El correo no se puede modificar.</p>
      </div>

      {/* Nombre + Apellido */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Nombre</Label>
          <Input placeholder="Nombre" value={form.first_name} onChange={set("first_name")} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Apellido</Label>
          <Input placeholder="Apellido" value={form.last_name} onChange={set("last_name")} />
        </div>
      </div>

      {/* Teléfono + DNI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Teléfono</Label>
          <Input type="tel" placeholder="123 456 789" value={form.phone} onChange={set("phone")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>DNI</Label>
          <Input placeholder="12345678" value={form.dni} onChange={set("dni")} />
        </div>
      </div>

      {/* Fecha nacimiento + Sexo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de nacimiento</Label>
          <Input type="date" value={form.birth_date} onChange={set("birth_date")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Género</Label>
          <NativeSelect
            value={form.sex}
            onChange={set("sex")}
          >
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </NativeSelect>
        </div>
      </div>

      {feedback && <InlineAlert type={feedback.type}>{feedback.msg}</InlineAlert>}

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
        <Label>{label}</Label>
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

      {feedback && <InlineAlert type={feedback.type}>{feedback.msg}</InlineAlert>}

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={loading} className="gap-2">
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
      <AccountPageHeader
        title="Mi perfil"
        description="Administra tu información personal y seguridad de la cuenta."
      />

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
