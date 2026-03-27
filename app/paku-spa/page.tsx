"use client";

import React, { useEffect, useState } from "react";
import type { CategoryOut, ProductOut } from "@/types/api";
import { storeService } from "@/lib/api/store";
import Link from "next/link";

export default function PakuSpaPage() {
  const [categories, setCategories] = useState<CategoryOut[]>([]);
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [loading, setLoading] = useState(true);
  const categorySlug = "paku-spa";

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const cats = await storeService.listCategories();
        if (!mounted) return;
        setCategories(cats || []);
        const cat = (cats || []).find((c: CategoryOut) => c.slug === categorySlug);
        if (!cat) {
          setProducts([]);
          return;
        }
        const prods = await storeService.listProductsByCategory(cat.slug);
        if (!mounted) return;
        setProducts(prods || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold">Paku Spa</h1>
        <p className="mt-2 text-sm text-muted-foreground">Productos y servicios de spa para tu mascota.</p>
      </div>

      {loading ? (
        <div className="max-w-3xl mx-auto">Cargando...</div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {products.length === 0 ? (
            <div className="max-w-3xl mx-auto text-sm text-muted-foreground">No se encontraron productos para la categoría Paku Spa.</div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <li key={p.id} className="bg-background border rounded-lg shadow-sm overflow-hidden">
                  <div
                    className="h-40 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('/file.svg')` }}
                    aria-hidden
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-medium">{p.price ? `${p.price} ${p.currency ?? "PEN"}` : "Consultar precio"}</span>
                      <Link href={`/store/products/${p.id}`} className="text-primary font-semibold">Ver detalle</Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
