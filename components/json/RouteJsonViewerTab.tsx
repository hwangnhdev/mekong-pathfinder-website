import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Download, MapPin, Eye, EyeOff, Check, Moon, Sun, Settings2, Sparkles, HelpCircle, AlertTriangle } from 'lucide-react';
import JsonEditor from './JsonEditor';
import RouteMap from '../map/RouteMap';
import RouteStatistics from '../statistics/RouteStatistics';
import { parsePrimaryRoute, parseAlternativeRoutes, normalizeWaypoint, parseFloodData, RouteDetail } from '../../utils/routeUtils';

export default function RouteJsonViewerTab() {
  const [routeData, setRouteData] = useState<any>(null);
  
  // Flood Zone Data states
  const [floodJsonText, setFloodJsonText] = useState('');
  const [floodData, setFloodData] = useState<any>(null);
  const [floodError, setFloodError] = useState<string | null>(null);
  const [showFlood, setShowFlood] = useState(true);

  // Custom Comparison View Modes
  const [viewMode, setViewMode] = useState<'primary' | 'alternatives' | 'compare'>('primary');
  const [activeAltIndex, setActiveAltIndex] = useState<number>(0);
  const [legendVisibility, setLegendVisibility] = useState<Record<string, boolean>>({
    primary: true,
    alt0: true,
    alt1: true,
    alt2: true,
    alt3: true,
    alt4: true
  });

  // Settings
  const [showMarkers, setShowMarkers] = useState(true);
  const [mapTheme, setMapTheme] = useState<'light' | 'dark'>('light');
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Bonus Features Settings
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [animateRoute, setAnimateRoute] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // 0.5, 1, 2, 5

  const colors = useMemo(() => ['#f97316', '#22c55e', '#a855f7', '#ec4899', '#06b6d4'], []);

  // Parse Routes using reusable utilities (Memoized to prevent performance lags with large datasets)
  const primaryRoute = useMemo(() => parsePrimaryRoute(routeData), [routeData]);
  const alternativeRoutes = useMemo(() => parseAlternativeRoutes(routeData), [routeData]);

  // Determine active route for statistics display
  const activeRoute = useMemo(() => {
    if (viewMode === 'primary') return primaryRoute;
    if (viewMode === 'alternatives') return alternativeRoutes[activeAltIndex] || null;
    return null; // Compare All mode will display the comparison table
  }, [viewMode, activeAltIndex, primaryRoute, alternativeRoutes]);

  const snappedWaypoints = useMemo(() => {
    // 1. Try custom snapped_waypoints
    let raw = routeData?.snapped_waypoints;
    if (Array.isArray(raw)) {
      return raw.map((pt: any) => normalizeWaypoint(pt)).filter((pt: any): pt is any => pt !== null);
    }
    
    // 2. Try standard OSRM waypoints
    raw = routeData?.waypoints;
    if (Array.isArray(raw)) {
      return raw
        .map((wp: any) => wp.location ? normalizeWaypoint(wp.location) : normalizeWaypoint(wp))
        .filter((pt: any): pt is any => pt !== null);
    }
    
    return [];
  }, [routeData]);

  // Reset indices on new route data uploads
  useEffect(() => {
    setActiveAltIndex(0);
    setLegendVisibility({
      primary: true,
      alt0: true,
      alt1: true,
      alt2: true,
      alt3: true,
      alt4: true
    });
  }, [routeData]);

  const toggleLegendVisibility = (key: string) => {
    setLegendVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Convert routes dynamically to GeoJSON for copying and exporting
  const geojsonFeatureCollection = useMemo(() => {
    if (!routeData) return null;

    const features: any[] = [];

    // Export based on active view mode
    if (viewMode === 'primary' && primaryRoute) {
      features.push({
        type: 'Feature',
        properties: {
          name: primaryRoute.name,
          type: 'primary_route',
          distance: primaryRoute.distance,
          duration: primaryRoute.duration
        },
        geometry: {
          type: 'LineString',
          coordinates: primaryRoute.geometry.map(pt => [pt.lng, pt.lat])
        }
      });
    } else if (viewMode === 'alternatives' && alternativeRoutes[activeAltIndex]) {
      const alt = alternativeRoutes[activeAltIndex];
      features.push({
        type: 'Feature',
        properties: {
          name: alt.name,
          type: 'alternative_route',
          distance: alt.distance,
          duration: alt.duration
        },
        geometry: {
          type: 'LineString',
          coordinates: alt.geometry.map(pt => [pt.lng, pt.lat])
        }
      });
    } else if (viewMode === 'compare') {
      if (primaryRoute) {
        features.push({
          type: 'Feature',
          properties: {
            name: primaryRoute.name,
            type: 'primary_route',
            distance: primaryRoute.distance,
            duration: primaryRoute.duration
          },
          geometry: {
            type: 'LineString',
            coordinates: primaryRoute.geometry.map(pt => [pt.lng, pt.lat])
          }
        });
      }
      alternativeRoutes.forEach((alt, idx) => {
        features.push({
          type: 'Feature',
          properties: {
            name: alt.name,
            type: 'alternative_route',
            distance: alt.distance,
            duration: alt.duration
          },
          geometry: {
            type: 'LineString',
            coordinates: alt.geometry.map(pt => [pt.lng, pt.lat])
          }
        });
      });
    }

    // Add snapped waypoints if they exist
    if (routeData.snapped_waypoints && routeData.snapped_waypoints.length > 0) {
      routeData.snapped_waypoints.forEach((pt: any, idx: number) => {
        features.push({
          type: 'Feature',
          properties: {
            type: 'waypoint',
            name: idx === 0 ? 'Start Snap' : 'End Snap'
          },
          geometry: {
            type: 'Point',
            coordinates: [pt.lng, pt.lat]
          }
        });
      });
    }

    return {
      type: 'FeatureCollection',
      features
    };
  }, [routeData, viewMode, activeAltIndex, primaryRoute, alternativeRoutes]);

  const handleRender = (data: any) => {
    setRouteData(data);
    setClickedCoord(null);
  };

  const handleClear = () => {
    setRouteData(null);
    setClickedCoord(null);
  };

  const handleCopyGeoJson = async () => {
    if (!geojsonFeatureCollection) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(geojsonFeatureCollection, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  const handleDownloadGeoJson = () => {
    if (!geojsonFeatureCollection) return;
    const blob = new Blob([JSON.stringify(geojsonFeatureCollection, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `route-${viewMode}-${routeData.roomCode || 'export'}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-content flex flex-col h-[calc(100vh-40px)] overflow-hidden animate-fadeIn" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="admin-content-header mb-4 shrink-0 flex justify-between items-center">
        <div>
          <h1>Route JSON Viewer</h1>
          <p>Dán hoặc kéo thả tệp JSON thô từ backend để vẽ trực quan lộ trình trên bản đồ.</p>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col xl:flex-row gap-4 overflow-hidden min-h-0">
        
        {/* Map Panel (65%) */}
        <div className="xl:w-[65%] w-full h-[400px] xl:h-full relative border rounded-xl overflow-hidden shadow-sm"
             style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          
          {/* 1. Mode Segmented Controls Bar (Top Left) */}
          {routeData && (
            <div className="absolute top-4 left-4 z-20 flex items-center bg-neutral-900/95 border border-neutral-800 p-1.5 rounded-lg shadow-xl backdrop-blur-md"
                 style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'var(--border)' }}>
              <div style={{ display: 'flex', backgroundColor: 'var(--bg)', borderRadius: '6px', padding: '2px', gap: '4px' }}>
                {[
                  { key: 'primary', label: 'Tuyến chính' },
                  { key: 'alternatives', label: 'Tuyến phụ' },
                  { key: 'compare', label: 'So sánh tất cả' }
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setViewMode(m.key as any)}
                    style={{
                      backgroundColor: viewMode === m.key ? 'var(--primary)' : 'transparent',
                      color: viewMode === m.key ? '#fff' : 'var(--text-muted)',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Alt dropdown visible in alternatives mode */}
              {viewMode === 'alternatives' && alternativeRoutes.length > 0 && (
                <div className="flex items-center gap-1 animate-fadeIn">
                  <select
                    value={activeAltIndex}
                    onChange={(e) => setActiveAltIndex(Number(e.target.value))}
                    className="bg-neutral-850 text-xs px-2 py-1 rounded border border-neutral-700 text-white cursor-pointer font-semibold outline-none"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    {alternativeRoutes.map((alt, idx) => (
                      <option key={alt.id} value={idx}>Alt #{idx + 1}</option>
                    ))}
                  </select>
                  
                  {/* Prev / Next controls */}
                  <button
                    onClick={() => setActiveAltIndex(prev => Math.max(0, prev - 1))}
                    disabled={activeAltIndex === 0}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-white"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                  >
                    &larr;
                  </button>
                  <button
                    onClick={() => setActiveAltIndex(prev => Math.min(alternativeRoutes.length - 1, prev + 1))}
                    disabled={activeAltIndex === alternativeRoutes.length - 1}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-white"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                  >
                    &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Legend / Filters Box (Top Right) */}
          {routeData && (
            <div className="absolute top-4 right-4 z-20 bg-neutral-900/95 border border-neutral-800 p-3 rounded-lg shadow-xl backdrop-blur-md max-w-[200px]"
                 style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <span className="text-[10px] font-bold block uppercase tracking-wider mb-2 text-neutral-400" style={{ color: 'var(--text-muted)' }}>Chú giải / Lọc tuyến</span>
              <div className="space-y-2 text-[11px] font-semibold">
                {/* Primary Route */}
                {primaryRoute && (viewMode === 'primary' || viewMode === 'compare') && (
                  <div
                    onClick={() => toggleLegendVisibility('primary')}
                    className="flex items-center gap-1.5 cursor-pointer select-none transition hover:opacity-80"
                    style={{ opacity: legendVisibility.primary ? 1 : 0.4 }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
                    <span className={legendVisibility.primary ? '' : 'line-through'} style={{ color: 'var(--text)' }}>Primary Route</span>
                  </div>
                )}
                
                {/* Alternatives */}
                {(viewMode === 'alternatives' || viewMode === 'compare') && alternativeRoutes.map((alt, idx) => {
                  const legendKey = `alt${idx}`;
                  const color = colors[idx % colors.length];
                  
                  if (viewMode === 'alternatives' && idx !== activeAltIndex) return null;

                  return (
                    <div
                      key={alt.id}
                      onClick={() => toggleLegendVisibility(legendKey)}
                      className="flex items-center gap-1.5 cursor-pointer select-none transition hover:opacity-80"
                      style={{ opacity: legendVisibility[legendKey] ? 1 : 0.4 }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                      <span className={legendVisibility[legendKey] ? '' : 'line-through'} style={{ color: 'var(--text)' }}>Alternative #{idx + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Map Component */}
          <RouteMap
            mode={viewMode}
            activeAltIndex={activeAltIndex}
            primaryRoute={primaryRoute}
            alternativeRoutes={alternativeRoutes}
            legendVisibility={legendVisibility}
            showMarkers={showMarkers}
            theme={mapTheme}
            showCoordinates={showCoordinates}
            animateRoute={animateRoute}
            animationSpeed={animationSpeed}
            onMapClick={(lat, lng) => setClickedCoord({ lat, lng })}
            floodData={floodData}
            showFlood={showFlood}
          />

          {/* Click Coordinate Popup Overlay */}
          {clickedCoord && (
            <div className="absolute left-4 bottom-4 z-20 backdrop-blur-md border rounded-lg px-3 py-2 text-xs font-mono shadow-xl flex items-center gap-2"
                 style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              <MapPin size={13} className="text-teal-500 animate-bounce" />
              <span>Tọa độ click: <strong>{clickedCoord.lat.toFixed(6)}, {clickedCoord.lng.toFixed(6)}</strong></span>
              <button
                onClick={() => setClickedCoord(null)}
                className="ml-1 text-neutral-500 hover:text-neutral-300 font-bold"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Controls (35%) */}
        <div className="xl:w-[35%] w-full overflow-y-auto pr-1 space-y-4 flex flex-col justify-between shrink-0"
             style={{ minHeight: 0 }}>
          
          <div className="space-y-4">
            <JsonEditor onRender={handleRender} onClear={handleClear} />

            {/* Flood JSON Input Editor */}
            <div className="border rounded-xl p-4 space-y-3 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-center mb-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide" style={{ color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={13} className="text-red-500" style={{ color: '#ef4444' }} /> Vùng ngập nước (Flood JSON)
                </h3>
                {floodData && (
                  <button
                    onClick={() => {
                      setFloodData(null);
                      setFloodJsonText('');
                      setFloodError(null);
                    }}
                    style={{
                      fontSize: '10px',
                      color: '#ef4444',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      padding: 0
                    }}
                  >
                    Xoá vùng ngập
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                  value={floodJsonText}
                  onChange={(e) => {
                    setFloodJsonText(e.target.value);
                    setFloodError(null);
                  }}
                  placeholder='Dán GeoJSON vùng ngập lụt hoặc mảng toạ độ polygon...
Ví dụ:
[
  {"lat": 10.035, "lng": 105.780},
  {"lat": 10.040, "lng": 105.782},
  {"lat": 10.038, "lng": 105.785}
]'
                  className="w-full h-24 font-mono text-[10px] p-2.5 rounded-lg focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                    lineHeight: '1.4',
                    border: '1px solid var(--border)'
                  }}
                />
                
                {floodError && (
                  <p style={{ fontSize: '10px', color: '#ef4444', fontWeight: '600', margin: 0 }}>{floodError}</p>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      try {
                        if (!floodJsonText.trim()) {
                          setFloodError("Vui lòng nhập dữ liệu.");
                          return;
                        }
                        const data = parseFloodData(floodJsonText);
                        setFloodData(data);
                        setFloodError(null);
                      } catch (err: any) {
                        setFloodError(err.message || "Lỗi cú pháp JSON.");
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    Vẽ vùng ngập
                  </button>
                  
                  {floodData && (
                    <button
                      onClick={() => setShowFlood(!showFlood)}
                      style={{
                        padding: '8px 14px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid var(--border)',
                        backgroundColor: showFlood ? 'var(--primary-dim)' : 'var(--bg)',
                        color: showFlood ? 'var(--primary)' : 'var(--text-muted)'
                      }}
                    >
                      {showFlood ? "Ẩn" : "Hiện"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Customization Controls Panel */}
            {routeData && (
              <div className="border rounded-xl p-4 space-y-3.5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <h3 className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide" style={{ color: 'var(--text)', margin: 0 }}>
                  <Settings2 size={13} style={{ color: 'var(--primary)' }} /> Cấu hình hiển thị
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Toggle Show Markers */}
                  <button
                    onClick={() => setShowMarkers(!showMarkers)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded border transition cursor-pointer"
                    style={{
                      backgroundColor: showMarkers ? 'var(--primary-dim)' : 'var(--bg)',
                      borderColor: showMarkers ? 'var(--primary)' : 'var(--border)',
                      color: showMarkers ? 'var(--primary)' : 'var(--text-muted)'
                    }}
                  >
                    {showMarkers ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>Hiển thị Marker (S/E)</span>
                  </button>

                  {/* Theme Switcher */}
                  <button
                    onClick={() => setMapTheme(mapTheme === 'light' ? 'dark' : 'light')}
                    className="flex items-center gap-2 px-2.5 py-2 rounded border transition cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                  >
                    {mapTheme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
                    <span>Bản đồ {mapTheme === 'light' ? 'Tối (Dark)' : 'Sáng (Light)'}</span>
                  </button>

                  {/* Show Coordinates Checkbox */}
                  <div className="col-span-2 flex items-center gap-2 py-1 px-1 select-none">
                    <input
                      type="checkbox"
                      id="show-coords-checkbox"
                      checked={showCoordinates}
                      onChange={(e) => setShowCoordinates(e.target.checked)}
                      className="rounded border border-neutral-700 w-4 h-4 cursor-pointer accent-teal-500"
                    />
                    <label htmlFor="show-coords-checkbox" className="text-xs cursor-pointer font-semibold text-neutral-300" style={{ color: 'var(--text)' }}>
                      Vẽ các điểm hạt tọa độ (Coordinate dots)
                    </label>
                  </div>

                  {/* Animate Route Drawing Checkbox */}
                  <div className="col-span-2 flex items-center gap-2 py-1 px-1 select-none border-t border-neutral-800/40" style={{ borderColor: 'var(--border)' }}>
                    <input
                      type="checkbox"
                      id="animate-route-checkbox"
                      checked={animateRoute}
                      onChange={(e) => setAnimateRoute(e.target.checked)}
                      className="rounded border border-neutral-700 w-4 h-4 cursor-pointer accent-teal-500"
                    />
                    <label htmlFor="animate-route-checkbox" className="text-xs cursor-pointer font-semibold text-neutral-300 flex items-center gap-1" style={{ color: 'var(--text)' }}>
                      <Sparkles size={12} className="text-teal-400 animate-pulse" />
                      <span>Hoạt ảnh vẽ đường lũy tiến</span>
                    </label>
                  </div>

                  {/* Speed Multiplier slider */}
                  {animateRoute && (
                    <div className="col-span-2 space-y-1.5 px-1 py-1.5 animate-fadeIn border-t border-neutral-800/20" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex justify-between font-semibold text-[11px] text-neutral-400" style={{ color: 'var(--text-muted)' }}>
                        <span>Tốc độ chạy hoạt ảnh</span>
                        <span className="text-teal-400 font-bold">{animationSpeed}x</span>
                      </div>
                      <div className="flex gap-2">
                        {[0.5, 1, 2, 5].map(s => (
                          <button
                            key={s}
                            onClick={() => setAnimationSpeed(s)}
                            className="flex-1 py-1 text-[10px] font-bold rounded border cursor-pointer transition"
                            style={{
                              backgroundColor: animationSpeed === s ? 'var(--primary)' : 'var(--bg)',
                              borderColor: animationSpeed === s ? 'var(--primary)' : 'var(--border)',
                              color: animationSpeed === s ? '#fff' : 'var(--text-muted)'
                            }}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Statistics Panel */}
            <RouteStatistics
              mode={viewMode}
              activeAltIndex={activeAltIndex}
              primaryRoute={primaryRoute}
              alternativeRoutes={alternativeRoutes}
              activeRoute={activeRoute}
              snappedWaypoints={snappedWaypoints}
            />
          </div>

          {/* Export Panel */}
          {routeData && geojsonFeatureCollection && (
            <div className="pt-3 border-t space-y-1.5 font-sans mt-4 shrink-0" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[9px] font-bold block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Xuất dữ liệu bản đồ ({viewMode === 'compare' ? 'Gộp tất cả' : 'Đơn lẻ'})
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={handleCopyGeoJson}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded border transition cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  {isCopied ? <Check size={12} className="text-teal-400" /> : <Copy size={12} />}
                  <span>{isCopied ? 'Đã sao chép' : 'Sao chép GeoJSON'}</span>
                </button>
                <button
                  onClick={handleDownloadGeoJson}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded font-bold transition cursor-pointer"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff'
                  }}
                >
                  <Download size={12} />
                  <span>Tải GeoJSON</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
