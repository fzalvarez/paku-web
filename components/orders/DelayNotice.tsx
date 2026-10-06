"use client";

import { Clock } from "lucide-react";
import { timeLima } from "@/lib/utils/dates";
import type { DelayReportOut, OrderStatus } from "@/types/orders";

// Solo mientras el especialista todavía no llega (C-14 / C-16)
const BEFORE_ARRIVAL: OrderStatus[] = ["created", "accepted", "on_the_way"];

/** Último aviso de demora del groomer. */
export function DelayNotice({ delays, status }: { delays: DelayReportOut[]; status: OrderStatus }) {
  if (delays.length === 0 || !BEFORE_ARRIVAL.includes(status)) return null;
  const latest = [...delays].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />
      <div>
        <p className="text-sm font-bold text-amber-800">
          Tu especialista llegará ~{latest.delay_minutes} min más tarde
        </p>
        {latest.note && <p className="mt-0.5 text-sm text-amber-800/80">{latest.note}</p>}
        <p className="mt-0.5 text-xs text-amber-700/70">Aviso de las {timeLima(latest.created_at)}</p>
      </div>
    </div>
  );
}
