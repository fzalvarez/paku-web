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
  STORE: {
    CATEGORIES: "/store/categories",
    PRODUCTS: "/store/products",
    QUOTE: "/store/quote",
  },
  ADDRESSES: {
    LIST: "/addresses",
    CREATE: "/addresses",
    DETAIL: (id: string) => `/addresses/${id}`,
    UPDATE: (id: string) => `/addresses/${id}`,
    DELETE: (id: string) => `/addresses/${id}`,
    SET_DEFAULT: (id: string) => `/addresses/${id}/default`,
  },
  CATALOG: {
    BREEDS: "/catalog/breeds",
  },
  CART: {
    ACTIVE: "/cart/active",
    ITEMS: "/cart/items",
    ITEM: (itemId: string) => `/cart/items/${itemId}`,
    CHECKOUT: "/cart/checkout",
  },
  BOOKING: {
    AVAILABILITY: "/booking/availability",
    HOLDS: "/booking/holds",
    HOLD_CONFIRM: (id: string) => `/booking/holds/${id}/confirm`,
    HOLD_CANCEL: (id: string) => `/booking/holds/${id}/cancel`,
  },
} as const;
