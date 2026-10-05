import type { RequestOptions } from "@/types/api";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "@/lib/session";
import { ENDPOINTS } from "./endpoints";
import { parseApiErrorBody } from "./errors";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/$/, "");

// ── Error tipado ──────────────────────────────────────────────────────────────

/**
 * `message` ya viene en español (lib/api/errors.ts). `code` sirve para decidir
 * qué hacer (ej. HOLD_EXPIRED → volver a elegir fecha) y `detail` conserva el
 * cuerpo original para los datos extra (ej. PRICE_CHANGED trae items y total).
 */
export class ApiCallError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public detail?: unknown
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
  const { code, message } = parseApiErrorBody(body, status);
  return new ApiCallError(status, code, message, body?.detail);
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
