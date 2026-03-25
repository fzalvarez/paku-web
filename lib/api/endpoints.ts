/**
 * Endpoints de la API — https://paku.dev-qa.site/paku/api/v1
 */
export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    SOCIAL: "/auth/social",
    REFRESH: "/auth/refresh",
  },
  USERS: {
    ME: "/users/me",
  },
  PETS: {
    LIST: "/pets",
    DETAIL: (id: string) => `/pets/${id}`,
  },
} as const;
