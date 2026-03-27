/**
 * Rutas de la aplicación.
 * Centraliza todas las rutas para evitar strings duplicados.
 */
export const ROUTES = {
  HOME: "/",
  BLOG: "/blog",
  PAKU_SPA: "/paku-spa",
  ACCOUNT: {
    PROFILE: "/account/profile",
    PETS: "/account/pets",
    ADDRESSES: "/account/addresses",
    ORDERS: "/account/orders",
  },
  POLITICAS: {
    TERMINOS: "/politicas/terminos-y-condiciones",
    PRIVACIDAD: "/politicas/privacidad",
  },
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
