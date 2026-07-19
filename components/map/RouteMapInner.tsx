import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Waypoint {
  lat: number;
  lng: number;
}

interface RouteMapInnerProps {
  geometry: Waypoint[];
  snappedWaypoints: Waypoint[];
  showRoute: boolean;
  showMarkers: boolean;
  lineWidth: number;
  lineColor: string;
  theme: 'light' | 'dark';
  onMapClick?: (lat: number, lng: number) => void;
}

// Custom Leaflet DivIcon helpers to avoid broken PNG asset links in Next.js
const createDivIcon = (color: string, label: string) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
        <span class="absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping" style="background-color: ${color};"></span>
        <div class="relative flex items-center justify-center rounded-full border-2 border-white shadow-md text-[10px] font-bold text-white font-mono" 
             style="background-color: ${color}; width: 22px; height: 22px;">
          ${label}
        </div>
      </div>
    `,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -10]
  });
};

export default function RouteMapInner({
  geometry,
  snappedWaypoints,
  showRoute,
  showMarkers,
  lineWidth,
  lineColor,
  theme,
  onMapClick
}: RouteMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center at Can Tho City initially
    const map = L.map(mapContainerRef.current, {
      center: [10.037, 105.784],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });

    mapRef.current = map;

    // Map click handler to trigger coordinate extraction
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Open a Leaflet popup showing coordinate
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`
          <div class="text-xs p-1 font-mono text-neutral-900 leading-normal">
            <strong class="block text-teal-600 mb-0.5">Tọa độ đã chọn:</strong>
            Lat: ${lat.toFixed(6)}<br/>
            Lng: ${lng.toFixed(6)}
          </div>
        `)
        .openOn(map);

      if (onMapClick) {
        onMapClick(lat, lng);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Map Theme Tile Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    // CartoDB Monochrome Map Styles (Light / Dark)
    const url = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const layer = L.tileLayer(url, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    });

    layer.addTo(map);
    tileLayerRef.current = layer;
  }, [theme]);

  // Update Route Polyline & Markers with dynamic drawing animation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up old polyline & markers
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      map.removeLayer(endMarkerRef.current);
      endMarkerRef.current = null;
    }

    if (geometry.length === 0) return;

    // Fit bounds immediately based on full geometry so map is positioned correctly
    const latLngs = geometry.map((pt) => [pt.lat, pt.lng] as [number, number]);
    const fullPolyline = L.polyline(latLngs);
    try {
      map.fitBounds(fullPolyline.getBounds(), {
        padding: [40, 40],
        maxZoom: 16
      });
    } catch (e) {
      console.error('Lỗi khi thu phóng bản đồ:', e);
    }

    // Add Start Marker immediately if enabled
    const startPt = snappedWaypoints[0] || geometry[0];
    const endPt = snappedWaypoints[snappedWaypoints.length - 1] || geometry[geometry.length - 1];

    if (showMarkers && startPt) {
      const startMarker = L.marker([startPt.lat, startPt.lng], {
        icon: createDivIcon('#10b981', 'S') // Green for Start
      }).bindPopup(`<div class="text-xs font-semibold text-neutral-800 font-mono">Điểm Bắt Đầu (Start)<br/>${startPt.lat.toFixed(6)}, ${startPt.lng.toFixed(6)}</div>`);
      startMarker.addTo(map);
      startMarkerRef.current = startMarker;
    }

    if (!showRoute) return;

    // SPEED CONFIGURATION: Total duration of the animation in milliseconds.
    // TĂNG giá trị này để vẽ CHẬM hơn, GIẢM giá trị này để vẽ NHANH hơn.
    const TOTAL_ANIMATION_MS = 1500;
    const intervalMs = Math.max(8, Math.floor(TOTAL_ANIMATION_MS / geometry.length));

    // Initialize the line with just the starting point
    const animatedPolyline = L.polyline([[geometry[0].lat, geometry[0].lng]], {
      color: lineColor,
      weight: lineWidth,
      opacity: 0.9,
      lineJoin: 'round',
      lineCap: 'round'
    });
    animatedPolyline.addTo(map);
    polylineRef.current = animatedPolyline;

    let index = 1;
    const intervalId = setInterval(() => {
      if (index >= geometry.length) {
        clearInterval(intervalId);

        // Add End Marker when route drawing animation finishes
        if (showMarkers && endPt && endPt !== startPt) {
          const endMarker = L.marker([endPt.lat, endPt.lng], {
            icon: createDivIcon('#ef4444', 'E') // Red for End
          }).bindPopup(`<div class="text-xs font-semibold text-neutral-800 font-mono">Điểm Kết Thúc (End)<br/>${endPt.lat.toFixed(6)}, ${endPt.lng.toFixed(6)}</div>`);
          endMarker.addTo(map);
          endMarkerRef.current = endMarker;
        }
        return;
      }

      // Add points sequentially to the drawing list
      const currentSegment = geometry.slice(0, index + 1).map(pt => [pt.lat, pt.lng] as [number, number]);
      animatedPolyline.setLatLngs(currentSegment);
      index++;
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [geometry, snappedWaypoints, showRoute, showMarkers, lineColor, lineWidth]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '520px' }}>
      <div ref={mapContainerRef} className="w-full h-full rounded-lg absolute inset-0 z-10" />
      {/* Custom Styles overrides for Leaflet Dark Mode popups */}
      <style jsx global>{`
        .leaflet-container {
          background: #171717;
          font-family: inherit;
        }
        .leaflet-bar {
          border: 1px solid var(--border) !important;
          box-shadow: var(--shadow-md) !important;
        }
        .leaflet-bar a {
          background-color: #1f1f1f !important;
          color: #d4d4d4 !important;
          border-bottom: 1px solid var(--border) !important;
        }
        .leaflet-bar a:hover {
          background-color: #2e2e2e !important;
          color: #ffffff !important;
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #1f1f1f !important;
          color: #d4d4d4 !important;
          border: 1px solid #2e2e2e !important;
        }
        .leaflet-popup-close-button {
          color: #888888 !important;
        }
      `}</style>
    </div>
  );
}
