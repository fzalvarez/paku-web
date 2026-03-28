"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  CartWithItemsOut,
  CartValidateOut,
  CartCheckoutOut,
  AddCartItemsIn,
  ReplaceCartItemsIn,
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
  total: number;
  refetch: () => Promise<void>;
  addItems: (data: AddCartItemsIn) => Promise<CartWithItemsOut>;
  replaceItems: (data: ReplaceCartItemsIn) => Promise<CartWithItemsOut>;
  removeItem: (itemId: string) => Promise<void>;
  validate: () => Promise<CartValidateOut>;
  checkout: () => Promise<CartCheckoutOut>;
  clearCart: () => void;
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

  const addItems = useCallback(async (data: AddCartItemsIn): Promise<CartWithItemsOut> => {
    setMutating(true);
    setError(null);
    try {
      const updated = await cartService.addItems(data);
      setCart(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar items");
      throw err;
    } finally {
      setMutating(false);
    }
  }, []);

  const replaceItems = useCallback(async (data: ReplaceCartItemsIn): Promise<CartWithItemsOut> => {
    if (!cart?.cart.id) throw new Error("No hay carrito activo");
    setMutating(true);
    setError(null);
    try {
      const updated = await cartService.replaceItems(cart.cart.id, data);
      setCart(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar items");
      throw err;
    } finally {
      setMutating(false);
    }
  }, [cart]);

  const removeItem = useCallback(async (itemId: string): Promise<void> => {
    if (!cart?.cart.id) return;
    setMutating(true);
    setError(null);
    try {
      const updated = await cartService.removeItem(cart.cart.id, itemId);
      setCart(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar item");
      throw err;
    } finally {
      setMutating(false);
    }
  }, [cart]);

  const validate = useCallback(async (): Promise<CartValidateOut> => {
    if (!cart?.cart.id) throw new Error("No hay carrito activo");
    setMutating(true);
    setError(null);
    try {
      return await cartService.validate(cart.cart.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al validar el carrito");
      throw err;
    } finally {
      setMutating(false);
    }
  }, [cart]);

  const checkout = useCallback(async (): Promise<CartCheckoutOut> => {
    if (!cart?.cart.id) throw new Error("No hay carrito activo");
    setMutating(true);
    setError(null);
    try {
      const result = await cartService.checkout(cart.cart.id);
      setCart((prev) =>
        prev ? { ...prev, cart: { ...prev.cart, status: "checked_out" } } : null
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en el checkout");
      throw err;
    } finally {
      setMutating(false);
    }
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart(null);
    hasFetched.current = false;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const totalItems = cart?.items.reduce((acc: number, item) => acc + item.qty, 0) ?? 0;
  const total = cart?.items.reduce((acc: number, item) => acc + item.qty * item.unit_price, 0) ?? 0;

  return {
    cart,
    loading,
    mutating,
    error,
    totalItems,
    total,
    refetch: fetchCart,
    addItems,
    replaceItems,
    removeItem,
    validate,
    checkout,
    clearCart,
    clearError,
  };
}
