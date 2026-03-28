"use client";

import { useState, useEffect, useCallback } from "react";
import type { ServiceOut, ServiceCategoryOut } from "@/types/services";
import { servicesService } from "@/lib/api/services";
import { ApiCallError } from "@/lib/api/client";

interface UseServicesReturn {
  services: ServiceOut[];
  categories: ServiceCategoryOut[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  filterByCategory: (slug: string | null) => void;
  selectedCategorySlug: string | null;
}

export function useServices(petId?: string): UseServicesReturn {
  const [categories, setCategories] = useState<ServiceCategoryOut[]>([]);
  const [services, setServices] = useState<ServiceOut[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(
    async (slug?: string | null) => {
      setLoading(true);
      setError(null);
      try {
        // 1. Cargar categorías activas
        const cats = await servicesService.listCategories();
        const activeCats = Array.isArray(cats) ? cats.filter((c) => c.is_active) : [];
        setCategories(activeCats);

        if (activeCats.length === 0) {
          setServices([]);
          return;
        }

        // 2. Cargar productos — por slug seleccionado o todas las categorías
        const params = petId ? { pet_id: petId } : undefined;

        if (slug) {
          const products = await servicesService.listProductsByCategory(slug, params);
          setServices(Array.isArray(products) ? products.filter((p) => p.is_active) : []);
        } else {
          const results = await Promise.allSettled(
            activeCats.map((c) => servicesService.listProductsByCategory(c.slug, params))
          );
          const allProducts: ServiceOut[] = [];
          for (const r of results) {
            if (r.status === "fulfilled" && Array.isArray(r.value)) {
              allProducts.push(...r.value.filter((p) => p.is_active));
            }
          }
          setServices(allProducts);
        }
      } catch (err) {
        if (err instanceof ApiCallError) {
          setError(`Error ${err.status}: ${err.message}`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("No se pudieron cargar los servicios.");
        }
      } finally {
        setLoading(false);
      }
    },
    [petId]
  );

  useEffect(() => {
    fetchAll(selectedCategorySlug);
  }, [selectedCategorySlug, fetchAll]);

  const filterByCategory = useCallback((slug: string | null) => {
    setSelectedCategorySlug(slug);
  }, []);

  const refetch = useCallback(() => {
    fetchAll(selectedCategorySlug);
  }, [fetchAll, selectedCategorySlug]);

  return { services, categories, loading, error, refetch, filterByCategory, selectedCategorySlug };
}
