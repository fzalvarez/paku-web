/**
 * Textos del home. Solo afirmaciones confirmadas por el negocio o respaldadas por
 * funciones reales de la web (seguimiento, fotos, transmisión, pago en línea,
 * historial). No agregar cifras ni promesas sin confirmarlas antes.
 */

export interface HomeItem {
  emoji: string;
  title: string;
  description: string;
}

/** "¿Por qué los peludos aman Paku?" */
export const WHY_PAKU: HomeItem[] = [
  {
    emoji: "🛁",
    title: "Una mascota a la vez",
    description: "Sin jaulas ni otros perros: durante su cita, la van es solo para tu engreído.",
  },
  {
    emoji: "🚐",
    title: "Frente a tu puerta",
    description: "La van llega con agua y luz propias. No usamos nada de tu casa ni ensuciamos tu ducha.",
  },
  {
    emoji: "📍",
    title: "Síguelo en vivo",
    description: "Mira al groomer en el mapa, cada paso del servicio, fotos y la transmisión en vivo.",
  },
  {
    emoji: "📋",
    title: "Su historial a la mano",
    description: "Peso, preferencias de baño y servicios anteriores de cada mascota, en tu cuenta.",
  },
];

/** "¿Cómo llega la felicidad a tu puerta?" */
export const HOW_IT_WORKS: (HomeItem & { tag: string })[] = [
  {
    emoji: "📱",
    title: "Agendas en minutos",
    description: "Eliges a tu mascota, el servicio, el día y la dirección, y pagas en línea con tarjeta.",
    tag: "Desde la web",
  },
  {
    emoji: "🚐",
    title: "La van se estaciona en tu puerta",
    description: "Te confirmamos la hora de llegada y ves al groomer acercarse en el mapa.",
    tag: "Agua y luz propias",
  },
  {
    emoji: "✨",
    title: "¡Peludo limpio y feliz!",
    description: "Sigues cada paso en vivo y te lo devolvemos limpiecito, sequito y engreído.",
    tag: "Puro amor 💙",
  },
];

/** "¿Cómo es por dentro la furgoneta de Paku?" (confirmado por el negocio, 2026-10-08) */
export const VAN_FEATURES: HomeItem[] = [
  {
    emoji: "🛁",
    title: "Tina de acero inoxidable",
    description: "Con agua tibia para un baño cómodo y relajante.",
  },
  {
    emoji: "🐾",
    title: "Mesa de secado elevable",
    description: "Se regula en altura para secar y peinar sin forzar a tu mascota.",
  },
  {
    emoji: "🔌",
    title: "Agua y luz propias",
    description: "La van es autónoma: no necesita nada de tu casa.",
  },
  {
    emoji: "💙",
    title: "Una mascota a la vez",
    description: "Todo el espacio y la atención para tu peludo.",
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

/**
 * "Historias de colitas contentas".
 * TODO: reemplazar por reseñas reales de clientes (con su permiso) antes de
 * publicar. Hoy son textos de ejemplo.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    name: "Nombre Apellido",
    detail: "Mamá de Mascota · Distrito",
  },
  {
    quote:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    name: "Nombre Apellido",
    detail: "Papá de Mascota · Distrito",
  },
  {
    quote:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    name: "Nombre Apellido",
    detail: "Mamá de Mascota · Distrito",
  },
];
