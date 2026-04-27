import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { District } from "@/types/geo.types";

/**
 * Servicio de geografía.
 * Endpoint público — no requiere autenticación.
 */
export const geoService = {
  /** GET /geo/districts — Obtiene todos los distritos */
  getDistricts: (): Promise<District[]> =>
    apiClient.get<District[]>(ENDPOINTS.GEO.DISTRICTS),
};
