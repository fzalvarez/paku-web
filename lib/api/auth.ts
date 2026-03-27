import { publicApiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  LoginEmailRequest,
  RegisterRequest,
  RegisterResponse,
  SocialLoginRequest,
  SocialLoginResponse,
  LoginResponse,
} from "@/types/auth";

/**
 * Servicios de autenticación.
 * Todos los endpoints son públicos (no requieren token previo).
 */
export const authService = {
  /**
   * Login con email + contraseña.
   * POST /auth/login → access_token, refresh_token
   */
  login: async (data: LoginEmailRequest) => {
    const res = await publicApiClient.post<LoginResponse | { data: LoginResponse }>(ENDPOINTS.AUTH.LOGIN, data);
    return (res as any).data ?? res;
  },

  /**
   * Registro con email + contraseña y datos personales.
   * POST /auth/register → UserResponse
   */
  register: async (data: RegisterRequest) => {
    const res = await publicApiClient.post<RegisterResponse | { data: RegisterResponse }>(ENDPOINTS.AUTH.REGISTER, data);
    return (res as any).data ?? res;
  },

  /**
   * Login / registro social vía Firebase ID Token.
   * POST /auth/social → AuthTokens + is_new_user flag
   */
  socialLogin: async (data: SocialLoginRequest) => {
    const res = await publicApiClient.post<SocialLoginResponse | { data: SocialLoginResponse }>(ENDPOINTS.AUTH.SOCIAL, data);
    return (res as any).data ?? res;
  },
};
