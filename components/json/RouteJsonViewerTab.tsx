import React, { useState, useMemo } from 'react';
import { Copy, Download, MapPin, Eye, EyeOff, Check, Moon, Sun, Settings2 } from 'lucide-react';
import JsonEditor from './JsonEditor';
import RouteMap from '../map/RouteMap';
import RouteStatistics from '../statistics/RouteStatistics';

export default function RouteJsonViewerTab() {
  const [routeData, setRouteData] = useState<any>(null);
  const [showRoute, setShowRoute] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [lineWidth, setLineWidth] = useState(6);
  const [lineColor, setLineColor] = useState('#06b6d4'); // Cyan default
  const [mapTheme, setMapTheme] = useState<'light' | 'dark'>('light');
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Memoize geometry and snapped waypoints to avoid unnecessary RouteMap redraws on settings changes
  const geometry = useMemo(() => routeData?.geometry || [], [routeData]);
  const snappedWaypoints = useMemo(() => routeData?.snapped_waypoints || [], [routeData]);

  // Convert custom backend JSON coordinates to standard GeoJSON FeatureCollection
  const geojsonFeatureCollection = useMemo(() => {
    if (!routeData || !routeData.geometry) return null;

    const lineStringFeature = {
      type: 'Feature',
      properties: {
        type: 'route_geometry',
        distance: routeData.distance,
        duration: routeData.duration
      },
      geometry: {
        type: 'LineString',
        coordinates: routeData.geometry.map((pt: any) => [pt.lng, pt.lat])
      }
    };

    const waypointFeatures = (routeData.snapped_waypoints || []).map((pt: any, idx: number) => ({
      type: 'Feature',
      properties: {
        type: 'waypoint',
        name: idx === 0 ? 'Start Snap' : 'End Snap'
      },
      geometry: {
        type: 'Point',
        coordinates: [pt.lng, pt.lat]
      }
    }));

    return {
      type: 'FeatureCollection',
      features: [lineStringFeature, ...waypointFeatures]
    };
  }, [routeData]);

  const handleRender = (data: any) => {
    setRouteData(data);
    setClickedCoord(null); // Reset click coordinates on new renders
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
    link.download = `route-${routeData.roomCode || 'export'}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-content flex flex-col h-[calc(100vh-40px)] overflow-hidden" style={{ minHeight: 0 }}>
      {/* Sync with Admin Page Header */}
      <div className="admin-content-header mb-4 shrink-0">
        <div>
          <h1>Route JSON Viewer</h1>
          <p>Dán hoặc kéo thả tệp JSON thô từ backend để vẽ trực quan lộ trình trên bản đồ.</p>
        </div>
      </div>

      {/* Main Workspace Split Layout */}
      <div className="flex-1 flex flex-col xl:flex-row gap-4 overflow-hidden min-h-0">
        {/* Left Panel - Map Display (65%) */}
        <div className="xl:w-[65%] w-full h-[400px] xl:h-full relative border rounded-xl overflow-hidden shadow-sm"
             style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <RouteMap
            geometry={geometry}
            snappedWaypoints={snappedWaypoints}
            showRoute={showRoute}
            showMarkers={showMarkers}
            lineWidth={lineWidth}
            lineColor={lineColor}
            theme={mapTheme}
            onMapClick={(lat, lng) => setClickedCoord({ lat, lng })}
          />

          {/* Hover/Overlay showing clicked coordinate */}
          {clickedCoord && (
            <div className="absolute left-4 bottom-4 z-20 backdrop-blur-md border rounded-lg px-3 py-2 text-xs font-mono shadow-xl flex items-center gap-2"
                 style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              <MapPin size={13} className="text-teal-500 animate-bounce" />
              <span>Tọa độ click: <strong>{clickedCoord.lat.toFixed(6)}, {clickedCoord.lng.toFixed(6)}</strong></span>
              <button
                onClick={() => setClickedCoord(null)}
                className="ml-1 text-neutral-500 hover:text-neutral-300"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - JSON input & Statistics (35%) */}
        <div className="xl:w-[35%] w-full overflow-y-auto pr-1 space-y-4 flex flex-col justify-between shrink-0"
             style={{ minHeight: 0 }}>
          <div className="space-y-4">
            <JsonEditor onRender={handleRender} onClear={handleClear} />

            {/* Map & Line customization panel */}
            {routeData && (
              <div className="border rounded-xl p-4 space-y-3.5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <h3 className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide" style={{ color: 'var(--text)', margin: 0 }}>
                  <Settings2 size={13} style={{ color: 'var(--primary)' }} /> Tùy chỉnh hiển thị
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Toggle Show Route */}
                  <button
                    onClick={() => setShowRoute(!showRoute)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded border transition cursor-pointer"
                    style={{
                      backgroundColor: showRoute ? 'var(--primary-dim)' : 'var(--bg)',
                      borderColor: showRoute ? 'var(--primary)' : 'var(--border)',
                      color: showRoute ? 'var(--primary)' : 'var(--text-muted)'
                    }}
                  >
                    {showRoute ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>Hiển thị lộ trình</span>
                  </button>

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
                    <span>Hiển thị Marker</span>
                  </button>

                  {/* Theme Toggle (Light/Dark map) */}
                  <button
                    onClick={() => setMapTheme(mapTheme === 'light' ? 'dark' : 'light')}
                    className="flex items-center justify-center gap-2 px-2.5 py-2 rounded border transition col-span-2 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                  >
                    {mapTheme === 'light' ? (
                      <>
                        <Moon size={13} />
                        <span>Chuyển sang Bản đồ Tối (Dark)</span>
                      </>
                    ) : (
                      <>
                        <Sun size={13} />
                        <span>Chuyển sang Bản đồ Sáng (Light)</span>
                      </>
                    )}
                  </button>

                  {/* Line width slider */}
                  <div className="col-span-2 space-y-1 pt-0.5">
                    <div className="flex justify-between font-semibold text-[11px]">
                      <span style={{ color: 'var(--text-muted)' }}>Độ dày đường vẽ</span>
                      <span style={{ color: 'var(--text)' }}>{lineWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={lineWidth}
                      onChange={(e) => setLineWidth(Number(e.target.value))}
                      className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      style={{ backgroundColor: 'var(--border)' }}
                    />
                  </div>

                  {/* Line color picker */}
                  <div className="col-span-2 space-y-1 pt-0.5">
                    <div className="flex justify-between font-semibold text-[11px]">
                      <span style={{ color: 'var(--text-muted)' }}>Màu sắc đường vẽ</span>
                      <span className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>{lineColor.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={lineColor}
                        onChange={(e) => setLineColor(e.target.value)}
                        className="w-7 h-7 rounded border bg-transparent cursor-pointer overflow-hidden p-0"
                        style={{ borderColor: 'var(--border)' }}
                      />
                      <div className="flex gap-1 flex-1">
                        {['#4361ee', '#10b981', '#ef4444', '#f59e0b', '#3b82f6'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setLineColor(c)}
                            className={`w-5.5 h-5.5 rounded border transition cursor-pointer ${
                              lineColor === c ? 'border-white scale-105 shadow-md' : ''
                            }`}
                            style={{ backgroundColor: c, borderColor: 'var(--border)' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Display */}
            <RouteStatistics data={routeData} />
          </div>

          {/* GeoJSON Export panel */}
          {routeData && geojsonFeatureCollection && (
            <div className="pt-3 border-t space-y-1.5 font-sans mt-4" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[9px] font-bold block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Xuất dữ liệu bản đồ</span>
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
