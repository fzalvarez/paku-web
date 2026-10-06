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
  /** Precio para la mascota (ej. 15.00). Null si no aplica o no tiene precio. */
  price: number | null;
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
  /** Precio para la mascota (ej. 65.00). Null si la mascota no tiene peso o no hay regla de precio. */
  price: number | null;
  currency: string;
  /** Solo presente en GET /store/products/{id} */
  available_addons?: ServiceAddon[];
}

// ── Helper ─────────────────────────────────────────────────────────────────────

/** Formatea un monto que calculó el backend: 65 → "S/ 65.00" */
export function formatPrice(amount: number, currency = "PEN"): string {
  const symbol = currency === "PEN" ? "S/" : currency;
  return `${symbol} ${Number(amount).toFixed(2)}`;
}
