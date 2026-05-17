"use client";

/**
 * AllyMapLeaflet
 * Mapa de seguimiento del ally usando Leaflet + OpenStreetMap (sin API key).
 *
 * - El marcador del ally se actualiza en tiempo real sin recargar el mapa.
 * - La polyline de la ruta se dibuja cuando está disponible (GET /route).
 * - El marcador del destino es fijo (domicilio del cliente).
 *
 * Se carga únicamente en el cliente (SSR: false) porque Leaflet necesita `window`.
 */

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import polylineCodec from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";

// ── Fix de íconos de Leaflet en bundlers (webpack/turbopack) ─────────────────
// Leaflet intenta cargar los íconos desde /node_modules, lo que falla con Next.js.
// Se redefinen manualmente usando CDN de unpkg.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Íconos personalizados ─────────────────────────────────────────────────────

const allyIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 36px; height: 36px;
      background: #4f46e5;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(79,70,229,0.5);
      display: flex; align-items: center; justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/>
        <circle cx="12" cy="16" r="1"/><circle cx="20" cy="16" r="1"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

const destIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 32px; height: 32px;
      background: #16a34a;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(22,163,74,0.5);
      display: flex; align-items: center; justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// ── Helper: recentrar el mapa cuando cambia la posición del ally ─────────────

interface RecenterProps {
  lat: number;
  lng: number;
}

function RecenterOnMove({ lat, lng }: RecenterProps) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

// ── Helper: actualizar marcador sin desmontar el componente ───────────────────

interface DynamicMarkerProps {
  lat: number;
  lng: number;
  icon: L.DivIcon;
  popupText: string;
}

function DynamicMarker({ lat, lng, icon, popupText }: DynamicMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      ref={markerRef}
    >
      <Popup>{popupText}</Popup>
    </Marker>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export interface AllyMapLeafletProps {
  /** Posición actual del ally (se actualiza con polling) */
  allyLat: number;
  allyLng: number;
  /** Posición fija del destino (domicilio del cliente) */
  destLat: number;
  destLng: number;
  /** Encoded polyline de Google (opcional, viene de GET /route) */
  polyline?: string | null;
}

export function AllyMapLeaflet({
  allyLat,
  allyLng,
  destLat,
  destLng,
  polyline,
}: AllyMapLeafletProps) {
  // Decodificar polyline → array de [lat, lng] para Leaflet
  const routePositions: [number, number][] = polyline
    ? polylineCodec.decode(polyline).map(([lat, lng]) => [lat, lng])
    : [];

  return (
    <MapContainer
      center={[allyLat, allyLng]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "280px", width: "100%", borderRadius: "0.75rem" }}
      className="z-0"
    >
      {/* Tiles OpenStreetMap — sin API key */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Recentrar suavemente cuando el ally se mueve */}
      <RecenterOnMove lat={allyLat} lng={allyLng} />

      {/* Marcador del ally (se mueve con useEffect interno) */}
      <DynamicMarker
        lat={allyLat}
        lng={allyLng}
        icon={allyIcon}
        popupText="Tu especialista"
      />

      {/* Marcador fijo del destino */}
      <DynamicMarker
        lat={destLat}
        lng={destLng}
        icon={destIcon}
        popupText="Tu domicilio"
      />

      {/* Polyline de la ruta (si está disponible) */}
      {routePositions.length > 0 && (
        <Polyline
          positions={routePositions}
          pathOptions={{ color: "#4f46e5", weight: 4, opacity: 0.8 }}
        />
      )}
    </MapContainer>
  );
}
