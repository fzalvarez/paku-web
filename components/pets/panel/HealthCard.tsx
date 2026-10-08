import type React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, CircleHelp, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckStatus, PreventiveItem } from "@/lib/pet-insights";
import { PanelCard } from "./PanelCard";

const STATUS_UI: Record<CheckStatus, { icon: React.ElementType; label: string; className: string }> = {
  ok: { icon: CheckCircle2, label: "Al día", className: "text-green-700" },
  pending: { icon: AlertCircle, label: "Pendiente", className: "text-amber-700" },
  unknown: { icon: CircleHelp, label: "Sin dato", className: "text-muted-foreground" },
};

export function HealthCard({ items }: { items: PreventiveItem[] }) {
  return (
    <PanelCard icon={HeartPulse} title="Salud preventiva">
      <ul className="flex flex-col divide-y divide-border/60">
        {items.map((item) => {
          const ui = STATUS_UI[item.status];
          return (
            <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <ui.icon className={cn("mt-0.5 size-5 shrink-0", ui.className)} aria-hidden="true" />
              <div className="flex-1">
                <p className="flex flex-wrap items-center gap-x-2 text-sm font-bold text-foreground">
                  {item.label}
                  <span className={cn("text-xs font-semibold", ui.className)}>{ui.label}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.detail}{" "}
                  {item.articleSlug && (
                    <Link href={`/blog/${item.articleSlug}`} className="font-semibold text-primary underline">
                      Leer más
                    </Link>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </PanelCard>
  );
}
