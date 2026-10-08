import { todayLima } from "@/lib/utils/dates";

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

// ── Fecha de nacimiento ───────────────────────────────────────────────────────

/** Edad máxima que se puede registrar (decisión del owner, 2026-10-08). */
export const PET_MAX_AGE_YEARS = 20;

/**
 * Rango permitido para la fecha de nacimiento de una mascota, en hora de Lima:
 * desde hace 20 años hasta hoy (nunca en el futuro). Para `min`/`max` del input.
 */
export function petBirthDateBounds(): { min: string; max: string } {
  const max = todayLima();
  const [y, m, d] = max.split("-").map(Number);
  // 29 de febrero → 28 de febrero si el año de hace 20 no es bisiesto
  const minDate = new Date(Date.UTC(y - PET_MAX_AGE_YEARS, m - 1, d));
  if (minDate.getUTCMonth() !== m - 1) minDate.setUTCDate(0);
  return { min: minDate.toISOString().slice(0, 10), max };
}

/** Mensaje de error si la fecha está fuera de rango; null si es válida o está vacía. */
export function petBirthDateError(value?: string | null): string | null {
  if (!value) return null;
  const { min, max } = petBirthDateBounds();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "La fecha de nacimiento no es válida.";
  if (value > max) return "La fecha de nacimiento no puede ser futura.";
  if (value < min) {
    const [y, m, d] = min.split("-").map(Number);
    const minText = new Date(y, m - 1, d).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
    return `La edad máxima es de ${PET_MAX_AGE_YEARS} años: elige una fecha desde el ${minText}.`;
  }
  return null;
}
