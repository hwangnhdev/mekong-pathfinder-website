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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    mapRef.current = map;

    // Fit camera bounds to show from Start to End
    const start = ROUND_1_GRAPH.nodes[ROUND_1_GRAPH.startingNodeId];
    const end = ROUND_1_GRAPH.nodes[ROUND_1_GRAPH.destinationNodeId];
    if (start && end) {
      const bounds = L.latLngBounds(
        [start.lat, start.lng],
        [end.lat, end.lng]
      ).pad(0.2);
      map.fitBounds(bounds);
    }

    // Draw all road edges once
    ROUND_1_GRAPH.edges.forEach(edge => {
      L.polyline(
        edge.geometry.map(pt => [pt.lat, pt.lng]),
        {
          color: edge.color,
          weight: 4,
          opacity: 0.3,
          dashArray: '5, 10'
        }
      ).addTo(map).bindPopup(edge.name);
    });

    // Draw all intersection nodes once
    Object.values(ROUND_1_GRAPH.nodes).forEach(node => {
      L.circleMarker([node.lat, node.lng], {
        radius: 6,
        color: '#ffffff',
        fillColor: '#1e293b',
        fillOpacity: 1,
        weight: 2
      }).addTo(map).bindPopup(node.name);
    });

    return () => {
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

    // Gold marker icon for players
    const playerIcon = new L.Icon({
      iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-gold.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Group players by node
    const playersByNode: Record<string, any[]> = {};
    players.forEach(p => {
      if (!playersByNode[p.currentNodeId]) {
        playersByNode[p.currentNodeId] = [];
      }
      playersByNode[p.currentNodeId].push(p);
    });

    // Clear old player markers
    Object.values(playerMarkersRef.current).forEach(marker => marker.remove());
    playerMarkersRef.current = {};

    // Render new markers
    Object.entries(playersByNode).forEach(([nodeId, group]) => {
      const node = ROUND_1_GRAPH.nodes[nodeId];
      if (!node) return;

      const popupContent = `
        <div style="color: #000; font-family: sans-serif; font-size: 13px; line-height: 1.4;">
          <strong style="display:block; margin-bottom:4px; font-weight:bold; color: #1e293b;">📍 ${node.name}</strong>
          <ul style="margin: 0; padding-left: 14px; color: #4b5563;">
            ${group.map(p => `<li><strong>${p.name}</strong> (${p.score}đ)</li>`).join('')}
          </ul>
        </div>
      `;

      const marker = L.marker([node.lat, node.lng], { icon: playerIcon })
        .addTo(map)
        .bindPopup(popupContent);

      playerMarkersRef.current[nodeId] = marker;
    });

  }, [players]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: '100%', width: '100%', zIndex: 1, backgroundColor: '#0f172a' }} 
    />
  );
}
