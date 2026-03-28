import type {
  CartWithItemsOut,
  CartValidateOut,
  CartCheckoutOut,
  AddCartItemsIn,
  ReplaceCartItemsIn,
} from "@/types/cart";
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

export const cartService = {
  /**
   * GET /cart
   * Obtiene el carrito activo del usuario. Si expiró, crea uno nuevo vacío.
   */
  getActive(): Promise<CartWithItemsOut> {
    return apiClient.get<CartWithItemsOut>(ENDPOINTS.CART.ACTIVE);
  },

  /**
   * POST /cart/items
   * Crea el carrito con todos los items de una sola llamada.
   * Si ya existe un carrito activo, agrega los items al existente.
   */
  addItems(data: AddCartItemsIn): Promise<CartWithItemsOut> {
    return apiClient.post<CartWithItemsOut>(ENDPOINTS.CART.ITEMS, data);
  },

  /**
   * PUT /cart/{id}/items
   * Reemplaza todos los items del carrito.
   */
  replaceItems(cartId: string, data: ReplaceCartItemsIn): Promise<CartWithItemsOut> {
    return apiClient.put<CartWithItemsOut>(ENDPOINTS.CART.CART_ITEMS(cartId), data);
  },

  /**
   * DELETE /cart/{id}/items/{item_id}
   * Elimina un ítem del carrito.
   */
  removeItem(cartId: string, itemId: string): Promise<CartWithItemsOut> {
    return apiClient.delete<CartWithItemsOut>(ENDPOINTS.CART.ITEM(cartId, itemId));
  },

  /**
   * POST /cart/{id}/validate
   * Valida el carrito sin procesar nada. Retorna errores y total.
   */
  validate(cartId: string): Promise<CartValidateOut> {
    return apiClient.post<CartValidateOut>(ENDPOINTS.CART.VALIDATE(cartId), {});
  },

  /**
   * POST /cart/{id}/checkout
   * Marca el carrito como checked_out. No procesa el pago.
   */
  checkout(cartId: string): Promise<CartCheckoutOut> {
    return apiClient.post<CartCheckoutOut>(ENDPOINTS.CART.CHECKOUT(cartId), {});
  },
};
