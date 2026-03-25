"use client";

import { useState, useEffect, useCallback } from "react";
import { petsService } from "@/lib/api/pets";
import { useAuthContext } from "@/contexts/AuthContext";
import type { Pet } from "@/types/pets";

interface UsePetsResult {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Hook que carga las mascotas del usuario autenticado.
 * Si el usuario no está logueado, retorna lista vacía sin llamar a la API.
 */
export function usePets(): UsePetsResult {
  const { isAuthenticated } = useAuthContext();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setPets([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await petsService.list();
      setPets(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar las mascotas.");
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  return { pets, loading, error, reload: load };
}
