'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ROUND_1_GRAPH, FLOOD_DATA } from '../gameData';

interface CompareMapProps {
  optimalEdges: string[];
  playerEdges: string[] | null;
  playerName: string | null;
}

export default function CompareMap({ optimalEdges, playerEdges, playerName }: CompareMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const startEndMarkersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [10.025, 105.76],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

    // Render flood segments from flood.json
    if (FLOOD_DATA && FLOOD_DATA.features) {
      FLOOD_DATA.features.forEach((feature: any) => {
        if (feature.geometry && feature.geometry.type === 'LineString') {
          const latLngs = feature.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          const color = feature.properties?.color || '#ef4444';
          const name = feature.properties?.name || 'Điểm ngập';
          const desc = feature.properties?.description || 'Khu vực bị ảnh hưởng bởi triều cường/mưa lớn.';

          L.polyline(latLngs, {
            color: color,
            weight: 7,
            opacity: 0.75,
            dashArray: '6, 8'
          }).addTo(map).bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <strong style="color: ${color}; font-size: 13px;">🌊 ${name}</strong><br/>
              <span style="font-size: 11px; color: #475569;">${desc}</span>
            </div>
          `);
        }
      });
    }

    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old polylines
    polylinesRef.current.forEach(pl => map.removeLayer(pl));
    polylinesRef.current = [];
    startEndMarkersRef.current.forEach(m => map.removeLayer(m));
    startEndMarkersRef.current = [];

    const bounds = L.latLngBounds([]);

    // 1. Draw optimal edges
    optimalEdges.forEach(edgeId => {
      const edge = ROUND_1_GRAPH.edges.find(e => e.id === edgeId);
      if (!edge) return;
      
      const polyline = L.polyline(
        edge.geometry.map(pt => [pt.lat, pt.lng]),
        { color: '#10b981', weight: 8, opacity: 0.8 }
      ).addTo(map).bindTooltip(`Tối ưu: ${edge.name}`, { sticky: true });
      
      polylinesRef.current.push(polyline);
      
      edge.geometry.forEach(pt => bounds.extend([pt.lat, pt.lng]));
    });

    // 2. Draw player edges if selected
    if (playerEdges && playerEdges.length > 0) {
      playerEdges.forEach(edgeId => {
        const edge = ROUND_1_GRAPH.edges.find(e => e.id === edgeId);
        if (!edge) return;

        const isAlsoOptimal = optimalEdges.includes(edgeId);
        
        const polyline = L.polyline(
          edge.geometry.map(pt => [pt.lat, pt.lng]),
          { 
            color: isAlsoOptimal ? '#f59e0b' : '#ef4444', 
            weight: isAlsoOptimal ? 4 : 8, 
            opacity: 0.9, 
            dashArray: isAlsoOptimal ? '10, 10' : undefined 
          }
        ).addTo(map).bindTooltip(`${playerName}: ${edge.name}`, { sticky: true });
        
        polylinesRef.current.push(polyline);
        
        edge.geometry.forEach(pt => bounds.extend([pt.lat, pt.lng]));
      });
    }

    // 3. Draw Start/End markers
    const startNode = ROUND_1_GRAPH.nodes[ROUND_1_GRAPH.startingNodeId];
    const destNode = ROUND_1_GRAPH.nodes[ROUND_1_GRAPH.destinationNodeId];
    
    if (startNode) {
      const startIcon = L.icon({
        iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41]
      });
      const startMarker = L.marker([startNode.lat, startNode.lng], { icon: startIcon })
        .addTo(map).bindTooltip(`Xuất phát: ${startNode.name}`, { direction: 'top', className: 'map-label-start' });
      startEndMarkersRef.current.push(startMarker);
    }

    if (destNode) {
      const endIcon = L.icon({
        iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41]
      });
      const endMarker = L.marker([destNode.lat, destNode.lng], { icon: endIcon })
        .addTo(map).bindTooltip(`Đích đến: ${destNode.name}`, { direction: 'top', className: 'map-label-end' });
      startEndMarkersRef.current.push(endMarker);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
    }

  }, [optimalEdges.join(','), playerEdges?.join(','), playerName]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(0,0,0,0.1)' }} 
    />
  );
}
