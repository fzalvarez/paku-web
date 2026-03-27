/**
 * Valida que una URL de foto sea absoluta y usable por next/image.
 * Devuelve null si está vacía, es relativa, contiene espacios o no es una URL válida.
 */
export function safePhotoUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // Debe comenzar con http:// o https://
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return null;
  try {
    const parsed = new URL(trimmed);
    // Verificar que tiene hostname válido (no solo protocolo)
    if (!parsed.hostname) return null;
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

/**
 * Calcula la edad de una mascota a partir de su fecha de nacimiento.
 * Retorna texto tipo "2 años", "8 meses" o "-".
 */
export function calcPetAge(birthDate?: string | null): string {
  if (!birthDate) return "-";
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return "-";

  const now = new Date();
  let months =
    (now.getFullYear() - d.getFullYear()) * 12 +
    (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months -= 1;
  if (months < 0) months = 0;

  const years = Math.floor(months / 12);
  const rem = months % 12;

  if (years === 0 && rem === 0) return "0 meses";
  if (years === 0) return `${rem} mes${rem !== 1 ? "es" : ""}`;
  if (rem === 0) return `${years} año${years !== 1 ? "s" : ""}`;
  return `${years} año${years !== 1 ? "s" : ""} ${rem} mes${rem !== 1 ? "es" : ""}`;
}

/**
 * Etiqueta legible para la especie.
 */
export function speciesLabel(s?: string | null): string {
  if (s === "dog") return "Perro";
  if (s === "cat") return "Gato";
  return s ?? "-";
}
