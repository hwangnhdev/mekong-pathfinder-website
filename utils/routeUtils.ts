export interface Waypoint {
  lat: number;
  lng: number;
}

export interface RouteDetail {
  id: string;
  name: string;
  distance: number; // in meters or km
  duration: number; // in seconds
  geometry: Waypoint[];
}

/**
 * Normalizes a coordinate point from object format or array format to a standard Waypoint.
 * Handles:
 * - [lng, lat] or [lat, lng] (determines position based on typical Vietnam coordinate ranges)
 * - { lat, lng } / { latitude, longitude } / { lat, lon }
 */
export function normalizeWaypoint(pt: any): Waypoint | null {
  if (!pt) return null;
  
  let lat: number | undefined;
  let lng: number | undefined;

  if (Array.isArray(pt)) {
    if (pt.length >= 2) {
      // Determine which value is latitude and longitude based on coordinate values for Vietnam (Lat ~10, Lng ~105)
      if (Math.abs(pt[0]) > Math.abs(pt[1])) {
        // e.g. [105.7706, 10.0298] -> [lng, lat]
        lng = Number(pt[0]);
        lat = Number(pt[1]);
      } else {
        // e.g. [10.0298, 105.7706] -> [lat, lng]
        lat = Number(pt[0]);
        lng = Number(pt[1]);
      }
    }
  } else if (typeof pt === 'object') {
    lat = pt.lat !== undefined ? Number(pt.lat) : (pt.latitude !== undefined ? Number(pt.latitude) : undefined);
    lng = pt.lng !== undefined ? Number(pt.lng) : (pt.longitude !== undefined ? Number(pt.longitude) : (pt.lon !== undefined ? Number(pt.lon) : undefined));
  }

  if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
    return { lat, lng };
  }
  return null;
}

/**
 * Parses the primary route from the raw backend JSON data.
 * Supports:
 * - Custom format (geometry at root)
 * - OSRM format (routes array at root, routes[0] is primary)
 */
export function parsePrimaryRoute(data: any): RouteDetail | null {
  if (!data) return null;

  let rawRoute: any = null;
  if (Array.isArray(data.routes) && data.routes.length > 0) {
    rawRoute = data.routes[0];
  } else if (data.geometry && Array.isArray(data.geometry)) {
    rawRoute = data;
  }

  if (!rawRoute || !rawRoute.geometry || !Array.isArray(rawRoute.geometry) || rawRoute.geometry.length === 0) {
    return null;
  }

  const geometry: Waypoint[] = rawRoute.geometry
    .map((pt: any) => normalizeWaypoint(pt))
    .filter((pt: any): pt is Waypoint => pt !== null);

  if (geometry.length === 0) return null;

  return {
    id: 'primary',
    name: 'Tuyến chính (Primary)',
    distance: rawRoute.distance || 0,
    duration: rawRoute.duration || 0,
    geometry
  };
}

/**
 * Parses all alternative routes from the raw backend JSON data.
 * Supports:
 * - Custom format (alternatives array at root)
 * - OSRM format (routes array at root, routes[1..N] are alternatives)
 */
export function parseAlternativeRoutes(data: any): RouteDetail[] {
  if (!data) return [];

  // OSRM format: alternative routes are routes[1..N]
  if (Array.isArray(data.routes) && data.routes.length > 1) {
    return data.routes.slice(1).map((alt: any, idx: number) => {
      const geometry: Waypoint[] = Array.isArray(alt.geometry)
        ? alt.geometry.map((pt: any) => normalizeWaypoint(pt)).filter((pt: any): pt is Waypoint => pt !== null)
        : [];

      return {
        id: `alt-${idx}`,
        name: `Tuyến phụ #${idx + 1} (Alternative #${idx + 1})`,
        distance: alt.distance || 0,
        duration: alt.duration || 0,
        geometry
      };
    });
  }

  // Custom format: alternatives are alternatives[]
  if (Array.isArray(data.alternatives)) {
    return data.alternatives.map((alt: any, idx: number) => {
      const geometry: Waypoint[] = Array.isArray(alt.geometry)
        ? alt.geometry.map((pt: any) => normalizeWaypoint(pt)).filter((pt: any): pt is Waypoint => pt !== null)
        : [];

      return {
        id: `alt-${idx}`,
        name: `Tuyến phụ #${idx + 1} (Alternative #${idx + 1})`,
        distance: alt.distance || 0,
        duration: alt.duration || 0,
        geometry
      };
    });
  }

  return [];
}

/**
 * Computes LatLng bounding box boundaries for a single route or list of coordinates.
 */
export function getRouteBounds(geometry: Waypoint[]): [[number, number], [number, number]] | null {
  if (!geometry || geometry.length === 0) return null;
  
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  geometry.forEach(pt => {
    if (pt.lat < minLat) minLat = pt.lat;
    if (pt.lat > maxLat) maxLat = pt.lat;
    if (pt.lng < minLng) minLng = pt.lng;
    if (pt.lng > maxLng) maxLng = pt.lng;
  });

  return [
    [minLat, minLng],
    [maxLat, maxLng]
  ];
}

/**
 * Parses flood zone JSON data which can be a GeoJSON object or a list of coordinates.
 */
export function parseFloodData(rawJson: string): any {
  if (!rawJson.trim()) return null;
  const parsed = JSON.parse(rawJson);
  
  // 1. GeoJSON (FeatureCollection, Feature, etc.)
  if (parsed.type === 'FeatureCollection' || parsed.type === 'Feature' || parsed.type === 'GeometryCollection') {
    return { type: 'geojson', data: parsed };
  }
  
  // 2. Flat array of coordinate shapes (single polygon)
  if (Array.isArray(parsed)) {
    const normalized = parsed.map(pt => normalizeWaypoint(pt)).filter((pt): pt is Waypoint => pt !== null);
    if (normalized.length > 0) {
      return { type: 'polygon', coordinates: normalized };
    }
  }

  // 3. Object with coordinates key
  if (parsed.coordinates && Array.isArray(parsed.coordinates)) {
    const normalized = parsed.coordinates.map((pt: any) => normalizeWaypoint(pt)).filter((pt: any): pt is Waypoint => pt !== null);
    return { type: 'polygon', coordinates: normalized };
  }

  throw new Error("Không thể nhận diện định dạng dữ liệu ngập. Vui lòng cung cấp GeoJSON chuẩn hoặc danh sách tọa độ polygon.");
}
