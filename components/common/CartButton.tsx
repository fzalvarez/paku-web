"use client";

import { useRef, useEffect } from "react";
import {
  ShoppingCart,
  X,
  Trash2,
  Loader2,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import type { CartItemOut } from "@/types/cart";
import { cn } from "@/lib/utils";

// ── Formateador de precio ──────────────────────────────────────────────────────
function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);
}

// ── Ítem del carrito ──────────────────────────────────────────────────────────
interface CartItemRowProps {
  item: CartItemOut;
  mutating: boolean;
  onRemove: (itemId: string) => void;
}

function CartItemRow({ item, mutating, onRemove }: CartItemRowProps) {
  const isAddon = item.kind === "service_addon";
  const subtotal = item.qty * item.unit_price;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl p-3 transition-colors",
        isAddon
          ? "ml-4 border-l-2 border-secondary/30 bg-secondary/5"
          : "bg-muted/40"
      )}
    >
      {/* Icono tipo */}
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
          isAddon
            ? "bg-secondary/15 text-secondary"
            : "bg-primary/10 text-primary"
        )}
      >
        {isAddon ? "+" : <ShoppingCart className="size-4" />}
      </span>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatPrice(item.unit_price)} c/u · Cant: {item.qty}
        </p>
        {item.meta?.scheduled_date && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            📅 {item.meta.scheduled_date}
            {item.meta.scheduled_time ? ` · ${item.meta.scheduled_time}` : ""}
          </p>
        )}
      </div>

      {/* Subtotal + eliminar */}
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-sm font-bold text-foreground">
          {formatPrice(subtotal)}
        </span>
        <button
          disabled={mutating}
          onClick={() => onRemove(item.id)}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
          aria-label="Eliminar ítem"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── CartButton principal ───────────────────────────────────────────────────────
interface CartButtonProps {
  /** Callback para ir al checkout (puede ser router.push o link) */
  onCheckout?: () => void;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CartButton({ onCheckout, open, onOpenChange }: CartButtonProps) {
  const { cart, loading, mutating, totalItems, total, removeItem } = useCart();

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Cerrar con Escape o clic fuera
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }

    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        triggerRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, onOpenChange]);

  // Separar servicios base de addons
  const baseItems = cart?.items.filter((i) => i.kind === "service_base" || i.kind === "product") ?? [];
  const addonItems = cart?.items.filter((i) => i.kind === "service_addon") ?? [];

  // Lista ordenada: cada servicio seguido de sus addons (por base_service_id)
  const orderedItems: CartItemOut[] = [];
  for (const base of baseItems) {
    orderedItems.push(base);
    orderedItems.push(...addonItems.filter((a) => a.meta?.base_service_id === base.ref_id));
  }
  // Addons sin base asociada (caso borde)
  orderedItems.push(
    ...addonItems.filter(
      (a) => !baseItems.some((b) => b.ref_id === a.meta?.base_service_id)
    )
  );

  return (
    <div className="relative">
      {/* ── Trigger ── */}
      <button
        ref={triggerRef}
        onClick={() => onOpenChange(!open)}
        aria-label="Abrir carrito"
        aria-expanded={open}
        className={cn(
          "relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold shadow-sm transition-all",
          "border-border bg-background text-foreground",
          "hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          open && "border-primary/40 shadow-md"
        )}
      >
        {/* Spinner mientras carga */}
        {loading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <ShoppingCart className="size-4" />
        )}

        {/* Badge de cantidad */}
        {totalItems > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white tabular-nums">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}

        {/* Total estimado (solo si hay items) */}
        {total > 0 && (
          <span className="hidden text-xs font-bold text-primary sm:inline">
            {formatPrice(total)}
          </span>
        )}
      </button>

      {/* ── Panel del carrito ── */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Carrito de compras"
          className={cn(
            "absolute right-0 top-full z-50 mt-2",
            "w-[min(96vw,22rem)]",
            "overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl",
            "animate-in fade-in-0 slide-in-from-top-2 duration-200"
          )}
        >
          {/* Cabecera del panel */}
          <div className="relative flex items-center justify-between overflow-hidden bg-linear-to-br from-primary/10 via-secondary/5 to-tertiary/10 px-4 py-3">
            <div className="absolute -right-4 -top-4 size-16 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 size-12 rounded-full bg-secondary/10 blur-xl" />
            <div className="relative flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <ShoppingCart className="size-4" />
              </span>
              <div>
                <p className="text-sm font-extrabold tracking-tight text-foreground">
                  Mi carrito
                </p>
                {totalItems > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="relative flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Cerrar carrito"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Contenido */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              /* Skeleton de carga */
              <div className="flex flex-col gap-2 p-3">
                {[1, 2].map((n) => (
                  <div key={n} className="flex gap-3 rounded-xl bg-muted/40 p-3">
                    <div className="size-8 animate-pulse rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : orderedItems.length === 0 ? (
              /* Estado vacío */
              <div className="flex flex-col items-center gap-3 px-4 py-10">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                  <PackageOpen className="size-7" />
                </span>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">
                    Tu carrito está vacío
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Explora nuestros servicios y agrega lo que necesitas
                  </p>
                </div>
              </div>
            ) : (
              /* Lista de ítems */
              <div className="flex flex-col gap-2 p-3">
                {orderedItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    mutating={mutating}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer con total + botón checkout */}
          {cart && orderedItems.length > 0 && (
            <div className="border-t border-border/60 bg-background p-3">
              {/* Desglose por servicio base */}
              <div className="mb-3 space-y-1">
                {baseItems.map((base) => {
                  const addons = addonItems.filter(
                    (a) => a.meta?.base_service_id === base.ref_id
                  );
                  const addonSubtotal = addons.reduce(
                    (s, a) => s + a.qty * a.unit_price,
                    0
                  );
                  return (
                    <div key={base.id} className="flex justify-between text-xs text-muted-foreground">
                      <span className="truncate pr-2">
                        {base.name}
                        {addons.length > 0 && ` + ${addons.length} extra`}
                      </span>
                      <span className="shrink-0 font-medium">
                        {formatPrice(base.qty * base.unit_price + addonSubtotal)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="mb-3 flex items-baseline justify-between border-t border-dashed border-border pt-2">
                <span className="text-sm font-bold text-foreground">Total estimado</span>
                <span className="text-base font-extrabold text-primary">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Botón checkout */}
              <Button
                className="w-full gap-2 rounded-xl font-bold shadow-sm"
                onClick={() => {
                  onOpenChange(false);
                  onCheckout?.();
                }}
                disabled={mutating || !onCheckout}
              >
                {mutating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShoppingCart className="size-4" />
                )}
                Ir al checkout
              </Button>

              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Los precios pueden variar según la dirección de entrega
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
