import React from 'react';
import { GlassPanel } from './GlassPanel';
import { StatusBadge } from './StatusBadge';
import { DetectionTarget } from '../App';
import { ArrowDown, AlertTriangle, ShieldCheck, Radio, Info } from 'lucide-react';

interface HeightInversionWidgetProps {
  target: DetectionTarget;
  scenarioDepth?: string;
  onDispatchNotmar?: () => void;
}

export const HeightInversionWidget: React.FC<HeightInversionWidgetProps> = ({
  target,
  scenarioDepth = '112 m',
  onDispatchNotmar,
}) => {
  const depthM = parseFloat(target.depth?.replace('m', '') || scenarioDepth.replace('m', '') || '112');
  const heightM = parseFloat(target.dimensions?.height?.replace('m', '') || '6.1');
  const ukcM = Math.max(0, depthM - heightM);
  const isCritical = ukcM < 15.0;

  // Percentage of water column occupied by debris
  const debrisPct = Math.min(100, Math.max(8, (heightM / Math.max(10, depthM)) * 100));

  return (
    <GlassPanel level={2} className="p-3.5 flex flex-col gap-2.5">
      {/* Title & HAZNAV Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">
            Acoustic Height &amp; Clearance (UKC)
          </span>
        </div>
        <StatusBadge
          label={isCritical ? 'CRITICAL HAZNAV' : 'SAFE CLEARANCE'}
          variant={isCritical ? 'error' : 'success'}
          size="sm"
        />
      </div>

      {/* Numerical Metrics Summary */}
      <div className="grid grid-cols-3 gap-2 text-center py-1 bg-surface-container-lowest/50 rounded-lg border border-white/[0.04]">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-outline uppercase">Debris Relief</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-amber-300">
            {heightM.toFixed(1)} m
          </span>
          <span className="text-[8px] font-mono text-slate-400">off seabed</span>
        </div>

        <div className="flex flex-col border-x border-white/[0.06]">
          <span className="text-[9px] font-mono text-outline uppercase">Sounding Depth</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-white">
            {depthM.toFixed(1)} m
          </span>
          <span className="text-[8px] font-mono text-slate-400">water column</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-outline uppercase">Clearance (UKC)</span>
          <span className={`text-xs sm:text-sm font-bold font-mono ${isCritical ? 'text-rose-400' : 'text-emerald-400'}`}>
            {ukcM.toFixed(1)} m
          </span>
          <span className="text-[8px] font-mono text-slate-400">to surface</span>
        </div>
      </div>

      {/* Visual Water Column Cross-Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] font-mono text-outline">
          <span>Surface (0 m)</span>
          <span className="text-rose-300">Standard Draft Limit (14.5 m)</span>
          <span>Seafloor ({depthM.toFixed(0)} m)</span>
        </div>

        {/* Column Bar */}
        <div className="w-full h-4 bg-surface-container-high rounded-lg overflow-hidden flex relative border border-white/[0.08]">
          {/* Safe navigable water column */}
          <div
            className="h-full bg-gradient-to-r from-cyan-600/40 to-blue-500/30"
            style={{ width: `${Math.max(10, 100 - debrisPct)}%` }}
          />
          {/* Debris obstacle relief */}
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
            style={{ width: `${debrisPct}%` }}
            title={`Debris Relief: ${heightM.toFixed(1)}m off seabed`}
          />
          {/* Draft reference line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
            style={{ left: `${Math.min(90, Math.max(10, (14.5 / depthM) * 100))}%` }}
            title="Commercial Draft Limit Line (14.5m)"
          />
        </div>
      </div>

      {/* Physics Formula Reference */}
      <div className="text-[9px] font-mono text-on-surface-variant bg-surface-container-high/40 p-2 rounded-lg border border-white/[0.04] flex items-center justify-between">
        <span>Formula: h = (L_shadow × H_sensor) / (R_ground + L_shadow)</span>
        <span className="text-secondary font-semibold">Grazing Ray Inversion</span>
      </div>

      {/* Dispatch Action if HAZNAV */}
      {isCritical && onDispatchNotmar && (
        <button
          onClick={onDispatchNotmar}
          className="w-full py-1.5 px-3 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-mono text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
        >
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Dispatch NOTMAR Navigational Warning</span>
        </button>
      )}
    </GlassPanel>
  );
};
