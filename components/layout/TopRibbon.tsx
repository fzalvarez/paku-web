"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Rutas donde el listón distrae (el usuario ya está reservando o en su cuenta). */
const HIDDEN_ON = [ROUTES.BOOKING, "/account"];

/** Listón azul sobre el header con la promesa de Paku y acceso directo a reservar. */
export function TopRibbon() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="bg-linear-to-r from-primary via-secondary to-primary px-4 py-2 text-white">
      <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs font-semibold sm:text-sm">
        <span aria-hidden="true">🚐✨</span>
        <span>¡Cero estrés! Llevamos el spa a la puerta de tu casa</span>
        <span className="hidden font-normal text-white/80 md:inline">· Síguelo en vivo desde la web</span>
        <Link
          href={ROUTES.BOOKING}
          className="ml-1 inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-primary shadow-xs transition-transform hover:scale-105"
        >
          ¡Agenda aquí!
        </Link>
      </p>
    </div>
  );
}
