/**
 * Constantes globales de la aplicación.
 */

export const SITE_CONFIG = {
  name: "Paku",
  description: "Paku es el servicio de grooming móvil más moderno del Perú. Agenda en segundos, sigue el proceso en tiempo real y recibe a tu mascota en la puerta de tu hogar.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://paku.com.pe",
} as const;

export * from "./routes";
