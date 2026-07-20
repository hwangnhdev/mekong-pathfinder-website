'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ROUND_1_GRAPH } from '../gameData';

interface HostMapProps {
  players: any[];
}

export default function HostMap({ players }: HostMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const playerMarkersRef = useRef<Record<string, L.Marker>>({});

  // 1. Initialize Map, static edges, and static nodes
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [10.0315, 105.7785],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Use Voyager Light theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

    mapRef.current = map;

    let timerId: any = null;

    // Fit camera bounds to show from Start to End
    const start = ROUND_1_GRAPH.nodes[ROUND_1_GRAPH.startingNodeId];
    const end = ROUND_1_GRAPH.nodes[ROUND_1_GRAPH.destinationNodeId];
    if (start && end) {
      timerId = setTimeout(() => {
        if (!mapRef.current) return;
        try {
          map.invalidateSize();
          const bounds = L.latLngBounds(
            [start.lat, start.lng],
            [end.lat, end.lng]
          ).pad(0.15);
          map.fitBounds(bounds);
        } catch (e) {
          console.error('Error fitting bounds:', e);
        }
      }, 500);

      // Start node custom marker
      const startIcon = L.icon({
        iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      L.marker([start.lat, start.lng], { icon: startIcon })
        .addTo(map)
        .bindTooltip(`<b>Điểm xuất phát:</b><br>${start.name}`, { permanent: true, direction: 'top', className: 'map-label-start' });

      // End node custom marker
      const endIcon = L.icon({
        iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      L.marker([end.lat, end.lng], { icon: endIcon })
        .addTo(map)
        .bindTooltip(`<b>Điểm đích:</b><br>${end.name}`, { permanent: true, direction: 'top', className: 'map-label-end' });
    }

    // Draw all road edges once
    ROUND_1_GRAPH.edges.forEach(edge => {
      L.polyline(
        edge.geometry.map(pt => [pt.lat, pt.lng]),
        {
          color: edge.color,
          weight: 4,
          opacity: 0.4,
          dashArray: '5, 10'
        }
      ).addTo(map).bindPopup(edge.name);
    });

    // Draw all intersection nodes once
    Object.values(ROUND_1_GRAPH.nodes).forEach(node => {
      if (node.id === ROUND_1_GRAPH.startingNodeId || node.id === ROUND_1_GRAPH.destinationNodeId) return;
      L.circleMarker([node.lat, node.lng], {
        radius: 6,
        color: '#ffffff',
        fillColor: '#64748b',
        fillOpacity: 1,
        weight: 2
      }).addTo(map).bindPopup(node.name);
    });

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Update player markers when `players` array changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old player markers
    Object.values(playerMarkersRef.current).forEach(marker => marker.remove());
    playerMarkersRef.current = {};

    // Render new markers
    players.forEach((p: any) => {
      const node = ROUND_1_GRAPH.nodes[p.currentNodeId];
      if (!node) return;

      // Add a tiny random offset based on player name/id so coordinates are stable but scattered
      const seed = p.id.split('_')[1] || p.id;
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }
      const latOffset = ((hash & 0xFF) / 255 - 0.5) * 0.0003;
      const lngOffset = (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.0003;

      const playerLat = node.lat + latOffset;
      const playerLng = node.lng + lngOffset;

      const carIcon = L.divIcon({
        className: 'car-player-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25)); transform: scaleX(-1); margin-bottom: 2px;">🚗</div>
            <div style="background: rgba(15, 23, 42, 0.9); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; white-space: nowrap; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
              ${p.name}
            </div>
          </div>
        `,
        iconSize: [60, 45],
        iconAnchor: [30, 22]
      });

      const marker = L.marker([playerLat, playerLng], { icon: carIcon })
        .addTo(map)
        .bindPopup(`<strong>${p.name}</strong><br>Điểm số: ${p.score}đ`);

      playerMarkersRef.current[p.id] = marker;
    });

  }, [players]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: '100%', width: '100%', zIndex: 1, backgroundColor: '#f8fafc' }} 
    />
  );
}
