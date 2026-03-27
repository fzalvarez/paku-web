import type {
  CartWithItemsOut,
  AddCartItemIn,
  UpdateCartItemIn,
  CheckoutIn,
  CheckoutOut,
} from "@/types/cart";
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

export const cartService = {
  /**
   * Obtiene el carrito activo del usuario autenticado.
   * 404 → el usuario no tiene carrito activo.
   */
  getActive(): Promise<CartWithItemsOut> {
    return apiClient.get<CartWithItemsOut>(ENDPOINTS.CART.ACTIVE);
  },

  /**
   * Agrega un ítem al carrito activo (lo crea si no existe).
   */
  addItem(data: AddCartItemIn): Promise<CartWithItemsOut> {
    return apiClient.post<CartWithItemsOut>(ENDPOINTS.CART.ITEMS, data);
  },

  /**
   * Actualiza la cantidad de un ítem del carrito.
   */
  updateItem(itemId: string, data: UpdateCartItemIn): Promise<CartWithItemsOut> {
    return apiClient.patch<CartWithItemsOut>(ENDPOINTS.CART.ITEM(itemId), data);
  },

  /**
   * Elimina un ítem del carrito.
   */
  removeItem(itemId: string): Promise<CartWithItemsOut> {
    return apiClient.delete<CartWithItemsOut>(ENDPOINTS.CART.ITEM(itemId));
  },

  /**
   * Realiza el checkout del carrito activo.
   */
  checkout(data: CheckoutIn): Promise<CheckoutOut> {
    return apiClient.post<CheckoutOut>(ENDPOINTS.CART.CHECKOUT, data);
  },
};
