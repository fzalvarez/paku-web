"use client";

import { CircleUserRound, Plus } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-primary">
          Mis órdenes
        </h1>
        <p className="mt-1 text-sm md:text-md lg:text-lg text-foreground">
          Consulta el historial y el estado de tus servicios y pedidos.
        </p>
      </div>

      {/* Estado vacío */}
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-muted/30 px-6 py-16 text-center shadow-[0px_4px_12px_5px_rgba(0,_0,_0,_0.1)]">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/25">
          <CircleUserRound className="size-7.5 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-md lg:text-lg font-extrabold tracking-tight text-primary">
            Aún no tienes órdenes registradas
          </p>
          <p className="text-sm lg:text-lg text-primary">
            Aquí podrás consultar tus servicios agendados, pedidos y su
            seguimiento.
          </p>
        </div>
        <div className="flex flex-row items-center gap-2 rounded-lg border-2 border-primary/20 px-6 py-2 text-sm md:text-md text-primary/50">
          <Plus className="size-3.5 shrink-0 hidden md:inline" />
          El historial de órdenes estará disponible próximamente
        </div>
      </div>
    </div>
  );
}
