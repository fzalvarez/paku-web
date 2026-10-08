"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

const ZOOM = 16;

/**
 * Mapa pequeño de solo lectura para mostrar dónde está una dirección (tarjetas
 * de "Mis direcciones"). Sin arrastre ni zoom, para que no atrape el scroll en
 * el celular. Mismos mosaicos de OpenStreetMap que LocationPickerMap.
 */
export function AddressMiniMap({ lat, lng, label, className = "" }: { lat: number; lng: number; label: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    // Mismo resguardo que LocationPickerMap ante el doble montaje de StrictMode
    let cancelled = false;

    import("leaflet").then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (cancelled || !containerRef.current || (containerRef.current as any)._leaflet_id) return;

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: ZOOM,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: true,
      });
      map.attributionControl.setPrefix(false);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Pin propio (sin imágenes externas): gota con los colores de la marca
      const pin = L.divIcon({
        className: "",
        html: '<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--primary);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 22],
      });
      L.marker([lat, lng], { icon: pin, keyboard: false, interactive: false }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Mapa de la ubicación: ${label}`}
      className={`z-0 bg-muted ${className}`}
    />
  );
}
