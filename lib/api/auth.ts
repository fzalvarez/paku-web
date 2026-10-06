import { publicApiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  LoginEmailRequest,
  RegisterRequest,
  RegisterResponse,
  SocialLoginRequest,
  SocialLoginResponse,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types/auth";

/**
 * Algunas respuestas antiguas venían envueltas en `{ data }`; el backend actual
 * responde el objeto directo. Se aceptan ambas formas.
 */
function unwrap<T extends object>(res: T | { data: T }): T {
  return "data" in res && res.data ? (res.data as T) : (res as T);
}

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
    return unwrap(res);
  },

  /**
   * Registro con email + contraseña y datos personales.
   * POST /auth/register → UserResponse
   */
  register: async (data: RegisterRequest) => {
    const res = await publicApiClient.post<RegisterResponse | { data: RegisterResponse }>(ENDPOINTS.AUTH.REGISTER, data);
    return unwrap(res);
  },

  /**
   * Login / registro social vía Firebase ID Token.
   * POST /auth/social → AuthTokens + is_new_user flag
   */
  socialLogin: async (data: SocialLoginRequest) => {
    const res = await publicApiClient.post<SocialLoginResponse | { data: SocialLoginResponse }>(ENDPOINTS.AUTH.SOCIAL, data);
    return unwrap(res);
  },

  /**
   * Solicita un email de recuperación de contraseña.
   * POST /auth/forgot-password → 200 (siempre, no revela si el email existe)
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await publicApiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  },

  /**
   * Restablece la contraseña usando el token recibido por email.
   * POST /auth/reset-password → 204
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await publicApiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },
};
