/**
 * Centroides de los distritos de cobertura actual (Lima Metropolitana).
 *
 * El backend (GET /geo/districts) no expone lat/lng por distrito, solo
 * id/nombre — así que mantenemos esta tabla en el cliente, únicamente
 * para centrar el mapa al elegir distrito (no es para geocodificación
 * precisa de direcciones).
 *
 * Coordenadas obtenidas de OpenStreetMap/Nominatim (mismo proveedor que
 * ya usa LocationPickerMap para los tiles), verificadas contra el
 * `pe:ubigeo` de cada distrito.
 *
 * Clave: id de distrito tal como lo devuelve GET /geo/districts.
 * Si en el futuro aparecen distritos nuevos, agregar su entrada acá —
 * mientras tanto, el mapa simplemente no re-centra y usa el centro
 * por defecto de Lima.
 */
export const DISTRICT_CENTERS: Record<string, { lat: number; lng: number }> = {
  "150104": { lat: -12.143959, lng: -77.0202681 },  // Barranco
  "150105": { lat: -12.0597004, lng: -77.0501186 }, // Breña
  "150113": { lat: -12.0781861, lng: -77.0464032 }, // Jesús María
  "150114": { lat: -12.0900959, lng: -76.9226839 }, // La Molina
  "150115": { lat: -12.0739937, lng: -77.0181966 }, // La Victoria
  "150101": { lat: -12.0550759, lng: -77.0265431 }, // Lima (Cercado)
  "150116": { lat: -12.0865675, lng: -77.036647 },  // Lince
  "150120": { lat: -12.0957149, lng: -77.0682243 }, // Magdalena del Mar
  "150122": { lat: -12.121498, lng: -77.0259064 },  // Miraflores
  "150121": { lat: -12.0766388, lng: -77.0678581 }, // Pueblo Libre
  "150130": { lat: -12.0964515, lng: -76.9956899 }, // San Borja
  "150131": { lat: -12.0979021, lng: -77.0353666 }, // San Isidro
  "150136": { lat: -12.0791136, lng: -77.0947866 }, // San Miguel
  "150140": { lat: -12.1251049, lng: -76.9821605 }, // Santiago de Surco
  "150141": { lat: -12.1141951, lng: -77.0105043 }, // Surquillo
};

export function getDistrictCenter(
  districtId: string | undefined | null,
): { lat: number; lng: number } | null {
  if (!districtId) return null;
  return DISTRICT_CENTERS[districtId] ?? null;
}
