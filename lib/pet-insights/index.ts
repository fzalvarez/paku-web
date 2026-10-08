/**
 * Panel de la mascota (spec 0003): reglas orientativas calculadas en el
 * frontend con datos que ya existen (ficha, registros, pedidos y catálogo de
 * razas del backend). Funciones puras, un archivo por tema:
 *
 * - rules.ts     umbrales pendientes de confirmar (único lugar para ajustarlos)
 * - breeds.ts    datos de referencia por raza, con las claves del catálogo del backend
 * - dates.ts     fechas de negocio en hora de Lima
 * - age.ts       tamaño, edad, etapa y edad humana
 * - weight.ts    serie de peso y comparación con su raza
 * - bath.ts      último y próximo baño
 * - health.ts    salud preventiva
 * - activity.ts  energía y actividad sugerida
 * - nutrition.ts tipo de alimento orientativo
 * - readings.ts  artículos sugeridos del blog
 * - profile.ts   datos faltantes de la ficha
 */
export * from "./age";
export * from "./activity";
export * from "./bath";
export * from "./breeds";
export * from "./dates";
export * from "./health";
export * from "./nutrition";
export * from "./profile";
export * from "./readings";
export * from "./weight";
