import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface GisMiniMapProps {
  currentTarget?: {
    id: string;
    class: string;
    confidence: number;
    status: string;
    position: { lat: string; lon: string };
    heading?: string;
    location_status?: string;
    location_note?: string;
    telemetry_source?: string;
  };
  target?: any;
  allTargets?: Array<{
    id: string;
    class: string;
    confidence: number;
    position: { lat: string; lon: string };
    location_status?: string;
    telemetry_source?: string;
  }>;
  selectedTargetIdx?: number;
  onSelectTarget?: (index: number) => void;
  className?: string;
  onExpand?: () => void;
}

// Coordinate string parser: "7.8220° N" -> 7.8220
function parseCoord(coordStr: string, isLat: boolean): number {
  if (!coordStr) return isLat ? 7.8220 : 77.4847;
  const num = parseFloat(coordStr.replace(/[^\d.-]/g, ''));
  if (isNaN(num)) return isLat ? 7.8220 : 77.4847;
  if (coordStr.includes('S') || coordStr.includes('W')) return -num;
  return num;
}

// Available GIS Basemaps tailored for marine hydrography
const MAP_LAYERS = [
  {
    id: 'satellite',
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri World Imagery'
  },
  {
    id: 'seabed',
    name: 'Seabed / Ocean View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri Ocean Basemap'
  },
  {
    id: 'tactical',
    name: 'Tactical Nautical (Dark)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: 'CartoDB Dark Matter'
  }
];

export const GisMiniMap: React.FC<GisMiniMapProps> = ({
  currentTarget: propCurrentTarget,
  target,
  allTargets = [],
  selectedTargetIdx = 0,
  onSelectTarget,
  className = '',
  onExpand
}) => {
  const currentTarget = propCurrentTarget || target || {
    id: 'TGT-001',
    class: 'Target',
    confidence: 0.9,
    status: 'Pending',
    position: { lat: '7.8220° N', lon: '77.4847° E' }
  };
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const trajectoryLayerRef = useRef<L.Polyline | null>(null);

  const [activeLayerIdx, setActiveLayerIdx] = useState<number>(0); // Default to Satellite View
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  const lat = parseCoord(currentTarget?.position?.lat, true);
  const lon = parseCoord(currentTarget?.position?.lon, false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 11,
        zoomControl: false, // Use custom tactical zoom controls matching UI
        attributionControl: false
      });

      // Add Base Tile Layer
      const initialLayer = MAP_LAYERS[activeLayerIdx];
      const tileLayer = L.tileLayer(initialLayer.url, {
        maxZoom: 18,
        minZoom: 6
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Group for markers and callouts
      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Tile Layer when user switches
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const currentConfig = MAP_LAYERS[activeLayerIdx];
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const newTileLayer = L.tileLayer(currentConfig.url, {
      maxZoom: 18,
      minZoom: 6
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [activeLayerIdx]);

  // Update Map Position, Markers, Trajectory, and Labels
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    // Smoothly pan to new target coordinates in the Indian Ocean
    map.flyTo([lat, lon], 11.5, {
      animate: true,
      duration: 1.0
    });

    markersGroup.clearLayers();

    // 1. AUV Survey Trajectory Polyline
    // Start track from coastal deployment base at Kanyakumari heading south into Indian Ocean survey swath
    const auvTrackPoints: L.LatLngExpression[] = [
      [8.080, 77.550], // Kanyakumari Launch Base (Southern Tip of India)
      [7.960, 77.510], // Oceanic Waypoint Alpha
      [lat, lon]       // Active Debris Survey Swath (Indian Ocean)
    ];

    const trajectory = L.polyline(auvTrackPoints, {
      color: '#0284c7',
      weight: 2.5,
      dashArray: '5, 4',
      opacity: 0.85
    }).addTo(markersGroup);

    trajectoryLayerRef.current = trajectory;

    // 2. Trajectory Direction Arrow Vector
    const arrowIcon = L.divIcon({
      className: 'auv-arrow-marker',
      html: `
        <div style="transform: rotate(155deg);" class="flex items-center justify-center">
          <svg class="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_#22d3ee]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 20l8-4 8 4z"/>
          </svg>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([7.960, 77.510], { icon: arrowIcon, interactive: false }).addTo(markersGroup);

    // 3. Geographic Label: Kanyakumari (Southern Peninsular Base)
    const coastalBaseLabel = L.divIcon({
      className: 'coastal-base-label',
      html: `
        <div class="flex items-center gap-1.5 whitespace-nowrap pointer-events-none select-none">
          <span class="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]"></span>
          <span class="text-[11px] font-bold text-slate-100 tracking-wider font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            Kanyakumari (Peninsular Base)
          </span>
        </div>
      `,
      iconSize: [140, 20],
      iconAnchor: [4, 10]
    });
    L.marker([8.085, 77.550], { icon: coastalBaseLabel, interactive: false }).addTo(markersGroup);

    // 4. Geographic Label: Indian Ocean
    const oceanLabel = L.divIcon({
      className: 'sea-label',
      html: `
        <div class="text-[12px] font-mono uppercase font-semibold tracking-widest text-sky-200/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] pointer-events-none select-none flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          <span>Indian Ocean</span>
        </div>
      `,
      iconSize: [130, 20],
      iconAnchor: [65, 10]
    });
    L.marker([7.740, 77.420], { icon: oceanLabel, interactive: false }).addTo(markersGroup);

    // 5. Render All Secondary Debris Targets on Map (if multiple detected)
    if (allTargets && allTargets.length > 0) {
      allTargets.forEach((target, idx) => {
        if (idx === selectedTargetIdx) return; // Active target is handled separately below

        const tLat = parseCoord(target.position.lat, true);
        const tLon = parseCoord(target.position.lon, false);

        const secondaryIcon = L.divIcon({
          className: `target-pin-${idx}`,
          html: `
            <div class="cursor-pointer group flex items-center justify-center relative" title="${target.id}: ${target.class}">
              <div class="w-6 h-6 rounded-full bg-[#07192f]/90 border-2 border-amber-400/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span class="font-mono text-[10px] font-bold text-amber-300">#${idx + 1}</span>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const m = L.marker([tLat, tLon], { icon: secondaryIcon }).addTo(markersGroup);
        if (onSelectTarget) {
          m.on('click', () => onSelectTarget(idx));
        }
      });
    }

    // 6. Active Primary Target Pin 'A' (with radar ping halo & callout card)
    const activePinIcon = L.divIcon({
      className: 'primary-detection-pin',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer">
          <!-- Outer glowing radar ping halo -->
          <div class="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping pointer-events-none"></div>
          <div class="absolute w-6 h-6 rounded-full border border-cyan-400/60 animate-pulse pointer-events-none"></div>
          <!-- Pin Circle matching reference image -->
          <div class="w-6 h-6 rounded-full bg-[#0284c7] border-2 border-white flex items-center justify-center shadow-[0_0_12px_#0284c7] z-10">
            <span class="font-sans font-bold text-[11px] text-white">A</span>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([lat, lon], { icon: activePinIcon, zIndexOffset: 1000 }).addTo(markersGroup);

    // 7. Detection Pin Callout Card with honest geolocation uncertainty & telemetry provenance (Gap 8)
    const locStatus = currentTarget.location_status || 'ESTIMATED';
    const telemSource = currentTarget.telemetry_source || 'SIMULATED TELEMETRY';
    const locNote = currentTarget.location_note || 'Position uncertainty unavailable';

    const calloutIcon = L.divIcon({
      className: 'pin-callout-card',
      html: `
        <div class="bg-[#050e1c]/95 border border-[#1f3f68] rounded-md px-2.5 py-1.5 shadow-2xl text-slate-100 whitespace-nowrap leading-tight pointer-events-none select-none backdrop-blur-sm -mt-2 ml-3">
          <div class="text-slate-100 font-bold text-[11px] flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Detection Pin</span>
            <span class="font-mono text-sky-400 text-[10px]">(${currentTarget.id})</span>
          </div>
          <div class="text-slate-300 font-mono text-[9px] mt-0.5">
            Lat: ${currentTarget.position.lat}, ${currentTarget.position.lon}
          </div>
          <div class="text-amber-400/90 font-mono text-[8px] mt-0.5 uppercase tracking-wide flex items-center gap-1">
            <span class="px-1 py-0.2 rounded bg-amber-950/80 border border-amber-600/40 text-amber-300 font-semibold">${locStatus}</span>
            <span>•</span>
            <span class="text-slate-300">${telemSource}</span>
          </div>
          <div class="text-slate-400 font-mono text-[7.5px] mt-0.5 max-w-[200px] truncate" title="${locNote}">
            ${locNote}
          </div>
        </div>
      `,
      iconSize: [210, 60],
      iconAnchor: [-8, 30]
    });

    L.marker([lat, lon], { icon: calloutIcon, interactive: false, zIndexOffset: 900 }).addTo(markersGroup);
  }, [lat, lon, currentTarget, allTargets, selectedTargetIdx]);

  // Zoom handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Recenter map on target
  const handleRecenter = () => {
    mapInstanceRef.current?.setView([lat, lon], 12.5, { animate: true });
  };

  return (
    <div className={`w-full rounded-xl relative overflow-hidden border border-white/[0.08] bg-surface-container-lowest select-none shadow-sm ${className || 'h-48'}`}>
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top-Left Tactical Zoom Buttons (+ / −) */}
      <div className="absolute top-2 left-2 flex flex-col bg-surface-container-high/90 backdrop-blur-md border border-white/[0.08] rounded-lg shadow-md z-10 overflow-hidden">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-6 h-6 text-xs text-slate-200 hover:bg-white/10 hover:text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
        >
          +
        </button>
        <div className="h-px bg-white/[0.08]"></div>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-6 h-6 text-xs text-slate-200 hover:bg-white/10 hover:text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
        >
          −
        </button>
      </div>

      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        title="Recenter On Target"
        className="absolute bottom-2 right-2 z-10 w-7 h-7 rounded-xl bg-surface-container-high/90 backdrop-blur-md hover:bg-white/10 border border-white/[0.08] text-secondary flex items-center justify-center shadow-lg transition-all cursor-pointer"
      >
        <Compass className="w-3.5 h-3.5" />
      </button>

      {/* Top-Right: Satellite / Seabed View Layer Switcher Badge */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="px-2.5 py-1 rounded-xl bg-surface-container-highest/90 backdrop-blur-md hover:bg-surface-bright text-slate-200 border border-white/[0.1] font-medium text-[10px] font-mono shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          title="Switch Map Layer (Satellite / Seabed / Tactical)"
        >
          <Layers className="w-3 h-3 text-secondary" />
          <span>{MAP_LAYERS[activeLayerIdx].name}</span>
        </button>

        {showLayerMenu && (
          <div className="absolute right-0 top-8 w-48 bg-surface-container-low/95 backdrop-blur-2xl border border-white/[0.12] rounded-xl shadow-2xl p-1 z-30 space-y-0.5">
            <div className="px-2 py-1 text-[9px] font-mono uppercase text-outline font-bold border-b border-white/[0.06]">
              GIS Basemap Layers
            </div>
            {MAP_LAYERS.map((layer, idx) => (
              <button
                key={layer.id}
                onClick={() => {
                  setActiveLayerIdx(idx);
                  setShowLayerMenu(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  idx === activeLayerIdx
                    ? 'bg-primary-container text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <span>{layer.name}</span>
                {idx === activeLayerIdx && <span className="text-[10px] text-secondary">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subtle coordinate overlay footer with honest telemetry badge */}
      <div className="absolute bottom-1.5 left-2 z-10 pointer-events-none flex items-center gap-1.5">
        <span className="text-[9px] font-mono text-on-surface-variant bg-surface-container-low/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/[0.06]">
          GIS: WGS 84 / UTM 43N
        </span>
        <span className="text-[9px] font-mono text-amber-300 bg-amber-500/10 backdrop-blur-sm px-2 py-0.5 rounded-full border border-amber-500/20">
          {currentTarget?.telemetry_source || 'SIMULATED TELEMETRY'}
        </span>
      </div>
    </div>
  );
};
