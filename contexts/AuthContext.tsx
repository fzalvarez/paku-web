"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { usersService } from "@/lib/api/users";
import { authService } from "@/lib/api/auth";
import { signInWithGoogle as firebaseSignInWithGoogle } from "@/lib/auth";
import { saveTokens, clearTokens } from "@/lib/session";
import { ApiCallError } from "@/lib/api/client";
import type { UserProfile, LoginEmailRequest, RegisterRequest } from "@/types/auth";

// ── Tipos del contexto ────────────────────────────────────────────────────────

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (data: LoginEmailRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: () => Promise<{ isNewUser: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

// ── Contexto ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar (si hay token en cookie)
  const fetchUser = useCallback(async () => {
    try {
      const profile = await usersService.getMe();
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const profile = await usersService.getMe();
        if (!cancelled) setUser(profile);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Escuchar evento de sesión expirada del apiClient
  useEffect(() => {
    const handler = () => {
      setUser(null);
    };
    window.addEventListener("paku:session-expired", handler);
    return () => window.removeEventListener("paku:session-expired", handler);
  }, []);

  // ── Acciones ───────────────────────────────────────────────────────────────

  const login = useCallback(async (data: LoginEmailRequest) => {
    const tokens = await authService.login(data);
    saveTokens(tokens.access_token, tokens.refresh_token);
    await fetchUser();
  }, [fetchUser]);

  const register = useCallback(async (data: RegisterRequest) => {
    // El registro no devuelve tokens — se hace login automático después
    await authService.register(data);
    await login({ email: data.email, password: data.password });
  }, [login]);

  const loginWithGoogle = useCallback(async () => {
    const result = await firebaseSignInWithGoogle();
    saveTokens(result.access_token, result.refresh_token);
    if (result.user) {
      setUser(result.user);
    } else {
      await fetchUser();
    }
    return { isNewUser: result.is_new_user };
  }, [fetchUser]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push("/");
  }, [router]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within <AuthProvider>");
  }
  return ctx;
}

/** Re-export tipado de ApiCallError para uso en componentes */
export { ApiCallError };
