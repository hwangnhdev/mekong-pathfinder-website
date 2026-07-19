import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface Waypoint {
  lat: number;
  lng: number;
}

interface RouteData {
  distance?: number;
  duration?: number;
  geometry?: Waypoint[];
  snapped_waypoints?: Waypoint[];
}

interface RouteStatisticsProps {
  data: RouteData | null;
}

export default function RouteStatistics({ data }: RouteStatisticsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!data) return null;

  const distanceKm = data.distance ? (data.distance / 1000).toFixed(2) : '0.00';
  
  // Format duration (milliseconds to HH:MM:SS or MM:SS)
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

  const durationStr = data.duration ? formatDuration(data.duration) : '00:00';
  const pointCount = data.geometry?.length || 0;
  
  const startPt = data.snapped_waypoints?.[0] || data.geometry?.[0];
  const endPt = data.snapped_waypoints?.[data.snapped_waypoints.length - 1] || data.geometry?.[pointCount - 1];

  const formatCoord = (pt?: Waypoint) => {
    if (!pt) return '—';
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

  return (
    <div className="border rounded-xl p-4.5 space-y-4 font-sans text-left" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Thống kê lộ trình</h3>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl border transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <span className="block mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Khoảng cách</span>
          <strong className="text-base font-extrabold" style={{ color: 'var(--text)' }}>{distanceKm} km</strong>
        </div>
        
        <div className="p-3 rounded-xl border transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <span className="block mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Thời gian di chuyển</span>
          <strong className="text-base font-extrabold" style={{ color: 'var(--text)' }}>{durationStr}</strong>
        </div>

        <div className="p-3 rounded-xl border col-span-2 transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <span className="block mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Số lượng điểm tọa độ</span>
          <strong className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>{pointCount.toLocaleString()} điểm</strong>
        </div>

        {/* Start Point Card with copy button */}
        <div className="p-3 rounded-xl border col-span-2 flex justify-between items-center transition-all duration-200" 
             style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div>
            <span className="block mb-1 font-semibold text-neutral-500" style={{ color: 'var(--text-muted)' }}>Điểm bắt đầu (Start)</span>
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
             style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div>
            <span className="block mb-1 font-semibold text-neutral-500" style={{ color: 'var(--text-muted)' }}>Điểm kết thúc (End)</span>
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
