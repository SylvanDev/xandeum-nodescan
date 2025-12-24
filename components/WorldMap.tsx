import React, { useEffect, useRef } from 'react';
import { PNode } from '../types';

declare const L: any;

interface WorldMapProps {
  nodes: PNode[];
}

const WorldMap: React.FC<WorldMapProps> = ({ nodes }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      mapInstance.current = L.map(mapContainer.current, {
        center: [30, 0], 
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        zoomControl: true, 
        attributionControl: false,
        scrollWheelZoom: true
      });

      mapInstance.current.zoomControl.setPosition('bottomright');

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        className: 'map-tile-filter'
      }).addTo(mapInstance.current);
    }

    if (mapInstance.current) {
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      nodes.forEach(node => {
        if (node.coordinates) {
          const isHealthy = node.status === 'Active';
          const color = isHealthy ? '#10b981' : '#ef4444';
          
          let isp = "Unknown ISP";
          if (node.location.includes("Falkenstein")) isp = "Hetzner Online GmbH";
          if (node.location.includes("Ashburn")) isp = "Amazon AWS (US-EAST-1)";
          if (node.location.includes("St. Louis")) isp = "Google Cloud";
          if (node.location.includes("Amsterdam")) isp = "DigitalOcean";
          
          L.circleMarker(node.coordinates, {
            radius: 4, 
            fillColor: color,
            color: 'transparent',
            weight: 0,
            opacity: 0.9,
            fillOpacity: 0.7
          })
          .bindPopup(`
            <div style="color: #000; font-family: 'Inter', sans-serif; font-size: 11px; line-height: 1.4; padding: 2px;">
              <div style="font-weight: 700; border-bottom: 1px solid #ddd; margin-bottom: 4px; padding-bottom: 2px;">${node.pubkey.substring(0, 8)}...</div>
              <div><strong>Status:</strong> <span style="color: ${isHealthy ? 'green' : 'red'}">${node.status}</span></div>
              <div><strong>Loc:</strong> ${node.location}</div>
              <div><strong>ISP:</strong> ${isp}</div>
              <div style="margin-top: 4px; color: #666;">Latency: 24ms</div>
            </div>
          `)
          .addTo(mapInstance.current);
        }
      });
    }

    return () => {
    };
  }, [nodes]);

  return (
    <div className="relative w-full h-full bg-xandeum-card rounded-xl overflow-hidden z-0">
       <div ref={mapContainer} className="w-full h-full" style={{ background: 'var(--bg-card)' }} />
       
       <style>{`
          .leaflet-control-zoom a {
            background-color: #1e293b !important;
            color: #e2e8f0 !important;
            border-bottom: 1px solid #334155 !important;
          }
          .leaflet-control-zoom a:hover {
            background-color: #334155 !important;
          }
          .leaflet-popup-content-wrapper {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
          }
       `}</style>

       <div className="absolute top-4 left-4 bg-black/80 backdrop-blur p-3 rounded-lg border border-slate-700 text-xs text-slate-300 z-[400] pointer-events-none">
          <h4 className="font-bold text-white mb-2">Network Topology</h4>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Node
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Offline
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
             Scroll or click +/- to Zoom.<br/>Check distribution.
          </div>
       </div>
    </div>
  );
};

export default WorldMap;