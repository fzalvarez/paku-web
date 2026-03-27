import type { RequestOptions } from "@/types/api";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "@/lib/session";
import { ENDPOINTS } from "./endpoints";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Error tipado ──────────────────────────────────────────────────────────────

export class ApiCallError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiCallError";
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function parseApiError(body: Record<string, unknown>, status: number): ApiCallError {
  const detail = body?.detail;

  if (!detail) return new ApiCallError(status, "API_ERROR", "Error desconocido");

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as Record<string, unknown>;
    return new ApiCallError(
      status,
      String(first?.code ?? "VALIDATION_ERROR"),
      String(first?.msg ?? first)
    );
  }

  if (typeof detail === "object" && detail !== null) {
    const d = detail as Record<string, unknown>;
    return new ApiCallError(
      status,
      String(d.code ?? "API_ERROR"),
      String(d.message ?? d.detail ?? "Error")
    );
  }

  return new ApiCallError(status, String(detail), String(detail));
}

// ── Refresh token ─────────────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    saveTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

// ── Request base ──────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  { params, ...options }: RequestOptions = {},
  skipAuth = false
): Promise<T> {
  const queryString = params ? buildQueryString(params) : "";
  const url = `${BASE_URL}${path}${queryString}`;

  const token = skipAuth ? undefined : getAccessToken();

  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  });

  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response = await fetch(url, { ...options, headers });

  // Intento de refresh si recibimos 401
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(url, { ...options, headers });
    } else {
      // Sin token válido → emitir evento y limpiar sesión
      if (typeof window !== "undefined") {
        clearTokens();
        window.dispatchEvent(new Event("paku:session-expired"));
      }
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw parseApiError(body as Record<string, unknown>, response.status);
  }

  // 204 No Content u otras respuestas sin body
  if (response.status === 204) return undefined as unknown as T;

  return response.json() as Promise<T>;
}

// ── Cliente autenticado ───────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

// ── Cliente sin auth (endpoints públicos) ─────────────────────────────────────

export const publicApiClient = {
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body: JSON.stringify(body) }, true),
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }, true),
  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body: JSON.stringify(body) }, true),
  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body) }, true),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }, true),
};
