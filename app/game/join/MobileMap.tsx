'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GameNode, GameEdge } from '../gameData';

interface MobileMapProps {
  currentNode: GameNode;
  availableEdges: GameEdge[];
}

export default function MobileMap({ currentNode, availableEdges }: MobileMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylinesRef = useRef<L.Polyline[]>([]);

  // 1. Initialize Map on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentNode.lat, currentNode.lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

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
    map.flyTo([currentNode.lat, currentNode.lng], 16, { animate: true, duration: 1 });

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
      .addTo(map)
      .bindPopup('Bạn đang ở đây')
      .openPopup();

    // Clear old polylines
    polylinesRef.current.forEach(p => p.remove());
    polylinesRef.current = [];

    // Draw upcoming road choices as dotted polylines
    availableEdges.forEach(edge => {
      const polyline = L.polyline(
        edge.geometry.map(pt => [pt.lat, pt.lng]),
        {
          color: edge.color,
          weight: 6,
          opacity: 0.8,
          dashArray: '10, 10'
        }
      ).addTo(map).bindPopup(edge.name);
      
      polylinesRef.current.push(polyline);
    });

  }, [currentNode, availableEdges]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }} 
    />
  );
}
