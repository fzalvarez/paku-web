/**
 * Tipos del catálogo de servicios — alineados con endpoints reales:
 *   GET /store/categories
 *   GET /store/categories/{slug}/products
 *   GET /store/products/{id}
 */

// ── Categoría ──────────────────────────────────────────────────────────────────

export interface ServiceCategoryOut {
  id: string;
  name: string;
  slug: string;
  species: "dog" | "cat" | null;
  is_active: boolean;
}

// ── Addon (viene en available_addons de GET /store/products/{id}) ──────────────

export interface ServiceAddon {
  id: string;
  product_id: string;
  name: string;
  description?: string | null;
  species: "dog" | "cat";
  allowed_breeds: string[] | null;
  is_active: boolean;
  /** Precio en céntimos (ej. 1500 = S/ 15.00) */
  price: number;
  currency: string;
}

// ── Producto — respuesta de GET /store/categories/{slug}/products ──────────────

export interface ServiceOut {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  species: "dog" | "cat";
  allowed_breeds: string[] | null;
  is_active: boolean;
  /** Precio en céntimos (ej. 6500 = S/ 65.00) */
  price: number;
  currency: string;
  /** Solo presente en GET /store/products/{id} */
  available_addons?: ServiceAddon[];
}

// ── Helper ─────────────────────────────────────────────────────────────────────

/** Convierte céntimos a string formateado: 6500 → "S/ 65.00" */
export function formatPrice(cents: number, currency = "PEN"): string {
  const symbol = currency === "PEN" ? "S/" : currency;
  return `${symbol} ${(cents / 100).toFixed(2)}`;
}
