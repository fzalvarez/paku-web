/** Fechas de negocio como "YYYY-MM-DD" en hora de Lima (ver lib/utils/dates.ts). */

const DAY_MS = 86_400_000;

/** Día de Lima de un instante ISO, o la misma fecha si ya viene como "YYYY-MM-DD". */
export function limaDay(isoOrDay: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDay)) return isoOrDay;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoOrDay));
}

function dayToUtc(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((dayToUtc(to) - dayToUtc(from)) / DAY_MS);
}

export function addDays(day: string, days: number): string {
  return new Date(dayToUtc(day) + days * DAY_MS).toISOString().slice(0, 10);
}

export function formatDay(day: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", opts);
}
