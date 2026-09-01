import { redirect } from "next/navigation";

/**
 * "Mis órdenes" dentro de /account es la misma información que ya vive en
 * /mis-pedidos (con tracking, chat, etc. completos) — en vez de mantener
 * dos vistas del mismo listado, redirigimos a la real.
 */
export default function AccountOrdersPage() {
  redirect("/mis-pedidos");
}
