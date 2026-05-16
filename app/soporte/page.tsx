import { redirect } from "next/navigation";

/**
 * /soporte → redirige a /contacto para centralizar el punto de ayuda.
 * Mantener esta ruta para compatibilidad con Google Play Console.
 */
export default function SoportePage() {
  redirect("/contacto");
}
