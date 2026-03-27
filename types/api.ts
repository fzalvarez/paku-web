/**
 * Tipos base de respuesta de la API.
 */

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export interface CategoryOut {
  id: string;
  name: string;
  slug: string;
  species: string | null;
  is_active: boolean;
}

export interface ProductOut {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  species: string | null;
  allowed_breeds: string[] | null;
  is_active: boolean;
  price: number | null;
  currency: string | null;
}

export interface AddonOut {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
  species: string | null;
  allowed_breeds: string[] | null;
  is_active: boolean;
  price: number | null;
  currency: string | null;
}

export interface ProductDetailOut extends ProductOut {
  available_addons: AddonOut[];
}

export interface QuoteOut {
  pet_id: string;
  product: { target_id: string; name: string; price: number };
  addons: { target_id: string; name: string; price: number }[];
  total: number;
  currency: string;
}

// ── Addresses ─────────────────────────────────────────────────────────────────

export interface AddressOut {
  id: string;
  district_id: string;
  address_line: string;
  lat: number;
  lng: number;
  reference: string | null;
  building_number: string | null;
  apartment_number: string | null;
  label: string | null;
  type: string | null;
  is_default: boolean;
  created_at: string;
}

export interface AddressCreateIn {
  district_id: string;
  address_line: string;
  lat: number;
  lng: number;
  reference?: string;
  building_number?: string;
  apartment_number?: string;
  label?: string;
  type?: string;
  is_default?: boolean;
}

export interface AddressUpdateIn {
  district_id?: string;
  address_line?: string;
  reference?: string;
  building_number?: string;
  apartment_number?: string;
  label?: string;
  type?: string;
  is_default?: boolean;
}
