import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { orderStatusInfo } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { formatDay, orderDay } from "@/lib/pet-insights";
import type { OrderOut } from "@/types/orders";
import { PanelCard } from "./PanelCard";

export function HistoryCard({ orders }: { orders: OrderOut[] }) {
  return (
    <PanelCard icon={Clock} title="Su historia en Paku">
      {orders.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {orders.map((order) => {
            const base = order.items_snapshot.find((i) => i.kind === "service_base");
            const status = orderStatusInfo(order.status);
            return (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{base?.name ?? "Servicio"}</p>
                    <p className="text-xs text-muted-foreground first-letter:uppercase">
                      {formatDay(orderDay(order), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <Badge size="md" className={cn("shrink-0", status.bgColor, status.color)}>
                    {status.label}
                  </Badge>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Todavía no tiene servicios con Paku.</p>
      )}
    </PanelCard>
  );
}
