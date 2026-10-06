// Fechas de negocio en hora de Lima. Los cupos y reservas son por día de Lima,
// así que "hoy" no puede salir de toISOString() (UTC: después de las 7 pm
// marcaría el día siguiente).

const LIMA_TZ = "America/Lima";

/** "YYYY-MM-DD" del día de hoy en Lima. */
export function todayLima(): string {
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LIMA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Hora "HH:MM" en Lima de un instante ISO (ej. vencimiento de una reserva). */
export function timeLima(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-PE", {
    timeZone: LIMA_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Fecha y hora legibles en Lima de un instante ISO (ej. scheduled_at). */
export function dateTimeLima(iso: string): string {
  return new Date(iso).toLocaleString("es-PE", {
    timeZone: LIMA_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Cuándo es el servicio de una orden. La hora la fija el admin al armar la
 * ruta (scheduled_at); antes de eso solo se conoce el día reservado
 * (meta.scheduled_date del servicio base). meta.scheduled_time es un valor
 * fijo de relleno y no se muestra.
 */
export function orderScheduleText(scheduledAt: string | null | undefined, reservedDate?: string | null): string | null {
  if (scheduledAt) return dateTimeLima(scheduledAt);
  if (!reservedDate) return null;
  const [y, m, d] = reservedDate.split("-").map(Number);
  const day = new Date(y, m - 1, d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
  return `${day} · hora por confirmar`;
}
