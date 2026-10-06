"use client";

import { useEffect, useState } from "react";
import { ordersService } from "@/lib/api/orders";
import type { DelayReportOut, OrderPhotoOut } from "@/types/orders";

interface OrderExtras {
  photos: OrderPhotoOut[];
  delays: DelayReportOut[];
}

const EMPTY: OrderExtras = { photos: [], delays: [] };

/**
 * Fotos (C-12) y avisos de demora (C-14) de una orden. Se piden de nuevo solo
 * cuando cambia `reloadKey` (estado y paso de la orden), no en cada consulta de
 * la orden: así no se regeneran las URLs firmadas de las fotos cada 15 s.
 * Si una de las dos consultas falla, esa parte queda vacía y el resto sigue.
 */
export function useOrderExtras(orderId: string, reloadKey: string): OrderExtras {
  const [extras, setExtras] = useState<{ key: string; data: OrderExtras } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const key = `${orderId}|${reloadKey}`;
    Promise.all([
      ordersService.photos(orderId).catch(() => [] as OrderPhotoOut[]),
      ordersService.delayReports(orderId).catch(() => [] as DelayReportOut[]),
    ]).then(([photos, delays]) => {
      if (!cancelled) setExtras({ key, data: { photos, delays } });
    });
    return () => { cancelled = true; };
  }, [orderId, reloadKey]);

  // Mientras recarga se mantienen los datos anteriores de la misma orden
  return extras && extras.key.startsWith(`${orderId}|`) ? extras.data : EMPTY;
}
