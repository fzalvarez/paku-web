import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { UserProfile } from "@/types/auth";

export interface UpdateMeRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  sex?: "male" | "female";
  birth_date?: string;
  dni?: string;
}

export interface SetPasswordRequest {
  current_password?: string;
  new_password: string;
}

export interface CompleteProfileRequest {
  first_name: string;
  last_name: string;
  phone: string;
  sex: "male" | "female";
  birth_date: string;
  dni: string;
}

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

  /** PUT /users/me → actualizar perfil */
  updateMe: (data: UpdateMeRequest) =>
    apiClient.put<UserProfile>(ENDPOINTS.USERS.ME, data),

  /** PUT /users/me/password → cambiar contraseña */
  setPassword: (data: SetPasswordRequest) =>
    apiClient.put<void>(`${ENDPOINTS.USERS.ME}/password`, data),

  /** PUT /users/me/complete → completar perfil (usuarios OAuth) */
  completeProfile: (data: CompleteProfileRequest) =>
    apiClient.put<UserProfile>(`${ENDPOINTS.USERS.ME}/complete`, data),
};
