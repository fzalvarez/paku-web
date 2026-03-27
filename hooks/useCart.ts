"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  CartWithItemsOut,
  AddCartItemIn,
  UpdateCartItemIn,
  CheckoutIn,
  CheckoutOut,
} from "@/types/cart";
import { cartService } from "@/lib/api/cart";
import { ApiCallError } from "@/lib/api/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface UseCartReturn {
  cart: CartWithItemsOut | null;
  loading: boolean;
  mutating: boolean;
  error: string | null;
  totalItems: number;
  refetch: () => Promise<void>;
  addItem: (data: AddCartItemIn) => Promise<void>;
  updateItem: (itemId: string, data: UpdateCartItemIn) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: (data: CheckoutIn) => Promise<CheckoutOut>;
  clearError: () => void;
}

export function useCart(): UseCartReturn {
  const { user } = useAuthContext();
  const [cart, setCart] = useState<CartWithItemsOut | null>(null);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getActive();
      setCart(data);
    } catch (err) {
      if (err instanceof ApiCallError && err.status === 404) {
        // No hay carrito activo — es un estado válido
        setCart(null);
      } else {
        setError(err instanceof Error ? err.message : "Error al cargar el carrito");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar carrito cuando el usuario cambia
  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      fetchCart();
    }
    if (!user) {
      hasFetched.current = false;
      setCart(null);
      setError(null);
    }
  }, [user, fetchCart]);

  const addItem = useCallback(async (data: AddCartItemIn) => {
    setMutating(true);
    setError(null);
    try {
      const updated = await cartService.addItem(data);
      setCart(updated);
    } catch (err) {
      if (err instanceof ApiCallError && err.status === 409) {
        // Carrito expirado u otro conflicto → refetch
        await fetchCart();
      }
      setError(err instanceof Error ? err.message : "Error al agregar el ítem");
      throw err;
    } finally {
      setMutating(false);
    }
  }, [fetchCart]);

  const updateItem = useCallback(async (itemId: string, data: UpdateCartItemIn) => {
    setMutating(true);
    setError(null);
    try {
      const updated = await cartService.updateItem(itemId, data);
      setCart(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el ítem");
      throw err;
    } finally {
      setMutating(false);
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setMutating(true);
    setError(null);
    try {
      const updated = await cartService.removeItem(itemId);
      setCart(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el ítem");
      throw err;
    } finally {
      setMutating(false);
    }
  }, []);

  const checkout = useCallback(async (data: CheckoutIn): Promise<CheckoutOut> => {
    setMutating(true);
    setError(null);
    try {
      const result = await cartService.checkout(data);
      // Limpiar carrito local tras checkout exitoso
      setCart(null);
      hasFetched.current = false;
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en el checkout");
      throw err;
    } finally {
      setMutating(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const totalItems =
    cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;

  return {
    cart,
    loading,
    mutating,
    error,
    totalItems,
    refetch: fetchCart,
    addItem,
    updateItem,
    removeItem,
    checkout,
    clearError,
  };
}
