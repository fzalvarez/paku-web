/** Último y próximo baño, a partir de los pedidos de Paku y los registros de la mascota. */
import type { OrderOut } from "@/types/orders";
import type { PetRecordOut } from "@/types/pet-records";
import type { Breed, Pet } from "@/types/pets";
import { addDays, daysBetween, limaDay } from "./dates";
import { BATH_WEEKS_BY_BREED_COAT, BATH_WEEKS_BY_PET_COAT, DEFAULT_BATH_WEEKS } from "./rules";

/** Pedidos de esta mascota (servicio base con su pet_id), más nuevos primero. */
export function petOrders(orders: OrderOut[], petId: string): OrderOut[] {
  return orders
    .filter((o) => o.items_snapshot.some((i) => i.kind === "service_base" && i.meta?.pet_id === petId))
    .sort((a, b) => orderDay(b).localeCompare(orderDay(a)));
}

/** Día del servicio: hora asignada, día reservado o, en su defecto, el de creación. */
export function orderDay(order: OrderOut): string {
  const base = order.items_snapshot.find((i) => i.kind === "service_base");
  return limaDay(order.scheduled_at ?? order.reserved_date ?? base?.meta?.scheduled_date ?? order.created_at);
}

export interface BathInterval {
  days: number;
  /** De dónde salió: tipo de pelo del dueño, manto de la raza o valor general. */
  basis: "pet" | "breed" | "default";
}

export function bathInterval(pet: Pet, breed: Breed | null): BathInterval {
  if (pet.coat_type) return { days: 7 * BATH_WEEKS_BY_PET_COAT[pet.coat_type], basis: "pet" };
  if (breed?.coat_type) return { days: 7 * BATH_WEEKS_BY_BREED_COAT[breed.coat_type], basis: "breed" };
  return { days: 7 * DEFAULT_BATH_WEEKS, basis: "default" };
}

export interface BathInfo {
  lastDay: string | null;
  /** "paku" si el último baño fue un pedido; "record" si lo registró el dueño o el groomer. */
  source: "paku" | "record" | null;
  nextDay: string | null;
  /** Días hasta el próximo baño (negativo si ya pasó). */
  daysLeft: number | null;
  interval: BathInterval;
}

export function bathInfo(
  pet: Pet,
  breed: Breed | null,
  orders: OrderOut[],
  records: PetRecordOut[],
  today: string,
): BathInfo {
  const interval = bathInterval(pet, breed);
  const lastOrder = petOrders(orders, pet.id).find((o) => o.status === "done");
  const lastRecord = records
    .filter((r) => (r.type === "bath" || r.type === "grooming") && !r.deleted_at)
    .map((r) => limaDay(r.occurred_at))
    .sort()
    .at(-1);

  const fromOrder = lastOrder ? orderDay(lastOrder) : null;
  let lastDay: string | null = null;
  let source: BathInfo["source"] = null;
  if (fromOrder && (!lastRecord || fromOrder >= lastRecord)) {
    lastDay = fromOrder;
    source = "paku";
  } else if (lastRecord) {
    lastDay = lastRecord;
    source = "record";
  }

  const nextDay = lastDay ? addDays(lastDay, interval.days) : null;
  return { lastDay, source, nextDay, daysLeft: nextDay ? daysBetween(today, nextDay) : null, interval };
}
