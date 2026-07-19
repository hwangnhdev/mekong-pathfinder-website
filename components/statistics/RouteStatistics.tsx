import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';
import { RouteDetail } from '../../utils/routeUtils';

interface Waypoint {
  lat: number;
  lng: number;
}

interface RouteStatisticsProps {
  mode: 'primary' | 'alternatives' | 'compare';
  activeAltIndex: number;
  primaryRoute: RouteDetail | null;
  alternativeRoutes: RouteDetail[];
  activeRoute: RouteDetail | null;
  snappedWaypoints?: Waypoint[];
}

export default function RouteStatistics({
  mode,
  activeAltIndex,
  primaryRoute,
  alternativeRoutes,
  activeRoute,
  snappedWaypoints = []
}: RouteStatisticsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!activeRoute && mode !== 'compare') return null;
  if (mode === 'compare' && !primaryRoute) return null;

  // Formatting helpers
  const formatDistance = (meters: number) => (meters / 1000).toFixed(2);

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

  const getHumanFriendlyDuration = (totalMs: number) => {
    const totalSeconds = totalMs / 1000;
    if (isNaN(totalSeconds) || totalSeconds <= 0) return '0 phút';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs} giờ ${mins} phút`;
    }
    return `${mins} phút`;
  };

  const formatCoord = (pt?: any) => {
    if (!pt || typeof pt.lat !== 'number' || typeof pt.lng !== 'number') return '—';
    return `${pt.lat.toFixed(6)}, ${pt.lng.toFixed(6)}`;
  };

  const handleCopyCoord = async (pt: Waypoint | undefined, field: string) => {
    if (!pt) return;
    const coordStr = `${pt.lat.toFixed(6)},${pt.lng.toFixed(6)}`;
    try {
      await navigator.clipboard.writeText(coordStr);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {}
  };

  if (mode === 'compare') {
    return (
      <div className="border rounded-xl p-4.5 space-y-4 font-sans text-left" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-500" style={{ color: 'var(--primary)' }}>Bảng So Sánh Tuyến Đường</h3>
        
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-xs text-left" style={{ color: 'var(--text)' }}>
            <thead className="text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <tr>
                <th className="p-3">Tuyến đường</th>
                <th className="p-3 text-right">Khoảng cách</th>
                <th className="p-3 text-right">Thời gian</th>
                <th className="p-3 text-right">Số điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {primaryRoute && (
                <tr className="font-bold" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <td className="p-3 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
                    {primaryRoute.name}
                  </td>
                  <td className="p-3 text-right">{formatDistance(primaryRoute.distance)} km</td>
                  <td className="p-3 text-right">{formatDuration(primaryRoute.duration)}</td>
                  <td className="p-3 text-right">{primaryRoute.geometry.length.toLocaleString()}</td>
                </tr>
              )}
              {alternativeRoutes.map((alt, idx) => {
                const colors = ['#f97316', '#22c55e', '#a855f7', '#ec4899', '#06b6d4'];
                const color = colors[idx % colors.length];
                return (
                  <tr key={alt.id} style={{ borderLeft: `4px solid ${color}`, color: 'var(--text-muted)' }}>
                    <td className="p-3 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                      {alt.name}
                    </td>
                    <td className="p-3 text-right">{formatDistance(alt.distance)} km</td>
                    <td className="p-3 text-right">{formatDuration(alt.duration)}</td>
                    <td className="p-3 text-right">{alt.geometry.length.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Single Route View Mode (Primary or Alternative)
  const distanceKm = formatDistance(activeRoute!.distance);
  const durationStr = formatDuration(activeRoute!.duration);
  const humanDuration = getHumanFriendlyDuration(activeRoute!.duration);
  const pointCount = activeRoute!.geometry.length;
  
  const startPt = snappedWaypoints[0] || activeRoute!.geometry[0];
  const endPt = snappedWaypoints[snappedWaypoints.length - 1] || activeRoute!.geometry[pointCount - 1];

  return (
    <div className="border rounded-xl p-4.5 space-y-4 font-sans text-left" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
        Chi tiết: {activeRoute!.name}
      </h3>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl border transition-all duration-200" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
          <span className="block mb-1 font-semibold text-[10px]" style={{ color: 'var(--text-muted)' }}>Khoảng cách</span>
          <strong className="text-base font-extrabold" style={{ color: 'var(--text)' }}>{distanceKm} km</strong>
        </div>
        
        <div className="p-3 rounded-xl border transition-all duration-200" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
          <span className="block mb-1 font-semibold text-[10px]" style={{ color: 'var(--text-muted)' }}>Thời gian di chuyển</span>
          <strong className="text-base font-extrabold" style={{ color: 'var(--text)' }}>{durationStr}</strong>
        </div>

        <div className="p-3 rounded-xl border transition-all duration-200" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
          <span className="block mb-1 font-semibold text-[10px]" style={{ color: 'var(--text-muted)' }}>Ước tính thời gian</span>
          <strong className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>{humanDuration}</strong>
        </div>

        <div className="p-3 rounded-xl border transition-all duration-200" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
          <span className="block mb-1 font-semibold text-[10px]" style={{ color: 'var(--text-muted)' }}>Số lượng điểm tọa độ</span>
          <strong className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>{pointCount.toLocaleString()} điểm</strong>
        </div>

        {/* Start Point Card with copy button */}
        <div className="p-3 rounded-xl border col-span-2 flex justify-between items-center transition-all duration-200" 
             style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
          <div>
            <span className="block mb-1 font-semibold text-neutral-500 text-[10px]" style={{ color: 'var(--text-muted)' }}>Điểm bắt đầu (Start)</span>
            <code className="text-xs font-mono font-bold" style={{ color: 'var(--primary)' }}>{formatCoord(startPt)}</code>
          </div>
          {startPt && (
            <button
              onClick={() => handleCopyCoord(startPt, 'start')}
              className="p-2 rounded-lg border hover:bg-neutral-800/10 transition cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
            >
              {copiedField === 'start' ? (
                <Check size={13} className="text-teal-500" />
              ) : (
                <Clipboard size={13} style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
          )}
        </div>

        {/* End Point Card with copy button */}
        <div className="p-3 rounded-xl border col-span-2 flex justify-between items-center transition-all duration-200" 
             style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
          <div>
            <span className="block mb-1 font-semibold text-neutral-500 text-[10px]" style={{ color: 'var(--text-muted)' }}>Điểm kết thúc (End)</span>
            <code className="text-xs font-mono font-bold" style={{ color: '#ef4444' }}>{formatCoord(endPt)}</code>
          </div>
          {endPt && (
            <button
              onClick={() => handleCopyCoord(endPt, 'end')}
              className="p-2 rounded-lg border hover:bg-neutral-800/10 transition cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
            >
              {copiedField === 'end' ? (
                <Check size={13} className="text-teal-500" />
              ) : (
                <Clipboard size={13} style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
