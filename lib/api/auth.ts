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
  login: (data: LoginEmailRequest) =>
    publicApiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, data),

  /**
   * Registro con email + contraseña y datos personales.
   * POST /auth/register → UserResponse
   */
  register: (data: RegisterRequest) =>
    publicApiClient.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, data),

  /**
   * Login / registro social vía Firebase ID Token.
   * POST /auth/social → AuthTokens + is_new_user flag
   */
  socialLogin: (data: SocialLoginRequest) =>
    publicApiClient.post<SocialLoginResponse>(ENDPOINTS.AUTH.SOCIAL, data),
};
