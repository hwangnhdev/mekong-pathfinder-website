'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GameNode, GameEdge, ROUND_1_GRAPH } from '../gameData';

interface MobileMapProps {
  currentNode: GameNode;
  availableEdges: GameEdge[];
  pathHistory: string[];
  playerChoice: string | null;
}

export default function MobileMap({ currentNode, availableEdges, pathHistory, playerChoice }: MobileMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylinesRef = useRef<L.Polyline[]>([]);

  // 1. Initialize Map on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentNode.lat, currentNode.lng],
      zoom: 17,
      zoomControl: false,
      attributionControl: false
    });

    // Use Voyager Light theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. React to prop changes (Center Map and Draw Paths)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Fly camera smoothly to player's current node
    map.flyTo([currentNode.lat, currentNode.lng], 17, { animate: true, duration: 1 });

    // Clear old marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add marker for current node
    const customIcon = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    markerRef.current = L.marker([currentNode.lat, currentNode.lng], { icon: customIcon })
      .addTo(map);

    // Clear old polylines
    polylinesRef.current.forEach(p => p.remove());
    polylinesRef.current = [];

    // Draw Start and End Markers if they exist
    const startNode = ROUND_1_GRAPH.nodes[ROUND_1_GRAPH.startingNodeId];
    const endNode = ROUND_1_GRAPH.nodes[ROUND_1_GRAPH.destinationNodeId];
    if (startNode) {
      const startIcon = L.icon({
        iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      const startMarker = L.marker([startNode.lat, startNode.lng], { icon: startIcon })
        .addTo(map)
        .bindTooltip(`<b>Điểm đầu:</b><br>${startNode.name}`, { permanent: true, direction: 'top', className: 'map-label-start' });
      
      polylinesRef.current.push(startMarker as any);
    }
    if (endNode) {
      const endIcon = L.icon({
        iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      const endMarker = L.marker([endNode.lat, endNode.lng], { icon: endIcon })
        .addTo(map)
        .bindTooltip(`<b>Điểm cuối:</b><br>${endNode.name}`, { permanent: true, direction: 'top', className: 'map-label-end' });
      
      polylinesRef.current.push(endMarker as any);
    }

    // Draw past chosen paths (edges in pathHistory) as SOLID polylines
    pathHistory.forEach(edgeId => {
      const edge = ROUND_1_GRAPH.edges.find(e => e.id === edgeId);
      if (!edge) return;

      const polyline = L.polyline(
        edge.geometry.map(pt => [pt.lat, pt.lng]),
        {
          color: '#3b82f6',
          weight: 6,
          opacity: 0.9,
          // Solid line! (dashArray is undefined)
        }
      ).addTo(map).bindPopup(`${edge.name} (Đã chọn)`);
      
      polylinesRef.current.push(polyline);
    });

    // Draw upcoming choices
    availableEdges.forEach(edge => {
      const isSelected = playerChoice === edge.id;
      const hasChosenAny = playerChoice !== null;
      
      const polyline = L.polyline(
        edge.geometry.map(pt => [pt.lat, pt.lng]),
        {
          color: edge.color,
          weight: 6,
          opacity: hasChosenAny ? (isSelected ? 1.0 : 0.2) : 0.8,
          dashArray: isSelected ? undefined : '10, 10' // Solid if selected, dotted if not
        }
      ).addTo(map).bindPopup(edge.name);
      
      polylinesRef.current.push(polyline);
    });

  }, [currentNode.id, pathHistory.join(','), playerChoice]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: '180px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(0,0,0,0.06)' }} 
    />
  );
}
