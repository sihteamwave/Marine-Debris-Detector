import React from 'react';
import { GlassPanel } from './GlassPanel';
import { DetectionTarget } from '../App';
import { ShieldCheck, Moon, CheckCircle2 } from 'lucide-react';
import { formatPercentage } from '../utils/formatters';

interface EvidenceInspectorProps {
  target: DetectionTarget;
  scenario?: any;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({ target, scenario }) => {
  const shadowVal = target.shadowStrength <= 1 && target.shadowStrength > 0 
    ? target.shadowStrength * 100 
    : target.shadowStrength;

  return (
    <GlassPanel level={2} className="p-3.5 flex flex-col gap-3">
      {/* Target Title & Shadow Telemetry */}
      <div className="flex items-start justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-bold text-on-surface">
              {target.target_id || target.id}
            </span>
            <span className="font-mono text-[10px] text-outline">
              ({target.position.lat}, {target.position.lon})
            </span>
          </div>
          <span className="text-xs text-secondary font-medium truncate max-w-[220px]">
            {target.class}
          </span>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-surface-container-high/80 text-[10px] font-mono text-on-surface-variant border border-white/5 font-semibold">
          {target.reliability.toUpperCase()} RELIABILITY
        </span>
      </div>

      {/* Metrics Row: Anthropogenic Likelihood, Shadow Strength, Image Quality */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="p-2 rounded-lg bg-surface-container-high/40 border border-white/[0.04] flex flex-col">
          <span className="text-[9px] font-mono text-outline uppercase">Anthropogenic</span>
          <span className="font-mono text-xs font-semibold text-secondary">
            {target.class_type || 'Anthropogenic'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-surface-container-high/40 border border-white/[0.04] flex flex-col">
          <span className="text-[9px] font-mono text-outline uppercase">Shadow Margin</span>
          <span className="font-mono text-xs font-semibold text-tertiary">
            {formatPercentage(target.shadowStrength)}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-surface-container-high/40 border border-white/[0.04] flex flex-col">
          <span className="text-[9px] font-mono text-outline uppercase">Dimensions</span>
          <span className="font-mono text-xs font-semibold text-primary">
            {target.dimensions.width} × {target.dimensions.height}
          </span>
        </div>
      </div>

      {/* Acoustic Shadow Verification Note */}
      <div className="p-2 rounded-lg bg-surface-container-high/30 border border-white/[0.04] flex items-start gap-2">
        <Moon className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-secondary font-semibold">
            ACOUSTIC SHADOW VERIFICATION
          </span>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {target.shadowNote || 'Acoustic highlight accompanied by directional acoustic shadow dropout.'}
          </p>
        </div>
      </div>

      {/* Sonar Evidence Matrix Table */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider font-semibold">
            Sonar Evidence Matrix
          </span>
          <span className="text-[10px] font-mono text-tertiary font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-tertiary" />
            VALIDATED
          </span>
        </div>

        <div className="rounded-lg overflow-hidden border border-white/[0.05] bg-surface-container/60">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-surface-container-high/50 text-outline text-[9px] font-mono uppercase">
                <th className="py-1 px-2.5 font-medium">Diagnostic Dimension</th>
                <th className="py-1 px-2 font-medium">Finding</th>
                <th className="py-1 px-2.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-on-surface">
              <tr>
                <td className="py-1.5 px-2.5 font-medium text-slate-300">Target Highlight</td>
                <td className="py-1.5 px-2 text-on-surface-variant">Sharp high-backscatter crest</td>
                <td className="py-1.5 px-2.5 text-right font-mono text-tertiary">Verified</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2.5 font-medium text-slate-300">Acoustic Shadow</td>
                <td className="py-1.5 px-2 text-on-surface-variant">Directional shadow dropout</td>
                <td className="py-1.5 px-2.5 text-right font-mono text-secondary">
                  {shadowVal >= 50 ? 'Supported' : 'Ambiguous'}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-2.5 font-medium text-slate-300">Seabed Context</td>
                <td className="py-1.5 px-2 text-on-surface-variant">{target.seabedSimilarity} similarity</td>
                <td className="py-1.5 px-2.5 text-right font-mono text-primary">Compatible</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2.5 font-medium text-slate-300">Metadata Quality</td>
                <td className="py-1.5 px-2 text-on-surface-variant">{target.telemetry_source || 'Simulated'}</td>
                <td className="py-1.5 px-2.5 text-right font-mono text-on-surface-variant">Valid</td>
              </tr>
              <tr className="bg-surface-container-high/20 font-semibold">
                <td className="py-1.5 px-2.5 text-secondary">Evidence Consistency</td>
                <td className="py-1.5 px-2 text-slate-200" colSpan={2}>
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-secondary">{target.reliability}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </GlassPanel>
  );
};
