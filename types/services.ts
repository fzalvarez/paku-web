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
  /** Precio decimal (ej. 15.00) */
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
  /** Precio decimal (ej. 65.00) */
  price: number;
  currency: string;
  /** Solo presente en GET /store/products/{id} */
  available_addons?: ServiceAddon[];
}

// ── Helper ─────────────────────────────────────────────────────────────────────

/** Convierte monto decimal a string formateado: 65 → "S/ 65.00" */
export function formatPrice(amount: number, currency = "PEN"): string {
  const symbol = currency === "PEN" ? "S/" : currency;
  return `${symbol} ${Number(amount).toFixed(2)}`;
}
