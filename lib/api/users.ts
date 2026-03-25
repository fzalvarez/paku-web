import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { UserProfile } from "@/types/auth";

/**
 * Servicios del dominio de usuarios.
 * El cliente devuelve directamente T (sin wrapper { data }).
 */
export const usersService = {
  /**
   * Devuelve el perfil del usuario autenticado.
   * GET /users/me → UserProfile
   */
  getMe: () => apiClient.get<UserProfile>(ENDPOINTS.USERS.ME),
};
