"use client";

import { useState, useEffect, useCallback } from "react";
import { petsService } from "@/lib/api/pets";
import { useAuthContext } from "@/contexts/AuthContext";
import type { Pet, CreatePetRequest, UpdatePetRequest } from "@/types/pets";

interface UsePetsResult {
  pets: Pet[];
  loading: boolean;
  mutating: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createPet: (data: CreatePetRequest) => Promise<Pet>;
  updatePet: (id: string, data: UpdatePetRequest) => Promise<Pet>;
  deletePet: (id: string) => Promise<void>;
}

/**
 * Hook que carga y gestiona las mascotas del usuario autenticado.
 */
export function usePets(): UsePetsResult {
  const { isAuthenticated } = useAuthContext();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
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

  const createPet = useCallback(
    async (data: CreatePetRequest): Promise<Pet> => {
      setMutating(true);
      setError(null);
      try {
        const pet = await petsService.create(data);
        setPets((prev) => [...prev, pet]);
        return pet;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al crear la mascota"
        );
        throw err;
      } finally {
        setMutating(false);
      }
    },
    []
  );

  const updatePet = useCallback(
    async (id: string, data: UpdatePetRequest): Promise<Pet> => {
      setMutating(true);
      setError(null);
      try {
        const pet = await petsService.update(id, data);
        setPets((prev) => prev.map((p) => (p.id === id ? pet : p)));
        return pet;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al actualizar la mascota"
        );
        throw err;
      } finally {
        setMutating(false);
      }
    },
    []
  );

  const deletePet = useCallback(
    async (id: string): Promise<void> => {
      setMutating(true);
      setError(null);
      try {
        await petsService.delete(id);
        setPets((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al eliminar la mascota"
        );
        throw err;
      } finally {
        setMutating(false);
      }
    },
    []
  );

  return {
    pets,
    loading,
    mutating,
    error,
    reload: load,
    createPet,
    updatePet,
    deletePet,
  };
}
