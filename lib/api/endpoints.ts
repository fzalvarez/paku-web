/**
 * Endpoints de la API — alineados con flujo-compra-servicio.md
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
    CATEGORY_PRODUCTS: (slug: string) => `/store/categories/${slug}/products`,
    PRODUCT: (id: string) => `/store/products/${id}`,
    QUOTE: "/store/quote",
  },
  GEO: {
    DISTRICTS: "/geo/districts",
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
    ACTIVE: "/cart",
    ITEMS: "/cart/items",
    DETAIL: (id: string) => `/cart/${id}`,
    CART_ITEMS: (id: string) => `/cart/${id}/items`,
    ITEM: (cartId: string, itemId: string) => `/cart/${cartId}/items/${itemId}`,
    VALIDATE: (id: string) => `/cart/${id}/validate`,
    CHECKOUT: (id: string) => `/cart/${id}/checkout`,
  },
  ORDERS: {
    LIST: "/orders",
    CREATE: "/orders",
    DETAIL: (id: string) => `/orders/${id}`,
  },
  BOOKING: {
    AVAILABILITY: "/availability",
    HOLDS: "/holds",
    HOLD_CONFIRM: (id: string) => `/holds/${id}/confirm`,
    HOLD_CANCEL: (id: string) => `/holds/${id}/cancel`,
  },
} as const;
