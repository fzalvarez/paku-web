// Mensajes de error de la API en español. Único parser para toda la web
// (modelo: paku-admin/lib/apiHelpers.ts).
//
// Formas de `detail` que devuelve paku-backend:
//   - objeto con código:  { code: "HOLD_EXPIRED", message: "…", …extra }
//   - objeto de addon:    { addon_id: "…", reason: "not_for_this_pet" }  (store/quote y carrito)
//   - string:             "Order not found", "no_capacity: el slot está lleno"
//   - lista:              errores de validación de FastAPI [{ msg, loc }]

const CODE_MESSAGES: Record<string, string> = {
  // Perfil y mascota
  PROFILE_INCOMPLETE: "Completa tu perfil (teléfono, sexo y fecha de nacimiento) antes de reservar.",
  PET_REQUIRED: "Elige una mascota.",
  PET_NOT_FOUND: "No encontramos la mascota.",
  PET_NOT_OWNED: "Esa mascota no está registrada en tu cuenta.",
  // Reserva de cupo (C-15)
  DATE_IN_PAST: "Esa fecha ya pasó. Elige otra.",
  HOLD_ALREADY_EXISTS: "Tu mascota ya tiene una reserva para ese día.",
  HOLD_REQUIRED: "Primero reserva la fecha del servicio.",
  HOLD_EXPIRED: "Tu reserva venció. Vuelve a elegir la fecha.",
  HOLD_MISMATCH: "La reserva no coincide con lo que elegiste. Vuelve a elegir la fecha.",
  HOLD_NOT_FOUND: "Tu reserva ya no es válida. Vuelve a elegir la fecha.",
  HOLD_NOT_OWNED: "Tu reserva ya no es válida. Vuelve a elegir la fecha.",
  INVALID_HOLD_ID: "Tu reserva ya no es válida. Vuelve a elegir la fecha.",
  // Carrito (C-07)
  PRICE_CHANGED: "Los precios cambiaron. Revisa el nuevo total y confirma de nuevo.",
  BASE_SERVICE_REQUIRED: "Los adicionales necesitan un servicio principal.",
  MULTIPLE_BASE_SERVICES: "Solo puedes reservar un servicio principal por pedido.",
  DUPLICATE_ADDON: "Ese adicional ya está en tu pedido.",
  PRODUCT_NOT_SUPPORTED: "Ese producto no está a la venta.",
  SERVICE_NOT_FOUND: "El servicio ya no está disponible.",
  INVALID_SERVICE_ID: "El servicio ya no está disponible.",
  INVALID_ADDON_ID: "Uno de los adicionales no es válido.",
  // Otros
  TOO_MANY_ATTEMPTS: "Demasiados intentos. Espera un momento y vuelve a intentar.",
  EMAIL_ALREADY_REGISTERED: "El email ya está registrado.",
};

// Errores de addons: detail = { addon_id, reason }
const ADDON_REASON_MESSAGES: Record<string, string> = {
  not_found: "Uno de los adicionales ya no existe.",
  not_in_product: "Uno de los adicionales no corresponde a este servicio.",
  not_for_this_pet: "Uno de los adicionales no está disponible para tu mascota.",
  no_price_rule: "Uno de los adicionales todavía no tiene precio para tu mascota.",
};

// Textos sueltos del backend (en inglés o con prefijo snake_case)
const TEXT_MESSAGES: Record<string, string> = {
  no_availability: "Ese día no tiene cupos. Elige otra fecha.",
  no_capacity: "Ese día ya se llenó. Elige otra fecha.",
  "Pet weight_kg is required to quote": "Registra el peso de tu mascota para ver el precio.",
  "Product species does not match pet species": "Ese servicio no es para la especie de tu mascota.",
  "Product is not available for this pet's breed": "Ese servicio no está disponible para la raza de tu mascota.",
  "No price rule found for this product and pet": "Ese servicio todavía no tiene precio para tu mascota.",
  "Product not found": "Servicio no encontrado.",
  "Cart expired": "Tu carrito venció. Vuelve a elegir la fecha.",
  "Cart not found": "No encontramos tu carrito.",
  "Cart must be checked_out": "Confirma tu carrito antes de crear el pedido.",
  "Order not found": "Pedido no encontrado.",
  "Pet not found": "No encontramos la mascota.",
  "Address not found": "No encontramos la dirección.",
  "Not authenticated": "Tu sesión expiró. Vuelve a iniciar sesión.",
  "Not authorized": "No tienes permiso para esta acción.",
  Forbidden: "No tienes permiso para esta acción.",
  "Insufficient permissions": "No tienes permiso para esta acción.",
  "Invalid token": "Tu sesión expiró. Vuelve a iniciar sesión.",
  "Token expired": "Tu sesión expiró. Vuelve a iniciar sesión.",
  "Invalid credentials": "Email o contraseña incorrectos.",
  "User is inactive": "Tu cuenta está inactiva.",
  "Email already registered": "El email ya está registrado.",
  internal_error: "Error del servidor. Intenta de nuevo en unos minutos.",
};

const PREFIXED = /^([a-z_]+): (.+)$/;

function translateText(text: string): string {
  if (TEXT_MESSAGES[text]) return TEXT_MESSAGES[text];
  // "codigo_snake: texto en español" → mensaje del código, o el texto
  const prefixed = PREFIXED.exec(text);
  if (prefixed) return TEXT_MESSAGES[prefixed[1]] ?? prefixed[2];
  return text;
}

// Errores de validación de FastAPI/pydantic: [{ msg, loc: ["body", "campo"] }]
function validationMessage(item: { msg?: string; loc?: unknown[] }): string {
  const field = Array.isArray(item.loc) ? String(item.loc[item.loc.length - 1] ?? "") : "";
  const msg = item.msg ?? "";
  const where = field ? ` (${field})` : "";
  if (msg === "Field required") return `Falta un dato obligatorio${where}.`;
  if (msg.startsWith("Input should be")) return `Dato no válido${where}.`;
  if (msg.startsWith("Value error, ")) return translateText(msg.slice("Value error, ".length));
  return msg ? `${msg}${where}` : "Datos inválidos.";
}

export interface ParsedApiError {
  /** Código estable para decidir qué hacer (HOLD_EXPIRED, no_capacity, ADDON_NOT_FOR_THIS_PET…) */
  code: string;
  /** Mensaje en español para mostrar */
  message: string;
}

export function parseApiErrorBody(body: unknown, status: number): ParsedApiError {
  const b = body as { detail?: unknown; message?: unknown } | null;
  const detail = b?.detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string; loc?: unknown[] } | string;
    return {
      code: "VALIDATION_ERROR",
      message: typeof first === "string" ? translateText(first) : validationMessage(first),
    };
  }

  if (detail && typeof detail === "object") {
    const d = detail as { code?: unknown; message?: unknown; reason?: unknown };
    if (typeof d.code === "string" && d.code) {
      const message =
        CODE_MESSAGES[d.code] ??
        (typeof d.message === "string" ? translateText(d.message) : `Error ${status}`);
      return { code: d.code, message };
    }
    if (typeof d.reason === "string") {
      return {
        code: `ADDON_${d.reason.toUpperCase()}`,
        message: ADDON_REASON_MESSAGES[d.reason] ?? "Uno de los adicionales no es válido.",
      };
    }
    if (typeof d.message === "string") return { code: "API_ERROR", message: translateText(d.message) };
  }

  if (typeof detail === "string" && detail) {
    const prefixed = PREFIXED.exec(detail);
    return { code: prefixed ? prefixed[1] : detail, message: translateText(detail) };
  }

  if (typeof b?.message === "string") return { code: "API_ERROR", message: translateText(b.message) };

  return { code: "API_ERROR", message: status >= 500 ? TEXT_MESSAGES.internal_error : `Error ${status}` };
}
