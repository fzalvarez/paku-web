"use client";

import { useState, useEffect, useCallback } from "react";
import type { OrderOut } from "@/types/orders";
import { ordersService } from "@/lib/api/orders";
import { ApiCallError } from "@/lib/api/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface UseOrdersReturn {
  orders: OrderOut[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrders(): UseOrdersReturn {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<OrderOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ordersService.list();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof ApiCallError && err.status === 404) {
        setOrders([]);
      } else {
        setError(err instanceof Error ? err.message : "Error al cargar las órdenes");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchOrders();
    else setOrders([]);
  }, [user, fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}
