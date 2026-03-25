/**
 * Constantes globales de la aplicación.
 */

export const SITE_CONFIG = {
  name: "Paku",
  description: "",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export * from "./routes";
