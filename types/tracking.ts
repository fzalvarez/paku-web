/**
 * Tipos del dominio de tracking de órdenes activas.
 */

export interface LocationPoint {
  lat: number;
  lng: number;
  accuracy_m: number | null;
  recorded_at: string | null;
}

export interface TrackingCurrent {
  order_id: string;
  order_status: string;
  /** Null hasta que el groomer envía su primera posición */
  groomer_location: LocationPoint | null;
  destination: LocationPoint;
  staleness_seconds: number | null;
}

export interface TrackingRoute {
  order_id: string;
  groomer_location: LocationPoint | null;
  destination: LocationPoint;
  eta_seconds: number | null;
  eta_display: string | null;
  polyline: string | null;
  distance_meters: number | null;
}
