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
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // ya inicializado

    // Carga dinámica de Leaflet para evitar errores SSR en Next.js
    import("leaflet").then((L) => {
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

      const centerLat = lat || DEFAULT_LAT;
      const centerLng = lng || DEFAULT_LNG;

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
