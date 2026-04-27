"use client";

import { useState, useEffect, useCallback } from "react";
import { geoService } from "@/lib/api/geo";
import type { District } from "@/types/geo.types";

export type DistrictsHookState = {
  districts: District[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useDistricts(): DistrictsHookState {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await geoService.getDistricts();
      // Solo distritos activos, ordenados alfabéticamente
      const active = data
        .filter((d) => d.active)
        .sort((a, b) => a.name.localeCompare(b.name));
      setDistricts(active);
    } catch {
      setError("Error al cargar distritos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { districts, loading, error, refresh };
}
