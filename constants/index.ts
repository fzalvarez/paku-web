/**
 * Constantes globales de la aplicación.
 */

export const SITE_CONFIG = {
  name: "Paku",
  description: "Paku es el servicio de grooming móvil más moderno del Perú. Agenda en segundos, sigue el proceso en tiempo real y recibe a tu mascota en la puerta de tu hogar.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://paku.com.pe",
} as const;

/** Enlaces de las apps. TODO: reemplazar "#" cuando las apps estén publicadas. */
export const APP_STORE_LINKS = {
  googlePlay: "#",
  appStore: "#",
} as const;

/** Canales de contacto (mismos datos que el footer y /contacto). */
export const CONTACT = {
  whatsappUrl: "https://wa.me/51993019869",
  whatsappBookingUrl:
    "https://wa.me/51993019869?text=Hola%20Paku%2C%20quiero%20agendar%20un%20ba%C3%B1o%20para%20mi%20mascota",
} as const;

export * from "./routes";
