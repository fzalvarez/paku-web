/**
 * Tipos del dominio de autenticación.
 */

export type UserRole = "admin" | "user";
export type UserSex = "male" | "female";

// ── Requests ──────────────────────────────────────────────────────────────────

export interface LoginEmailRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone: string;
  first_name: string;
  last_name: string;
  sex: UserSex;
  birth_date: string; // ISO: "YYYY-MM-DD"
  role: UserRole;
  dni: string;
}

export interface SocialLoginRequest {
  id_token: string;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  profile_completed: boolean;
  phone: string | null;
  sex: UserSex | null;
  birth_date: string | null;
  dni: string | null;
  profile_photo_url: string | null;
}

/** Alias para compatibilidad con código anterior */
export type UserResponse = UserProfile;

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/** Respuesta del endpoint POST /auth/login */
export type LoginResponse = AuthTokens;

export interface SocialLoginResponse extends AuthTokens {
  is_new_user: boolean;
  user: UserProfile;
}

export type RegisterResponse = UserProfile;
