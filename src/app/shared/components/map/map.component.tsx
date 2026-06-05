import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import {
  PAPUS_ADDRESS_SHORT,
  PAPUS_MAP_CENTER,
  PAPUS_MAP_ZOOM
} from '../../constants/papus-location';

/** Estilo oscuro CARTO (mismo basemap que usa mapcn en tema dark). */
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export interface PapusMapProps {
  center?: [number, number];
  zoom?: number;
  businessName?: string;
  address?: string;
}

/**
 * Mapa interactivo con MapLibre GL (compatible con patrones mapcn).
 * Coordenadas en formato [longitud, latitud].
 */
export function MapComponent({
  center = PAPUS_MAP_CENTER,
  zoom = PAPUS_MAP_ZOOM,
  businessName = 'Papus BarberShop',
  address = PAPUS_ADDRESS_SHORT
}: PapusMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const [lng, lat] = center;

    const map = new maplibregl.Map({
      container,
      style: DARK_STYLE,
      center: [lng, lat],
      zoom,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    const markerEl = document.createElement('div');
    markerEl.className = 'papus-map-marker';
    markerEl.setAttribute('aria-hidden', 'true');

    const popup = new maplibregl.Popup({
      offset: 28,
      closeButton: true,
      className: 'papus-map-popup'
    }).setHTML(
      `<div class="papus-map-popup__inner">
        <strong class="papus-map-popup__title">${businessName}</strong>
        <p class="papus-map-popup__address">${address}</p>
      </div>`
    );

    const marker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    map.on('load', () => {
      map.resize();
      map.flyTo({ center: [lng, lat], zoom, duration: 800, essential: true });
      marker.togglePopup();
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom, businessName, address]);

  return <div ref={containerRef} className="papus-map-canvas" role="img" aria-label={`Mapa de ${businessName}`} />;
}
