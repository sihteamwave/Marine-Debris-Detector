import React from 'react';
import { GlassPanel } from '../components/GlassPanel';
import { GisMiniMap } from '../components/GisMiniMap';
import { StatusBadge } from '../components/StatusBadge';
import { DetectionTarget } from '../App';
import { Globe, Compass, Navigation, MapPin } from 'lucide-react';

interface GisViewProps {
  currentTarget: DetectionTarget;
  allTargets: DetectionTarget[];
  selectedTargetIdx: number;
  onSelectTarget: (index: number) => void;
}

export const GisView: React.FC<GisViewProps> = ({
  currentTarget,
  allTargets,
  selectedTargetIdx,
  onSelectTarget,
}) => {
  return (
    <div className="flex-1 w-full h-full p-4 lg:p-6 flex flex-col gap-4 overflow-hidden max-w-[1920px] mx-auto">
      {/* Top Header */}
      <GlassPanel level={2} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-secondary" />
          <div>
            <h2 className="text-base font-bold text-white font-mono">
              GIS &amp; Marine Spatial Command
            </h2>
            <p className="text-xs text-on-surface-variant">
              Geodetic co-registration of side-scan sonar contacts, slant-to-ground range projections, and transect corridors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge label="WGS 84 / UTM 43N" variant="info" size="sm" />
          <StatusBadge
            label={currentTarget.location_status || 'ESTIMATED LOCATION'}
            variant="estimated"
            size="sm"
          />
        </div>
      </GlassPanel>

      {/* Main Map & Spatial Telemetry Shelf Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Expanded Tactical Map (9 cols) */}
        <div className="lg:col-span-9 h-[560px] lg:h-full rounded-xl overflow-hidden shadow-md relative border border-white/[0.08]">
          <GisMiniMap
            currentTarget={currentTarget}
            allTargets={allTargets}
            selectedTargetIdx={selectedTargetIdx}
            onSelectTarget={onSelectTarget}
            className="w-full h-full"
          />
        </div>

        {/* Tactical Coordinates & Target Coordinates Shelf (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          <GlassPanel level={2} className="p-3.5 flex flex-col gap-3">
            <span className="text-[10px] font-mono text-outline uppercase font-semibold">
              Selected Target Coordinates
            </span>

            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface-container-high/40 border border-white/[0.04]">
              <span className="text-xs font-mono font-bold text-primary">
                {currentTarget.target_id || currentTarget.id}
              </span>
              <span className="text-sm font-semibold text-white truncate">
                {currentTarget.class}
              </span>
              <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-200">
                <span>LAT: {currentTarget.position.lat}</span>
                <span>LON: {currentTarget.position.lon}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-high/30 border border-white/[0.04] text-[11px] text-on-surface-variant space-y-1">
              <span className="text-[10px] font-mono text-amber-300 font-semibold block">
                GEOLOCATION UNCERTAINTY NOTICE
              </span>
              <p className="leading-relaxed">
                {currentTarget.location_note ||
                  'Position derived from vehicle navigation reference. Layback geometry estimated; sub-meter precision requires active acoustic USBL transceiver.'}
              </p>
            </div>
          </GlassPanel>

          {/* Quick Target Switcher */}
          <GlassPanel level={2} className="p-3.5 flex flex-col gap-2 flex-1">
            <span className="text-[10px] font-mono text-outline uppercase font-semibold">
              All Contacts in Sector ({allTargets.length})
            </span>

            <div className="space-y-1 overflow-y-auto max-h-72 custom-scrollbar">
              {allTargets.map((t, idx) => (
                <button
                  key={t.id || idx}
                  onClick={() => onSelectTarget(idx)}
                  className={`w-full text-left p-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center justify-between border ${
                    idx === selectedTargetIdx
                      ? 'bg-primary-container text-white border-primary/40 font-bold'
                      : 'bg-surface-container-high/30 text-slate-300 border-white/[0.03] hover:bg-surface-container-high'
                  }`}
                >
                  <div className="truncate max-w-[140px]">
                    <span className="text-secondary block text-[10px]">{t.target_id || t.id}</span>
                    <span className="truncate block">{t.class.split('(')[0]}</span>
                  </div>
                  <span className="text-[10px] text-outline shrink-0">{t.confidence}%</span>
                </button>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
