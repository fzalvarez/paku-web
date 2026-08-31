"use client";

/**
 * LocationPickerMap
 *
 * Mapa Leaflet que permite al usuario colocar un pin para seleccionar
 * su ubicación. Carga Leaflet dinámicamente (evita el error SSR de Next.js).
 *
 * Props:
 *   lat / lng   – coordenadas actuales (controlado desde el padre)
 *   onChange    – callback cuando el usuario mueve el pin
 *   className   – clase extra para el contenedor
 */

import { useEffect, useRef } from "react";

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
  /**
   * Centro sugerido (ej. centroide del distrito elegido en el form).
   * Solo se usa mientras el usuario no haya colocado un pin (lat/lng en 0) —
   * nunca desplaza un pin ya marcado.
   */
  centerHint?: { lat: number; lng: number } | null;
}

// Centro por defecto: Lima, Perú
const DEFAULT_LAT = -12.0464;
const DEFAULT_LNG = -77.0428;
const DEFAULT_ZOOM = 13;

export function LocationPickerMap({
  lat,
  lng,
  onChange,
  className = "",
  centerHint,
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // ya inicializado

    // React StrictMode (dev) invoca este efecto dos veces seguidas: monta,
    // desmonta, vuelve a montar. Como la carga de Leaflet es asíncrona, el
    // cleanup del primer montaje puede correr ANTES de que el import()
    // resuelva (mapRef.current todavía null en ese momento), así que no
    // alcanza a limpiar nada — y luego los dos imports resuelven y ambos
    // intentan inicializar un mapa sobre el mismo <div>, de ahí el error
    // "Map container is already initialized". `cancelled` evita que un
    // import que ya quedó obsoleto termine creando el mapa.
    let cancelled = false;

    // Carga dinámica de Leaflet para evitar errores SSR en Next.js
    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      // Resguardo extra: Leaflet marca el contenedor con _leaflet_id al
      // inicializar — si ya lo tiene, nunca reintentar sobre el mismo nodo.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((containerRef.current as any)._leaflet_id) return;

      // Fix para el ícono por defecto que se rompe con bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const centerLat = lat || centerHint?.lat || DEFAULT_LAT;
      const centerLng = lng || centerHint?.lng || DEFAULT_LNG;

      const map = L.map(containerRef.current!, {
        center: [centerLat, centerLng],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Marker inicial si ya hay coordenadas
      if (lat && lng) {
        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on("dragend", () => {
          const { lat: newLat, lng: newLng } = marker.getLatLng();
          onChange(
            parseFloat(newLat.toFixed(6)),
            parseFloat(newLng.toFixed(6)),
          );
        });
        markerRef.current = marker;
      }

      // Click en el mapa coloca / mueve el pin
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        const roundedLat = parseFloat(clickLat.toFixed(6));
        const roundedLng = parseFloat(clickLng.toFixed(6));

        if (markerRef.current) {
          markerRef.current.setLatLng([roundedLat, roundedLng]);
        } else {
          const marker = L.marker([roundedLat, roundedLng], {
            draggable: true,
          }).addTo(map);
          marker.on("dragend", () => {
            const { lat: dLat, lng: dLng } = marker.getLatLng();
            onChange(parseFloat(dLat.toFixed(6)), parseFloat(dLng.toFixed(6)));
          });
          markerRef.current = marker;
        }

        onChange(roundedLat, roundedLng);
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // Solo se ejecuta al montar — lat/lng iniciales se manejan abajo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar el marker si el padre cambia lat/lng externamente
  // (ej: modo edición al abrir el dialog)
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;

    import("leaflet").then((L) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        const marker = L.marker([lat, lng], { draggable: true }).addTo(
          mapRef.current,
        );
        marker.on("dragend", () => {
          const { lat: dLat, lng: dLng } = marker.getLatLng();
          onChange(parseFloat(dLat.toFixed(6)), parseFloat(dLng.toFixed(6)));
        });
        markerRef.current = marker;
      }
      mapRef.current.setView([lat, lng]);
    });
  }, [lat, lng, onChange]);

  // Re-centrar el mapa cuando cambia el distrito elegido en el form —
  // solo mientras el usuario no haya colocado un pin todavía (si ya lo
  // colocó, no le movemos la vista por debajo).
  useEffect(() => {
    if (!mapRef.current || lat || lng || !centerHint) return;
    mapRef.current.setView([centerHint.lat, centerHint.lng], DEFAULT_ZOOM);
  }, [centerHint, lat, lng]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* CSS de Leaflet */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={containerRef} className="h-full w-full rounded-md" />
      <p className="pointer-events-none absolute bottom-2 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
        Toca el mapa para colocar tu dirección
      </p>
    </div>
  );
}
