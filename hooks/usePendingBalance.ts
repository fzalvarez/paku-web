"use client";

import { useCallback, useEffect, useState } from "react";
import type { PendingBalanceOut } from "@/types/orders";
import { ordersService } from "@/lib/api/orders";
import { useAuthContext } from "@/contexts/AuthContext";

interface UsePendingBalanceReturn {
  /** null mientras carga, sin sesión o si falló la consulta (no bloquea nada en ese caso). */
  balance: PendingBalanceOut | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Saldo por diferencia de peso del cliente (GET /orders/pending-balance, C-24).
 * Con `balance.amount > 0` el backend no deja reservar ni crear órdenes (409 PENDING_BALANCE).
 * `reloadKey` vuelve a consultar cuando cambia (p. ej. la ruta, tras pagar).
 */
export function usePendingBalance(reloadKey?: string): UsePendingBalanceReturn {
  const { user } = useAuthContext();
  const [balance, setBalance] = useState<PendingBalanceOut | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!user) {
      setBalance(null);
      return;
    }
    setLoading(true);
    try {
      setBalance(await ordersService.pendingBalance());
    } catch {
      setBalance(null); // el backend igual valida al reservar; no bloquear por un error de consulta
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, reloadKey]);

  return { balance, loading, refetch: fetchBalance };
}
