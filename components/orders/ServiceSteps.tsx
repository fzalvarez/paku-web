"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICE_STEPS, SERVICE_STEP_LABELS } from "@/lib/labels";
import { timeLima } from "@/lib/utils/dates";
import type { OrderOut } from "@/types/orders";

/**
 * Pasos del servicio en la van (C-11): Recepción y recojo → Baño → Secado →
 * Corte y acabado → Devolución a casa. Solo si la orden registró pasos
 * (las anteriores a C-11 no tienen log).
 */
export function ServiceSteps({ order }: { order: OrderOut }) {
  const log = order.service_steps_log ?? [];
  if (log.length === 0 || (order.status !== "in_service" && order.status !== "done")) return null;

  const finished = order.status === "done";
  const currentIdx = finished ? SERVICE_STEPS.length : SERVICE_STEPS.indexOf(order.service_step as (typeof SERVICE_STEPS)[number]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Avance del servicio
      </p>
      <ol className="space-y-2.5">
        {SERVICE_STEPS.map((step, idx) => {
          const startedAt = log.find((e) => e.step === step)?.started_at;
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <li key={step} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  isDone && "bg-primary text-primary-foreground",
                  isCurrent && "bg-purple-100 text-purple-700 ring-4 ring-purple-100/60",
                  !isDone && !isCurrent && "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="size-4" />
                ) : isCurrent ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Circle className="size-3" />
                )}
              </span>
              <span
                className={cn(
                  "flex-1 text-sm",
                  isCurrent ? "font-bold text-purple-700" : isDone ? "font-semibold" : "text-muted-foreground",
                )}
              >
                {SERVICE_STEP_LABELS[step]}
                {isCurrent && <span className="ml-2 text-xs font-semibold">· en curso</span>}
              </span>
              {startedAt && (isDone || isCurrent) && (
                <span className="text-xs tabular-nums text-muted-foreground">{timeLima(startedAt)}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
