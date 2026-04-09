"use client";

import React, { useState } from "react";

export default function ReclamacionesForm() {
  const [form, setForm] = useState({
    nombre: "",
    menor: false,
    tipoDocumento: "DNI",
    numeroDocumento: "",
    correo: "",
    telefono: "",
    domicilio: "",
    tipoBien: "Servicio",
    descripcionBien: "",
    reclamarMonto: false,
    monto: "",
    tipoReclamacion: "Reclamo",
    detalleReclamacion: "",
    pedido: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function validate() {
    const e: string[] = [];
    if (!form.nombre.trim()) e.push("Nombre es obligatorio.");
    if (!form.numeroDocumento.trim()) e.push("Número de documento es obligatorio.");
    if (!form.correo.trim()) e.push("Correo electrónico es obligatorio.");
    if (!form.descripcionBien.trim()) e.push("Descripción del bien o servicio es obligatoria.");
    if (!form.detalleReclamacion.trim()) e.push("Detalle de la reclamación es obligatorio.");
    if (!form.pedido.trim()) e.push("Indique qué espera como solución (pedido).");
    return e;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eList = validate();
    if (eList.length) {
      setErrors(eList);
      return;
    }
    setErrors([]);
    setSubmitted(true);
    // Abrir plataforma externa en una nueva pestaña; el formulario no se envía automáticamente
    window.open("https://reclamovirtual.pe", "_blank");
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-background p-4">
        <h3 className="mb-2 text-lg font-semibold">Reclamación preparada</h3>
        <p className="mb-3 text-sm text-muted-foreground">Su formulario ha sido validado localmente. Hemos abierto la plataforma externa para que complete el registro oficial.</p>
        <p className="text-sm text-muted-foreground">Código de identificación: <strong>0297048d-dac3-4121-8cf2-fef08bd594f8</strong></p>
        <div className="mt-3 flex gap-2">
          <a className="inline-flex items-center gap-2 rounded bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10" href="https://reclamovirtual.pe" target="_blank" rel="noopener noreferrer">Ir a Reclamovirtual</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-border bg-background p-4">
      <input type="hidden" name="codigo_identificacion" value="0297048d-dac3-4121-8cf2-fef08bd594f8" />
      <input type="hidden" name="plataforma" value="https://reclamovirtual.pe" />

      <h3 className="mb-3 text-lg font-semibold">Libro de reclamaciones — Formulario</h3>
      <p className="mb-3 text-sm text-muted-foreground">Consumidor reclamante — Por favor, ingrese sus datos personales para poder atender su reclamación.</p>

      {errors.length > 0 && (
        <div className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">
          <ul className="list-disc pl-4">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium">Nombre</label>
          <input value={form.nombre} onChange={(e) => update("nombre", e.target.value)} placeholder='Ejemplo: "Juan José Pérez Quispe"' className="w-full rounded border px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-2 text-xs font-medium"><input type="checkbox" checked={form.menor} onChange={(e) => update("menor", e.target.checked)} /> Soy menor de edad</label>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Tipo de documento de identidad</label>
          <select value={form.tipoDocumento} onChange={(e) => update("tipoDocumento", e.target.value)} className="w-full rounded border px-3 py-2 text-sm">
            <option>DNI</option>
            <option>Carné de Extranjería</option>
            <option>Pasaporte</option>
            <option>Otro</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Número de documento de identidad</label>
          <input value={form.numeroDocumento} onChange={(e) => update("numeroDocumento", e.target.value)} placeholder='Ejemplo: "12345678"' className="w-full rounded border px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Correo electrónico</label>
          <input value={form.correo} onChange={(e) => update("correo", e.target.value)} placeholder='Ejemplo: "juan.perez@reclamovirtual.pe"' className="w-full rounded border px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Teléfono (Opcional)</label>
          <input value={form.telefono} onChange={(e) => update("telefono", e.target.value)} placeholder='Ejemplo: "987654321"' className="w-full rounded border px-3 py-2 text-sm" />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium">Domicilio (Opcional)</label>
          <input value={form.domicilio} onChange={(e) => update("domicilio", e.target.value)} placeholder='Ejemplo: "Av. Los Laureles 123, Miraflores, Lima"' className="w-full rounded border px-3 py-2 text-sm" />
        </div>
      </div>

      <hr className="my-3" />

      <h4 className="mb-2 text-sm font-semibold">Bien contratado</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium">Tipo de bien contratado</label>
          <select value={form.tipoBien} onChange={(e) => update("tipoBien", e.target.value)} className="w-full rounded border px-3 py-2 text-sm">
            <option>Producto</option>
            <option>Servicio</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium">Descripción del producto o servicio</label>
          <input value={form.descripcionBien} onChange={(e) => update("descripcionBien", e.target.value)} placeholder='Ejemplo: "Laptop marca ABC modelo 123" o "Servicio de reparación de lavadora"' className="w-full rounded border px-3 py-2 text-sm" />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 flex items-center gap-2 text-xs font-medium"><input type="checkbox" checked={form.reclamarMonto} onChange={(e) => update("reclamarMonto", e.target.checked)} /> Deseo reclamar un monto por el producto o servicio.</label>
        </div>

        {form.reclamarMonto && (
          <div>
            <label className="mb-1 block text-xs font-medium">Monto reclamado</label>
            <input value={form.monto} onChange={(e) => update("monto", e.target.value)} placeholder='Ingrese el monto reclamado' className="w-full rounded border px-3 py-2 text-sm" />
          </div>
        )}
      </div>

      <hr className="my-3" />

      <h4 className="mb-2 text-sm font-semibold">Reclamación y pedido</h4>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium">Tipo de reclamación</label>
          <select value={form.tipoReclamacion} onChange={(e) => update("tipoReclamacion", e.target.value)} className="w-full rounded border px-3 py-2 text-sm">
            <option>Reclamo</option>
            <option>Queja</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">¿Cuál es su reclamación?</label>
          <textarea value={form.detalleReclamacion} onChange={(e) => update("detalleReclamacion", e.target.value)} rows={4} className="w-full rounded border px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">¿Cuál es su pedido?</label>
          <textarea value={form.pedido} onChange={(e) => update("pedido", e.target.value)} rows={3} className="w-full rounded border px-3 py-2 text-sm" />
        </div>
      </div>

      <hr className="my-3" />

      <div className="rounded border border-border bg-muted p-3 text-sm text-muted-foreground">
        <p className="mb-2 font-semibold">Información de privacidad del responsable</p>
        <p className="mb-1 text-xs">Responsable: Tryfta Digital UG (Reclamo Virtual) (RUC 0; domicilio: Mies-van-der-Rohe-Str. 6, 80807, Múnich, Alemania).</p>
        <p className="mb-1 text-xs">Finalidad: Registrar y gestionar su reclamo conforme al reglamento del libro de reclamaciones.</p>
        <p className="mb-1 text-xs">Derechos de datos: derechos@reclamovirtual.pe.</p>
        <p className="mb-1 text-xs">Conservación: Mínimo 2 años desde el registro, según normativa aplicable.</p>
        <p className="mb-1 text-xs">Transferencias internacionales: Alemania para la operación de la plataforma por Tryfta Digital UG y Estados Unidos para el alojamiento en servidores.</p>
        <p className="mb-0 text-xs">La formulación de la queja o reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</p>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button type="submit" className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90">Enviar reclamación</button>
        <a className="inline-flex items-center gap-2 rounded bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10" href="https://enlinea.indecopi.gob.pe/reclamavirtual/#/" target="_blank" rel="noopener noreferrer">Ir al Libro de Reclamaciones de Indecopi</a>
      </div>
    </form>
  );
}
