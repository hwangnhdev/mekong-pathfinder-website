import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteDetail } from '../../utils/routeUtils';

interface Waypoint {
  lat: number;
  lng: number;
}

interface RouteMapInnerProps {
  mode: 'primary' | 'alternatives' | 'compare';
  activeAltIndex: number;
  primaryRoute: RouteDetail | null;
  alternativeRoutes: RouteDetail[];
  legendVisibility: Record<string, boolean>;
  showMarkers: boolean;
  theme: 'light' | 'dark';
  onMapClick?: (lat: number, lng: number) => void;
  showCoordinates: boolean;
  animateRoute: boolean;
  animationSpeed: number; // 0.5, 1, 2, 5
  floodData?: any;
  showFlood?: boolean;
}

// Utility to format duration (ms to MM:SS or HH:MM:SS)
const formatDuration = (totalMs: number) => {
  const totalSeconds = totalMs / 1000;
  if (isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// DivIcon creation helper for start/end markers
const createDivIcon = (color: string, label: string) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
        <span class="absolute inline-flex h-full w-full rounded-full opacity-35 animate-ping" style="background-color: ${color};"></span>
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
  mode,
  activeAltIndex,
  primaryRoute,
  alternativeRoutes,
  legendVisibility,
  showMarkers,
  theme,
  onMapClick,
  showCoordinates,
  animateRoute,
  animationSpeed,
  floodData,
  showFlood = true
}: RouteMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  // Layer groups to easily manage show/hide of multiple route layers
  const routeLayersRef = useRef<L.LayerGroup | null>(null);
  const markerLayersRef = useRef<L.LayerGroup | null>(null);
  const floodLayersRef = useRef<L.LayerGroup | null>(null);
  
  // Keep track of animations to clear them properly
  const animationIntervalsRef = useRef<NodeJS.Timeout[]>([]);

  const colors = useMemo(() => ['#f97316', '#22c55e', '#a855f7', '#ec4899', '#06b6d4'], []);

  // 1. Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [10.037, 105.784],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });

    mapRef.current = map;

    // Create Layer Groups
    routeLayersRef.current = L.layerGroup().addTo(map);
    markerLayersRef.current = L.layerGroup().addTo(map);
    floodLayersRef.current = L.layerGroup().addTo(map);

    // Map click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
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

  // 2. Update Map Tile Layer based on theme
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const url = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const layer = L.tileLayer(url, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    });

    layer.addTo(map);
    tileLayerRef.current = layer;
  }, [theme]);

  // Helper to clear existing drawing animations
  const clearAnimations = () => {
    animationIntervalsRef.current.forEach(interval => clearInterval(interval));
    animationIntervalsRef.current = [];
  };

  // Clean up animations on unmount
  useEffect(() => {
    return () => clearAnimations();
  }, []);

  // 3. Render Routes and markers dynamically
  useEffect(() => {
    const map = mapRef.current;
    const rGroup = routeLayersRef.current;
    const mGroup = markerLayersRef.current;
    if (!map || !rGroup || !mGroup) return;

    // Clear old layers and animations
    rGroup.clearLayers();
    mGroup.clearLayers();
    clearAnimations();

    const visibleGeometriesForFitting: L.LatLng[] = [];

    // Filter routes to render based on active mode
    const routesToRender: { route: RouteDetail; color: string; isPrimary: boolean; legendKey: string }[] = [];

    if (mode === 'primary' && primaryRoute) {
      if (legendVisibility.primary !== false) {
        routesToRender.push({ route: primaryRoute, color: '#3b82f6', isPrimary: true, legendKey: 'primary' });
      }
    } else if (mode === 'alternatives') {
      alternativeRoutes.forEach((alt, idx) => {
        const legendKey = `alt${idx}`;
        if (legendVisibility[legendKey] !== false) {
          const color = colors[idx % colors.length];
          routesToRender.push({ route: alt, color, isPrimary: false, legendKey });
        }
      });
    } else if (mode === 'compare') {
      if (primaryRoute && legendVisibility.primary !== false) {
        routesToRender.push({ route: primaryRoute, color: '#3b82f6', isPrimary: true, legendKey: 'primary' });
      }
      alternativeRoutes.forEach((alt, idx) => {
        const legendKey = `alt${idx}`;
        if (legendVisibility[legendKey] !== false) {
          const color = colors[idx % colors.length];
          routesToRender.push({ route: alt, color, isPrimary: false, legendKey });
        }
      });
    }

    if (routesToRender.length === 0) return;

    // Helper to draw markers for a route
    const drawMarkersForRoute = (route: RouteDetail, startColor: string, endColor: string) => {
      if (!showMarkers || route.geometry.length === 0) return;
      const start = route.geometry[0];
      const end = route.geometry[route.geometry.length - 1];

      // Start Marker
      const startMarker = L.marker([start.lat, start.lng], {
        icon: createDivIcon(startColor, 'S')
      }).bindPopup(`<div class="text-xs font-semibold text-neutral-800 font-mono">Điểm đầu (${route.name})<br/>${start.lat.toFixed(6)}, ${start.lng.toFixed(6)}</div>`);
      startMarker.addTo(mGroup);

      // End Marker
      if (route.geometry.length > 1) {
        const endMarker = L.marker([end.lat, end.lng], {
          icon: createDivIcon(endColor, 'E')
        }).bindPopup(`<div class="text-xs font-semibold text-neutral-800 font-mono">Điểm cuối (${route.name})<br/>${end.lat.toFixed(6)}, ${end.lng.toFixed(6)}</div>`);
        endMarker.addTo(mGroup);
      }
    };

    // Draw each route
    routesToRender.forEach(({ route, color, isPrimary, legendKey }) => {
      if (route.geometry.length === 0) return;

      // Determine width and opacity based on highlights and modes
      let standardWidth = 6;
      let opacity = 0.9;

      if (mode === 'alternatives') {
        const idx = alternativeRoutes.findIndex(r => r.id === route.id);
        const isHighlighted = idx === activeAltIndex;
        standardWidth = isHighlighted ? 7 : 4;
        opacity = isHighlighted ? 0.95 : 0.25;
      } else if (mode === 'compare') {
        standardWidth = isPrimary ? 8 : 4.5;
        opacity = isPrimary ? 0.95 : 0.55;
      }

      // Add coordinates to camera fitting list if this route is active/highlighted or comparing
      const shouldFitThisRoute = 
        mode === 'compare' || 
        (mode === 'primary' && isPrimary) || 
        (mode === 'alternatives' && alternativeRoutes.findIndex(r => r.id === route.id) === activeAltIndex);

      if (shouldFitThisRoute) {
        route.geometry.forEach(pt => {
          visibleGeometriesForFitting.push(L.latLng(pt.lat, pt.lng));
        });
      }

      // Helper to add hover popups & coordinate points
      const setupInteractiveRoute = (polyline: L.Polyline) => {
        // Z-Index priority: Primary always sits above others in compare
        if (isPrimary && mode === 'compare') {
          polyline.bringToFront();
        }

        // Hover events
        polyline.on('mouseover', (e: L.LeafletMouseEvent) => {
          polyline.setStyle({
            weight: standardWidth + 3,
            opacity: 1.0
          });

          L.popup()
            .setLatLng(e.latlng)
            .setContent(`
              <div class="text-xs p-1 font-sans text-neutral-900 leading-normal">
                <strong class="block text-blue-600 font-bold mb-0.5" style="color: ${color};">${route.name}</strong>
                <b>Khoảng cách:</b> ${(route.distance / 1000).toFixed(2)} km<br/>
                <b>Thời gian:</b> ${formatDuration(route.duration)}<br/>
                <b>Số toạ độ:</b> ${route.geometry.length.toLocaleString()} điểm
              </div>
            `)
            .openOn(map);
        });

        polyline.on('mouseout', () => {
          polyline.setStyle({
            weight: standardWidth,
            opacity: opacity
          });
        });

        // Click focus map bounds to this route
        polyline.on('click', () => {
          const bounds = polyline.getBounds();
          map.fitBounds(bounds, { padding: [40, 40] });
        });
      };

      // Draw coordinates as interactive clickable circle dots if enabled
      const drawCoordinateDots = (geom: Waypoint[], routeName: string = '') => {
        if (!showCoordinates) return;
        geom.forEach((pt, idx) => {
          const dotMarker = L.circleMarker([pt.lat, pt.lng], {
            radius: 4.5,
            fillColor: color,
            color: '#ffffff',
            weight: 1.5,
            fillOpacity: 0.95
          }).addTo(rGroup);

          dotMarker.bindPopup(`
            <div class="text-xs p-1 font-mono text-neutral-900 leading-normal" style="min-width: 170px;">
              <strong class="block text-teal-600 font-sans font-bold text-xs mb-0.5">📍 Hạt tọa độ #${idx + 1}</strong>
              ${routeName ? `<span class="block text-[11px] text-neutral-500 font-sans mb-1">${routeName}</span>` : ''}
              <hr class="my-1 border-neutral-200" />
              <b>Lat:</b> ${pt.lat}<br/>
              <b>Lng:</b> ${pt.lng}<br/>
              <div class="mt-1 pt-1 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500 font-sans">
                <span>Vị trí mảng (Index):</span>
                <strong class="font-mono text-teal-600 text-xs">${idx}</strong>
              </div>
            </div>
          `);

          dotMarker.on('click', () => {
            if (onMapClick) {
              onMapClick(pt.lat, pt.lng);
            }
          });
        });
      };

      // Draw markers
      const startMarkerColor = isPrimary ? '#3b82f6' : color;
      drawMarkersForRoute(route, startMarkerColor, '#ef4444');

      if (animateRoute) {
        // ANIMATED DRAWING MODE
        // Speed scaling
        const BASE_DURATION = 1500; // base ms
        const animDuration = BASE_DURATION / animationSpeed;
        const intervalMs = Math.max(4, Math.floor(animDuration / route.geometry.length));

        // Create animated path
        const animatedPolyline = L.polyline([[route.geometry[0].lat, route.geometry[0].lng]], {
          color,
          weight: standardWidth,
          opacity,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(rGroup);

        setupInteractiveRoute(animatedPolyline);

        let index = 1;
        const intervalId = setInterval(() => {
          if (index >= route.geometry.length) {
            clearInterval(intervalId);
            // Draw points at coordinates if checked
            drawCoordinateDots(route.geometry, route.name);
            return;
          }

          const currentCoords = route.geometry.slice(0, index + 1).map(pt => [pt.lat, pt.lng] as [number, number]);
          animatedPolyline.setLatLngs(currentCoords);
          index++;
        }, intervalMs);

        animationIntervalsRef.current.push(intervalId);
      } else {
        // INSTANT DRAWING MODE
        const polyline = L.polyline(
          route.geometry.map(pt => [pt.lat, pt.lng] as [number, number]),
          {
            color,
            weight: standardWidth,
            opacity,
            lineJoin: 'round',
            lineCap: 'round'
          }
        ).addTo(rGroup);

        setupInteractiveRoute(polyline);
        drawCoordinateDots(route.geometry, route.name);
      }
    });

    // 4. Fit map camera view to active routes
    if (visibleGeometriesForFitting.length > 0) {
      try {
        const bounds = L.latLngBounds(visibleGeometriesForFitting);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15
        });
      } catch (e) {
        console.error('Lỗi khi fitBounds:', e);
      }
    }

  }, [mode, activeAltIndex, primaryRoute, alternativeRoutes, legendVisibility, showMarkers, showCoordinates, animateRoute, animationSpeed]);

  // 4. Render Flood Zones
  useEffect(() => {
    const map = mapRef.current;
    const fGroup = floodLayersRef.current;
    if (!map || !fGroup) return;

    fGroup.clearLayers();

    if (!showFlood || !floodData) return;

    try {
      if (floodData.type === 'geojson') {
        const geojson = L.geoJSON(floodData.data, {
          style: (feature) => {
            const color = feature?.properties?.color || '#ef4444';
            const fillColor = feature?.properties?.fillColor || '#ef4444';
            const fillOpacity = feature?.properties?.fillOpacity !== undefined ? feature?.properties?.fillOpacity : 0.35;
            return {
              color,
              weight: 2,
              fillColor,
              fillOpacity,
              dashArray: '4, 4'
            };
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties?.name || feature.properties?.description) {
              const name = feature.properties.name || "Vùng ngập lụt";
              const desc = feature.properties.description || "Độ sâu ngập đáng báo động.";
              layer.bindPopup(`<strong>${name}</strong><br/>${desc}`);
            } else {
              layer.bindPopup(`<strong>Khu vực ngập nước</strong><br/>Cảnh báo hạn chế di chuyển qua đây.`);
            }
          }
        }).addTo(fGroup);

        const bounds = geojson.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      } else if (floodData.type === 'polygon') {
        const latlngs = floodData.coordinates.map((pt: any) => [pt.lat, pt.lng]);
        const polygon = L.polygon(latlngs, {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.35,
          weight: 2,
          dashArray: '4, 4'
        }).addTo(fGroup).bindPopup('<strong>Khu vực ngập nước</strong><br/>Cảnh báo hạn chế di chuyển.');

        map.fitBounds(polygon.getBounds(), { padding: [50, 50], maxZoom: 15 });
      }
    } catch (err) {
      console.error("Lỗi khi vẽ vùng ngập lụt:", err);
    }
  }, [floodData, showFlood]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '520px' }}>
      <div ref={mapContainerRef} className="w-full h-full rounded-lg absolute inset-0 z-10" />
      {/* Custom Styles overrides */}
      <style jsx global>{`
        .leaflet-container {
          background: #171717;
          font-family: inherit;
        }
        .leaflet-bar {
          border: 1px solid var(--border) !important;
          box-shadow: var(--shadow-md) !important;
          z-index: 20 !important;
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
