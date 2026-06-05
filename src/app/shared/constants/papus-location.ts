/** Ubicación oficial Papus BarberShop — Col. Villa Verde, Ciudad Quetzal. */

/** Plus Code corto (Google Maps). */
export const PAPUS_PLUS_CODE = 'MCXF+JC';

/** Coordenadas decodificadas del Plus Code (centro del área ~14×14 m). */
export const PAPUS_LATITUDE = 14.6990625;
export const PAPUS_LONGITUDE = -90.5764375;

/** MapLibre / GeoJSON: [longitud, latitud]. */
export const PAPUS_MAP_CENTER: [number, number] = [PAPUS_LONGITUDE, PAPUS_LATITUDE];

export const PAPUS_MAP_ZOOM = 17;

export const PAPUS_ADDRESS_SHORT = 'Lote 30 Mz. F, Col. Villa Verde';

export const PAPUS_ADDRESS_FULL =
  'Lote 30 Manzana F, Colonia Villa Verde, Ciudad Quetzal, San Juan Sacatepéquez, Guatemala';

export const PAPUS_GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${PAPUS_PLUS_CODE} Ciudad Quetzal Guatemala`)}`;
