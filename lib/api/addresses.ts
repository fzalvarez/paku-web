import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { AddressOut, AddressCreateIn, AddressUpdateIn } from "@/types/api";

/**
 * Servicio de direcciones del usuario autenticado.
 * Todos los endpoints requieren Authorization: Bearer <access_token>.
 */
export const addressesService = {
  /** GET /addresses — Lista todas las direcciones del usuario */
  list: (): Promise<AddressOut[]> =>
    apiClient.get<AddressOut[]>(ENDPOINTS.ADDRESSES.LIST),

  /** POST /addresses — Crea una nueva dirección */
  create: (payload: AddressCreateIn): Promise<AddressOut> =>
    apiClient.post<AddressOut>(ENDPOINTS.ADDRESSES.CREATE, payload),

  /** GET /addresses/{id} — Obtiene una dirección específica */
  get: (id: string): Promise<AddressOut> =>
    apiClient.get<AddressOut>(ENDPOINTS.ADDRESSES.DETAIL(id)),

  /** PATCH /addresses/{id} — Actualización parcial de una dirección */
  update: (id: string, payload: AddressUpdateIn): Promise<AddressOut> =>
    apiClient.patch<AddressOut>(ENDPOINTS.ADDRESSES.UPDATE(id), payload),

  /** DELETE /addresses/{id} — Soft delete (no se puede eliminar la última) */
  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(ENDPOINTS.ADDRESSES.DELETE(id)),

  /** PUT /addresses/{id}/default — Marca la dirección como predeterminada */
  setDefault: (id: string): Promise<void> =>
    apiClient.put<void>(ENDPOINTS.ADDRESSES.SET_DEFAULT(id), {}),
};
