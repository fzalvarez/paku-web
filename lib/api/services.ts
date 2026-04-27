import type {
  ServiceOut,
  ServiceCategoryOut,
  ServiceAddon,
} from "@/types/services";
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

export const servicesService = {
  /**
   * GET /store/categories
   * Lista las categorías de servicios.
   */
  listCategories(): Promise<ServiceCategoryOut[]> {
    return apiClient.get<ServiceCategoryOut[]>(ENDPOINTS.STORE.CATEGORIES);
  },

  /**
   * GET /store/categories/{slug}/products?pet_id=...&species=...
   * Lista los productos de una categoría filtrando opcionalmente por mascota/especie.
   */
  listProductsByCategory(
    slug: string,
    params?: { pet_id?: string; species?: "dog" | "cat" },
  ): Promise<ServiceOut[]> {
    console.log("GAAAAAAA::", params);

    const qs = new URLSearchParams();
    if (params?.pet_id) qs.set("pet_id", params.pet_id);
    if (params?.species) qs.set("species", params.species);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return apiClient.get<ServiceOut[]>(
      `${ENDPOINTS.STORE.CATEGORY_PRODUCTS(slug)}${query}&species=dog`,
    );
  },

  /**
   * GET /store/products/{id}?pet_id=...
   * Detalle de un producto con sus available_addons.
   */
  getProduct(
    id: string,
    params?: { pet_id?: string },
  ): Promise<ServiceOut & { available_addons: ServiceAddon[] }> {
    const qs = params?.pet_id ? `?pet_id=${params.pet_id}` : "";
    return apiClient.get<ServiceOut & { available_addons: ServiceAddon[] }>(
      `${ENDPOINTS.STORE.PRODUCT(id)}${qs}`,
    );
  },
};
