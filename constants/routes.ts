/**
 * Rutas de la aplicación.
 * Centraliza todas las rutas para evitar strings duplicados.
 */
export const ROUTES = {
  HOME: "/",
  BLOG: "/blog",
  BOOKING: "/booking",
  PAKU_SPA: "/paku-spa",
  MIS_PEDIDOS: "/mis-pedidos",
  MIS_PEDIDOS_DETALLE: (id: string) => `/mis-pedidos/${id}`,
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
