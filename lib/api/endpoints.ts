/**
 * Endpoints de la API — alineados con flujo-compra-servicio.md
 */
export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    SOCIAL: "/auth/social",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USERS: {
    ME: "/users/me",
  },
  PETS: {
    LIST: "/pets",
    DETAIL: (id: string) => `/pets/${id}`,
    RECORDS: (id: string) => `/pets/${id}/records`,
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
    PAY: (id: string) => `/orders/${id}/pay`,
    // Fallback — el flujo normal ya no los llama (ver lib/api/orders.ts
    // `pay()`), quedan por si soporte necesita corregir algo manualmente.
    CONFIRM_PAYMENT: (id: string) => `/orders/${id}/confirm-payment`,
    FAIL_PAYMENT: (id: string) => `/orders/${id}/fail-payment`,
    RETRY_PAYMENT: (id: string) => `/orders/${id}/retry-payment`,
    PHOTOS: (id: string) => `/orders/${id}/photos`,
    DELAY_REPORTS: (id: string) => `/orders/${id}/delay-reports`,
  },
  CHAT: {
    MESSAGES:     (orderId: string) => `/chat/orders/${orderId}/messages`,
    UNREAD_COUNT: (orderId: string) => `/chat/orders/${orderId}/unread-count`,
  },
  BOOKING: {
    AVAILABILITY: "/availability",
    HOLDS: "/holds",
    HOLD_CANCEL: (id: string) => `/holds/${id}/cancel`,
  },
  TRACKING: {
    CURRENT: (orderId: string) => `/tracking/orders/${orderId}/current`,
    ROUTE: (orderId: string) => `/tracking/orders/${orderId}/route`,
  },
  STREAMING: {
    SESSION: (orderId: string) => `/streaming/orders/${orderId}/session`,
  },
  WALLET: {
    CARDS: "/wallet/cards",
    CARD: (id: string) => `/wallet/cards/${id}`,
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    READ: (id: string) => `/notifications/${id}/read`,
  },
  MEDIA: {
    SIGNED_UPLOAD: "/media/signed-upload",
    CONFIRM_PHOTO: "/media/confirm-profile-photo",
  },
} as const;
