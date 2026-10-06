// Textos en español para los valores que devuelve la API.
// Los valores (status, payment_status…) los define paku-backend y quedan en inglés;
// la interfaz solo muestra lo que hay aquí. Agregar aquí cualquier valor nuevo.
// El backend puede sumar valores: todas las funciones tienen texto por defecto.

import type { OrderPaymentStatus, OrderStatus } from "@/types/orders";

interface StatusInfo {
  label: string;
  description: string;
  /** Color del texto */
  color: string;
  /** Fondo y borde (cajas y etiquetas) */
  bgColor: string;
}

// ── Estado de la orden ────────────────────────────────────────────────────────

const ORDER_STATUS_INFO: Record<OrderStatus, StatusInfo> = {
  created: {
    label: "Pendiente de asignación",
    description: "Tu pedido fue creado y está esperando que le asignemos un especialista.",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
  },
  accepted: {
    label: "Aceptado",
    description: "Un especialista ha aceptado tu pedido y se está preparando.",
    color: "text-teal-700",
    bgColor: "bg-teal-50 border-teal-200",
  },
  on_the_way: {
    label: "Especialista en camino",
    description: "Tu especialista ya salió y está dirigiéndose a tu domicilio.",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
  },
  in_service: {
    label: "Servicio en curso",
    description: "El especialista recogió a tu mascota y el servicio está en progreso.",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
  },
  done: {
    label: "Servicio finalizado",
    description: "¡Servicio completado! Esperamos que tu mascota quede feliz.",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
  },
  cancelled: {
    label: "Cancelado",
    description: "Este pedido fue cancelado.",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
  },
  skipped: {
    label: "Visita no realizada",
    description:
      "El especialista no pudo realizar el servicio en esta visita. Nuestro equipo se pondrá en contacto contigo para reprogramarlo.",
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
  },
};

export function orderStatusInfo(status: string): StatusInfo {
  return (
    ORDER_STATUS_INFO[status as OrderStatus] ?? {
      label: status,
      description: "",
      color: "text-muted-foreground",
      bgColor: "bg-muted border-border",
    }
  );
}

export function orderStatusLabel(status: string): string {
  return orderStatusInfo(status).label;
}

// ── Estado del pago ───────────────────────────────────────────────────────────

const PAYMENT_STATUS_INFO: Record<OrderPaymentStatus, StatusInfo> = {
  pending: {
    label: "Pago pendiente",
    description: "Estamos esperando la confirmación del pago de esta orden.",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
  },
  paid: {
    label: "Pago confirmado",
    description: "El pago fue confirmado correctamente.",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
  },
  verifying: {
    label: "Confirmando pago",
    description: "Estamos confirmando tu pago con el banco 🏦, te avisaremos en cuanto se confirme.",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
  },
  failed: {
    label: "Pago fallido",
    description: "El último intento de pago fue rechazado. Puedes intentar de nuevo con otra tarjeta.",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
  },
};

export function paymentStatusInfo(status?: string | null): StatusInfo {
  return PAYMENT_STATUS_INFO[(status ?? "pending") as OrderPaymentStatus] ?? {
    label: status ?? "",
    description: "",
    color: "text-muted-foreground",
    bgColor: "bg-muted border-border",
  };
}

// ── Proceso del servicio (C-11) ───────────────────────────────────────────────

export const SERVICE_STEPS = ["reception", "bath", "drying", "finishing", "return"] as const;

export const SERVICE_STEP_LABELS: Record<string, string> = {
  reception: "Recepción y recojo",
  bath: "Baño",
  drying: "Secado",
  finishing: "Corte y acabado",
  return: "Devolución a casa",
};

// ── Parada saltada (C-13), contado al cliente ─────────────────────────────────

export const SKIP_REASON_LABELS: Record<string, string> = {
  pet_not_present: "No encontramos a tu mascota en el domicilio",
  tutor_not_present: "No encontramos a nadie en el domicilio",
  other: "Otro motivo",
};

// ── Fotos del servicio (C-12) ─────────────────────────────────────────────────

export const PHOTO_KIND_LABELS: Record<string, string> = {
  initial: "Al recoger",
  final: "Al terminar",
  incident: "Observación",
};

/** Texto de un valor; si el backend manda uno nuevo, se muestra tal cual. */
export function label(map: Record<string, string>, value?: string | null): string {
  if (!value) return "";
  return map[value] ?? value;
}
