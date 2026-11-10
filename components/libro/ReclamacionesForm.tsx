"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, Printer } from "lucide-react";
import { ApiCallError } from "@/lib/api/client";
import {
  complaintsService,
  type ComplaintDocType,
  type ComplaintItemType,
  type ComplaintKind,
  type ComplaintReceipt,
} from "@/lib/api/complaints";

// Hoja de reclamación virtual: se guarda en Paku, con número correlativo, y la copia llega al correo del consumidor.

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const labelCls = "mb-1 block text-xs font-medium";

const DOC_TYPES: { value: ComplaintDocType; label: string }[] = [
  { value: "dni", label: "DNI" },
  { value: "ce", label: "Carné de extranjería" },
  { value: "pasaporte", label: "Pasaporte" },
  { value: "ruc", label: "RUC" },
];

const FIELD_LABELS: Record<string, string> = {
  consumer_name: "Nombre completo",
  doc_type: "Tipo de documento",
  doc_number: "Número de documento",
  email: "Correo electrónico",
  phone: "Teléfono",
  address: "Domicilio",
  guardian_name: "Padre, madre o apoderado",
  item_type: "Tipo de bien",
  item_description: "Descripción del bien",
  order_reference: "Número de pedido",
  amount_claimed: "Monto reclamado",
  kind: "Tipo",
  detail: "Detalle",
  request: "Pedido",
};

const emptyForm = {
  consumer_name: "",
  doc_type: "dni" as ComplaintDocType,
  doc_number: "",
  email: "",
  phone: "",
  address: "",
  is_minor: false,
  guardian_name: "",
  item_type: "servicio" as ComplaintItemType,
  item_description: "",
  order_reference: "",
  amount_claimed: "",
  kind: "reclamo" as ComplaintKind,
  detail: "",
  request: "",
  accepted: false,
};

function fmtDate(iso: string, withTime = false) {
  const d = new Date(withTime ? iso : `${iso}T12:00:00`);
  return d.toLocaleString("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export default function ReclamacionesForm() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState<ComplaintReceipt | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.accepted) {
      setError({ message: "Confirma que los datos son correctos para registrar la hoja." });
      return;
    }
    const amount = form.amount_claimed.trim().replace(",", ".");
    if (amount && !(Number(amount) > 0)) {
      setError({ field: "amount_claimed", message: "El monto reclamado no es válido." });
      return;
    }
    setError(null);
    setSending(true);
    try {
      const result = await complaintsService.submit({
        consumer_name: form.consumer_name,
        doc_type: form.doc_type,
        doc_number: form.doc_number,
        email: form.email,
        phone: form.phone || null,
        address: form.address || null,
        is_minor: form.is_minor,
        guardian_name: form.is_minor ? form.guardian_name : null,
        item_type: form.item_type,
        item_description: form.item_description,
        order_reference: form.order_reference || null,
        amount_claimed: amount ? Number(amount) : null,
        kind: form.kind,
        detail: form.detail,
        request: form.request,
      });
      setReceipt(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiCallError) {
        const detail = err.detail as { field?: string; message?: string } | undefined;
        const field = typeof detail === "object" && detail ? detail.field : undefined;
        setError({ field, message: detail?.message ?? err.message });
      } else {
        setError({ message: "No pudimos registrar tu hoja. Revisa tu conexión e inténtalo de nuevo." });
      }
    } finally {
      setSending(false);
    }
  }

  if (receipt) {
    return (
      // data-print-area: la web solo imprime los bloques marcados (ver globals.css).
      <div data-print-area className="rounded-lg border border-emerald-300 bg-emerald-50/60 p-5 text-sm dark:border-emerald-800 dark:bg-emerald-950/30">
        <p className="mb-2 hidden text-base font-bold print:block">Libro de Reclamaciones — Paku</p>
        <div className="mb-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-5" />
          <h3 className="text-lg font-semibold">Hoja de reclamación registrada</h3>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          <div><dt className="text-xs text-muted-foreground">Hoja N.°</dt><dd className="font-mono text-base font-bold">{receipt.code}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Fecha de registro</dt><dd>{fmtDate(receipt.created_at, true)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Tipo</dt><dd className="capitalize">{form.kind}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Respuesta a más tardar</dt><dd>{fmtDate(receipt.response_due)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Proveedor</dt><dd>{receipt.provider_legal_name} · RUC {receipt.provider_ruc} · {receipt.provider_address}</dd></div>
        </dl>
        <dl className="mt-4 grid grid-cols-1 gap-y-2 border-t border-emerald-200 pt-4 dark:border-emerald-900">
          {[
            ["Consumidor", `${form.consumer_name} · ${DOC_TYPES.find((d) => d.value === form.doc_type)?.label ?? ""} ${form.doc_number}`],
            ["Correo", form.email],
            ["Teléfono", form.phone],
            ["Domicilio", form.address],
            ["Padre, madre o apoderado", form.is_minor ? form.guardian_name : ""],
            ["Bien contratado", `${form.item_type === "producto" ? "Producto" : "Servicio"}: ${form.item_description}`],
            ["Número de pedido", form.order_reference],
            ["Monto reclamado", form.amount_claimed ? `S/ ${form.amount_claimed}` : ""],
            ["Detalle", form.detail],
            ["Pedido", form.request],
          ]
            .filter(([, v]) => v && v.trim())
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="whitespace-pre-wrap break-words">{v}</dd>
              </div>
            ))}
        </dl>
        <p className="mt-4 text-muted-foreground">
          Enviamos una copia de tu hoja a <strong className="text-foreground">{receipt.email}</strong>. Si no la ves,
          revisa tu carpeta de spam. Te responderemos a ese correo dentro de los 15 días hábiles.
        </p>
        <div data-print-hide className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            <Printer className="size-4" /> Imprimir o guardar en PDF
          </button>
          <button type="button" onClick={() => { setReceipt(null); setForm(emptyForm); }} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Registrar otra hoja
          </button>
        </div>
      </div>
    );
  }

  const invalid = (field: string) => (error?.field === field ? true : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-lg border border-border bg-background p-4 sm:p-5">
      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-semibold">1. Identificación del consumidor reclamante</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="lr-name">Nombre completo *</label>
            <input id="lr-name" className={inputCls} value={form.consumer_name} aria-invalid={invalid("consumer_name")} onChange={(e) => update("consumer_name", e.target.value)} autoComplete="name" maxLength={150} required />
          </div>
          <div>
            <label className={labelCls} htmlFor="lr-doctype">Tipo de documento *</label>
            <select id="lr-doctype" className={inputCls} value={form.doc_type} onChange={(e) => update("doc_type", e.target.value as ComplaintDocType)}>
              {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="lr-docnum">Número de documento *</label>
            <input id="lr-docnum" className={inputCls} value={form.doc_number} aria-invalid={invalid("doc_number")} onChange={(e) => update("doc_number", e.target.value)} maxLength={12} required />
          </div>
          <div>
            <label className={labelCls} htmlFor="lr-email">Correo electrónico *</label>
            <input id="lr-email" type="email" className={inputCls} value={form.email} aria-invalid={invalid("email")} onChange={(e) => update("email", e.target.value)} autoComplete="email" required />
          </div>
          <div>
            <label className={labelCls} htmlFor="lr-phone">Teléfono</label>
            <input id="lr-phone" type="tel" className={inputCls} value={form.phone} aria-invalid={invalid("phone")} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" maxLength={20} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="lr-address">Domicilio</label>
            <input id="lr-address" className={inputCls} value={form.address} onChange={(e) => update("address", e.target.value)} autoComplete="street-address" maxLength={300} />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.is_minor} onChange={(e) => update("is_minor", e.target.checked)} />
            Soy menor de edad
          </label>
          {form.is_minor && (
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="lr-guardian">Nombre del padre, madre o apoderado *</label>
              <input id="lr-guardian" className={inputCls} value={form.guardian_name} aria-invalid={invalid("guardian_name")} onChange={(e) => update("guardian_name", e.target.value)} maxLength={150} />
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-semibold">2. Identificación del bien contratado</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="lr-itemtype">Tipo *</label>
            <select id="lr-itemtype" className={inputCls} value={form.item_type} onChange={(e) => update("item_type", e.target.value as ComplaintItemType)}>
              <option value="servicio">Servicio</option>
              <option value="producto">Producto</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="lr-order">Número de pedido (si lo tienes)</label>
            <input id="lr-order" className={inputCls} value={form.order_reference} onChange={(e) => update("order_reference", e.target.value)} maxLength={60} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="lr-item">Descripción del servicio o producto *</label>
            <input id="lr-item" className={inputCls} value={form.item_description} aria-invalid={invalid("item_description")} onChange={(e) => update("item_description", e.target.value)} placeholder="Ejemplo: Baño Fresco y Limpio del 10/11/2026" maxLength={500} />
          </div>
          <div>
            <label className={labelCls} htmlFor="lr-amount">Monto reclamado en S/ (opcional)</label>
            <input id="lr-amount" inputMode="decimal" className={inputCls} value={form.amount_claimed} aria-invalid={invalid("amount_claimed")} onChange={(e) => update("amount_claimed", e.target.value)} placeholder="0.00" />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-semibold">3. Detalle de la reclamación y pedido del consumidor</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {([
            ["reclamo", "Reclamo", "Disconformidad relacionada a los productos o servicios."],
            ["queja", "Queja", "Disconformidad no relacionada a los productos o servicios, o malestar respecto a la atención al público."],
          ] as const).map(([value, label, help]) => (
            <label key={value} className={`flex cursor-pointer gap-2 rounded-md border p-3 text-sm ${form.kind === value ? "border-primary bg-primary/5" : "border-border"}`}>
              <input type="radio" name="kind" value={value} checked={form.kind === value} onChange={() => update("kind", value)} className="mt-0.5" />
              <span><span className="font-semibold">{label}:</span> <span className="text-muted-foreground">{help}</span></span>
            </label>
          ))}
        </div>
        <div>
          <label className={labelCls} htmlFor="lr-detail">Detalle *</label>
          <textarea id="lr-detail" rows={5} className={inputCls} value={form.detail} aria-invalid={invalid("detail")} onChange={(e) => update("detail", e.target.value)} maxLength={3000} />
        </div>
        <div>
          <label className={labelCls} htmlFor="lr-request">Pedido *</label>
          <textarea id="lr-request" rows={3} className={inputCls} value={form.request} aria-invalid={invalid("request")} onChange={(e) => update("request", e.target.value)} placeholder="¿Qué solución esperas?" maxLength={1500} />
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-0.5" checked={form.accepted} onChange={(e) => update("accepted", e.target.checked)} />
        <span className="text-muted-foreground">
          Declaro que los datos consignados son correctos. Usaremos tus datos solo para atender esta hoja, según
          nuestra <a href="/politicas/privacidad" className="underline">Política de privacidad</a>.
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error.field && FIELD_LABELS[error.field] ? <strong>{FIELD_LABELS[error.field]}: </strong> : null}
          {error.message}
        </p>
      )}

      <button type="submit" disabled={sending} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
        {sending && <Loader2 className="size-4 animate-spin" />}
        Enviar hoja de reclamación
      </button>
      <p className="text-xs text-muted-foreground">
        * Campos obligatorios. Al enviar recibirás el número de tu hoja y una copia en tu correo.
      </p>
    </form>
  );
}
