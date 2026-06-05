/** Ubicación oficial Papus BarberShop — Col. Villa Verde, Ciudad Quetzal. */

/** Plus Code corto (Google Maps). */
export const PAPUS_PLUS_CODE = 'MCXF+JC';

/** Coordenadas GPS exactas del local (Google Maps). */
export const PAPUS_LATITUDE = 14.699110980503198;
export const PAPUS_LONGITUDE = -90.5764215367986;

/** MapLibre / GeoJSON: [longitud, latitud]. */
export const PAPUS_MAP_CENTER: [number, number] = [PAPUS_LONGITUDE, PAPUS_LATITUDE];

export const PAPUS_MAP_ZOOM = 17;

export const PAPUS_ADDRESS_SHORT = 'Lote 30 Mz. F, Col. Villa Verde';

export const PAPUS_ADDRESS_FULL =
  'Lote 30 Manzana F, Colonia Villa Verde, Ciudad Quetzal, San Juan Sacatepéquez, Guatemala';

/** Abrir ubicación exacta en Google Maps (mismas coords que el mapa del sitio). */
export const PAPUS_GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${PAPUS_LATITUDE},${PAPUS_LONGITUDE}`;

/** Navegación / cómo llegar hacia las coordenadas del negocio. */
export const PAPUS_GOOGLE_MAPS_DIRECTIONS_URL =
  `https://www.google.com/maps/dir/?api=1&destination=${PAPUS_LATITUDE},${PAPUS_LONGITUDE}`;
