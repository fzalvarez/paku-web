"use client";

import React, { useEffect, useState } from "react";
import type { CategoryOut, ProductOut } from "@/types/api";
import { storeService } from "@/lib/api/store";
import Link from "next/link";
import { ArrowRight, Check, Loader2 } from "lucide-react";

// ── Íconos por categoría de producto (ciclo por índice — el catálogo es
// dinámico desde el backend, sin campo de imagen, así que esto escala a
// cualquier producto nuevo sin romperse) ────────────────────────────────────

const PAW_PATH =
  "M8.5 9.5c1 0 1.8-1.1 1.8-2.5S9.5 4.5 8.5 4.5 6.7 5.6 6.7 7s.8 2.5 1.8 2.5Zm7 0c1 0 1.8-1.1 1.8-2.5s-.8-2.5-1.8-2.5S13.7 5.6 13.7 7s.8 2.5 1.8 2.5Zm-10.3 3c.9 0 1.6-1 1.6-2.2S6.1 8.1 5.2 8.1s-1.6 1-1.6 2.2 .7 2.2 1.6 2.2Zm13.6 0c.9 0 1.6-1 1.6-2.2s-.7-2.2-1.6-2.2-1.6 1-1.6 2.2 .7 2.2 1.6 2.2ZM12 12.2c-2.4 0-5 1.9-5 4.5 0 1.5 1.1 2.3 2.6 2.3.9 0 1.5-.3 2.4-.3s1.5.3 2.4.3c1.5 0 2.6-.8 2.6-2.3 0-2.6-2.6-4.5-5-4.5Z";

const CARD_VARIANTS = [
  {
    // Gota de agua — lavado / higiene básica
    accent: "primary",
    gradient: "from-primary to-secondary",
    icon: (
      <svg viewBox="0 0 24 24" className="size-14" fill="none" stroke="white" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5C8.5 8 6.5 11 6.5 14a5.5 5.5 0 0 0 11 0c0-3-2-6-5.5-10.5Z" />
        <path d="M9.2 14.5a2.8 2.8 0 0 0 2.8 2.8" />
      </svg>
    ),
  },
  {
    // Chispa / gema — experiencia premium
    accent: "tertiary",
    gradient: "from-tertiary to-secondary",
    icon: (
      <svg viewBox="0 0 24 24" className="size-14" fill="none" stroke="white" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5 13.7 9l5.3 1.7-5.3 1.7-1.7 5.3-1.7-5.3L6.9 10.7 12.2 9Z" />
        <path d="M18.5 4.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6Z" />
      </svg>
    ),
  },
  {
    // Rayo — rápido / en seco
    accent: "secondary",
    gradient: "from-secondary to-primary",
    icon: (
      <svg viewBox="0 0 24 24" className="size-14" fill="white" stroke="none">
        <path d="M13.3 2 5 13.5h5.6l-1 8.5L18 10.5h-5.6l.9-8.5Z" />
      </svg>
    ),
  },
] as const;

const ACCENT_TEXT: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
};

function ProductCard({ product, variantIdx }: { product: ProductOut; variantIdx: number }) {
  const variant = CARD_VARIANTS[variantIdx % CARD_VARIANTS.length];

  return (
    <li className="group overflow-hidden rounded-[1.5rem] border border-border/60 bg-background shadow-sm transition-shadow hover:shadow-lg">
      {/* Header ilustrado */}
      <div className={`relative flex h-36 items-center justify-center overflow-hidden bg-linear-to-br ${variant.gradient}`}>
        <svg
          viewBox="0 0 24 24"
          className="absolute -right-3 -top-3 size-24 opacity-[0.14]"
          fill="white"
          aria-hidden="true"
        >
          <path d={PAW_PATH} />
        </svg>
        <div className="relative transition-transform duration-300 group-hover:scale-110">
          {variant.icon}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-lg font-extrabold tracking-tight text-foreground">{product.name}</h3>
        {product.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        )}

        {/* Qué incluye */}
        {product.included_items && product.included_items.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Incluye
            </p>
            <ul className="space-y-1.5">
              {product.included_items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${ACCENT_TEXT[variant.accent]} bg-current/10`}>
                    <Check className={`size-2.5 ${ACCENT_TEXT[variant.accent]}`} strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Precio</p>
            <span className={`text-lg font-extrabold ${ACCENT_TEXT[variant.accent]}`}>
              {product.price ? `S/ ${product.price.toFixed(2)}` : "Consultar"}
            </span>
          </div>
          <Link
            href={`/booking?service=${product.id}`}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 bg-linear-to-br ${variant.gradient}`}
          >
            Reservar
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </li>
  );
}

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <h1 className="text-3xl font-black tracking-tight text-primary md:text-4xl">Paku Spa</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Productos y servicios de spa para tu mascota.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Cargando…
        </div>
      ) : products.length === 0 ? (
        <div className="max-w-3xl mx-auto text-center text-sm text-muted-foreground py-16">
          No se encontraron productos para la categoría Paku Spa.
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} variantIdx={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
