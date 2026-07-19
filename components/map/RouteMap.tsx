import React from 'react';
import dynamic from 'next/dynamic';

interface Waypoint {
  lat: number;
  lng: number;
}

interface RouteMapProps {
  geometry: Waypoint[];
  snappedWaypoints: Waypoint[];
  showRoute: boolean;
  showMarkers: boolean;
  lineWidth: number;
  lineColor: string;
  theme: 'light' | 'dark';
  onMapClick?: (lat: number, lng: number) => void;
}

// Dynamically import the leaflet inner map with ssr disabled
const RouteMapInner = dynamic(() => import('./RouteMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 font-medium font-sans" style={{ minHeight: '520px' }}>
      <div className="text-center space-y-2">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">Đang tải bản đồ tương tác...</p>
      </div>
    </div>
  )
});

export default function RouteMap(props: RouteMapProps) {
  return <RouteMapInner {...props} />;
}
