import type { CategoryOut, ProductOut, ProductDetailOut, QuoteOut } from "@/types/api";
import { publicApiClient, apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return "";
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) s.set(k, v);
  }
  const qs = s.toString();
  return qs ? `?${qs}` : "";
}

export const storeService = {
  listCategories: (species?: string) =>
    publicApiClient.get<CategoryOut[]>(`${ENDPOINTS.STORE.CATEGORIES}${buildQuery({ species })}`),

  listProductsByCategory: (slug: string, params?: { pet_id?: string; species?: string }) =>
    publicApiClient.get<ProductOut[]>(
      `${ENDPOINTS.STORE.CATEGORIES}/${slug}/products${buildQuery(params as Record<string, string>)}`
    ),

  getProduct: (id: string, params?: { pet_id?: string }) =>
    publicApiClient.get<ProductDetailOut>(`${ENDPOINTS.STORE.PRODUCT(id)}${buildQuery(params as Record<string, string>)}`),

  quote: (payload: { pet_id: string; product_id: string; addon_ids?: string[] }) =>
    apiClient.post<QuoteOut>(ENDPOINTS.STORE.QUOTE, payload),
};
