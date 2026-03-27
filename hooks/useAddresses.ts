"use client";

import { useState, useEffect, useCallback } from "react";
import { addressesService } from "@/lib/api/addresses";
import { ApiCallError } from "@/lib/api/client";
import type { AddressOut, AddressCreateIn, AddressUpdateIn } from "@/types/api";

export type AddressesHookState = {
  addresses: AddressOut[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (payload: AddressCreateIn) => Promise<void>;
  update: (id: string, payload: AddressUpdateIn) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
};

function parseError(err: unknown): string {
  if (err instanceof ApiCallError) {
    if (err.status === 409) return "No puedes eliminar la única dirección registrada.";
    if (err.status === 422) return "Distrito inválido o datos incorrectos. Revisa los campos.";
    if (err.status === 401) return "Tu sesión ha expirado. Vuelve a iniciar sesión.";
    return err.message ?? "Error inesperado.";
  }
  return "Error inesperado.";
}

export function useAddresses(): AddressesHookState {
  const [addresses, setAddresses] = useState<AddressOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await addressesService.list();
      setAddresses(data);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (payload: AddressCreateIn) => {
    const newAddr = await addressesService.create(payload);
    setAddresses((prev) => [...prev, newAddr]);
  }, []);

  const update = useCallback(async (id: string, payload: AddressUpdateIn) => {
    const updated = await addressesService.update(id, payload);
    setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await addressesService.delete(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const setDefault = useCallback(async (id: string) => {
    await addressesService.setDefault(id);
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id }))
    );
  }, []);

  return { addresses, loading, error, refresh, create, update, remove, setDefault };
}
