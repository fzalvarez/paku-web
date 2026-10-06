"use client";

import { useState, useEffect, useCallback } from "react";
import type { CartWithItemsOut } from "@/types/cart";
import { cartService } from "@/lib/api/cart";
import { ApiCallError } from "@/lib/api/client";
import { useAuthContext } from "@/contexts/AuthContext";

/** Evento que emite el asistente de reserva cuando arma o cierra el carrito. */
export const CART_UPDATED_EVENT = "paku:cart-updated";

export function notifyCartUpdated() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

interface UseCartReturn {
  cart: CartWithItemsOut | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
  total: number;
  refetch: () => Promise<void>;
}

/**
 * Carrito activo del usuario (GET /cart), solo lectura. El carrito se arma en
 * el asistente de reserva (StepReviewCart), que avisa con CART_UPDATED_EVENT.
 */
export function useCart(): UseCartReturn {
  const { user } = useAuthContext();
  const [cart, setCart] = useState<CartWithItemsOut | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setCart(await cartService.getActive());
    } catch (err) {
      if (err instanceof ApiCallError && (err.status === 404 || err.status === 422)) {
        setCart(null);
      } else {
        setError(err instanceof Error ? err.message : "Error al cargar el carrito");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const onUpdated = () => { fetchCart(); };
    window.addEventListener(CART_UPDATED_EVENT, onUpdated);
    // Primera carga al iniciar sesión
    const initial = setTimeout(onUpdated, 0);
    return () => {
      clearTimeout(initial);
      window.removeEventListener(CART_UPDATED_EVENT, onUpdated);
    };
  }, [user, fetchCart]);

  // Sin sesión no hay carrito (se oculta el anterior sin tocar el estado en un efecto)
  const visibleCart = user ? cart : null;
  const items = visibleCart?.items ?? [];
  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);
  // Suma de los precios de línea que calculó el backend (mismo cálculo que /cart/{id}/validate)
  const total = items.reduce((acc, item) => acc + item.qty * item.unit_price, 0);

  return {
    cart: visibleCart,
    loading,
    error: user ? error : null,
    totalItems,
    total,
    refetch: fetchCart,
  };
}
