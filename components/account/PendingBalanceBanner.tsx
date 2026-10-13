import Link from "next/link";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PendingBalanceOut } from "@/types/orders";
import { cn } from "@/lib/utils";

/**
 * Aviso de saldo por diferencia de peso (C-24). El groomer pesó a la mascota y el servicio costaba
 * más que lo pagado; hasta pagar el saldo no se pueden pedir servicios nuevos.
 */
export function PendingBalanceBanner({
  balance,
  className,
}: {
  balance: PendingBalanceOut | null;
  className?: string;
}) {
  if (!balance || balance.amount <= 0 || balance.orders.length === 0) return null;
  // Se paga orden por orden; casi siempre hay una sola.
  const first = balance.orders[0];

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 sm:flex-row sm:items-center",
        className,
      )}
    >
      <Scale className="hidden size-5 shrink-0 text-orange-600 sm:block" />
      <div className="flex-1">
        <p className="text-sm font-bold text-orange-800">
          Tienes un saldo pendiente de S/ {balance.amount.toFixed(2)}
        </p>
        <p className="text-xs text-orange-800/80">
          Al pesar a tu mascota en el servicio, su peso real dio un precio mayor. Págalo para poder pedir tu
          próximo servicio.
        </p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href={`/account/orders/${first.id}`}>Pagar saldo</Link>
      </Button>
    </div>
  );
}
