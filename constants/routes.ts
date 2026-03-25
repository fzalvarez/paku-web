/**
 * Rutas de la aplicación.
 * Centraliza todas las rutas para evitar strings duplicados.
 */
export const ROUTES = {
  HOME: "/",
  POLITICAS: {
    TERMINOS: "/politicas/terminos-y-condiciones",
    PRIVACIDAD: "/politicas/privacidad",
  },
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
