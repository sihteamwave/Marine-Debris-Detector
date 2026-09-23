import React from 'react';
import { GlassPanel } from '../components/GlassPanel';
import { StatusBadge } from '../components/StatusBadge';
import { DetectionTarget } from '../App';
import { FileText, Download, ShieldCheck, CheckCircle2, FileCode, Layers } from 'lucide-react';

interface ReportsViewProps {
  scenarioId: string;
  scenarioName: string;
  detections: DetectionTarget[];
  onExport: (format: 'JSON' | 'CSV') => void;
  exporting: string | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  scenarioId,
  scenarioName,
  detections,
  onExport,
  exporting,
}) => {
  return (
    <div className="flex-1 w-full h-full p-4 lg:p-6 overflow-y-auto space-y-4 max-w-[1920px] mx-auto custom-scrollbar">
      {/* Header */}
      <GlassPanel level={2} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-white font-mono">
              Mission Reports &amp; Data Lineage Export
            </h2>
            <p className="text-xs text-on-surface-variant">
              Auditable hydrographic deliverables, mission-level benchmark metrics, and protocol provenance
            </p>
          </div>
        </div>

        {/* Quick Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onExport('JSON')}
            disabled={exporting !== null}
            className="px-3.5 py-1.5 rounded-xl bg-primary-container hover:bg-primary-container/90 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-200" />
            <span>{exporting === 'JSON' ? 'Exporting...' : 'Export JSON'}</span>
          </button>
          <button
            onClick={() => onExport('CSV')}
            disabled={exporting !== null}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-slate-200 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer border border-white/[0.08]"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{exporting === 'CSV' ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </GlassPanel>

      {/* Mission Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassPanel level={2} className="p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">
            Active Mission Log
          </span>
          <div className="text-sm font-bold text-white font-mono">{scenarioId}</div>
          <p className="text-xs text-on-surface-variant">{scenarioName}</p>
          <div className="pt-2 border-t border-white/[0.04] text-[11px] font-mono text-slate-300">
            Total Target Candidates: <strong className="text-secondary">{detections.length}</strong>
          </div>
        </GlassPanel>

        <GlassPanel level={2} className="p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">
            Model Lineage &amp; Checkpoint
          </span>
          <div className="text-sm font-bold text-amber-300 font-mono">YOLO11-Seg (Ultralytics)</div>
          <p className="text-xs text-on-surface-variant">Weight Hash: coco-base-6.18mb • CLAHE v2</p>
          <div className="pt-2 border-t border-white/[0.04] text-[11px] font-mono text-slate-300">
            Engine: Acoustic Physics Directional Tracing
          </div>
        </GlassPanel>

        <GlassPanel level={2} className="p-4 flex flex-col gap-2">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">
            Standards &amp; Protocol Compliance
          </span>
          <div className="text-sm font-bold text-emerald-400 font-mono">IHO S-44 Order 1a</div>
          <p className="text-xs text-on-surface-variant">Hydrographic Debris Localization Standard</p>
          <div className="pt-2 border-t border-white/[0.04] text-[11px] font-mono text-slate-300">
            Audit Trail: Immutable Append-Only JSONL
          </div>
        </GlassPanel>
      </div>

      {/* Available Technical Protocols in Workspace */}
      <GlassPanel level={2} className="p-4 space-y-3">
        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
          Auditable Protocol Specifications (Repository Docs)
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-secondary" />
              <div>
                <span className="text-slate-200 font-semibold block">docs/GAP_IMPLEMENTATION_AUDIT.md</span>
                <span className="text-[10px] text-outline">Comprehensive 18-gap resolution specification</span>
              </div>
            </div>
            <StatusBadge label="VERIFIED" variant="valid" size="sm" />
          </div>

          <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-secondary" />
              <div>
                <span className="text-slate-200 font-semibold block">docs/EVALUATION_PROTOCOL.md</span>
                <span className="text-[10px] text-outline">Mission benchmark &amp; ECE calibration rules</span>
              </div>
            </div>
            <StatusBadge label="VERIFIED" variant="valid" size="sm" />
          </div>

          <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-secondary" />
              <div>
                <span className="text-slate-200 font-semibold block">docs/GROUND_TRUTH_PROTOCOL.md</span>
                <span className="text-[10px] text-outline">Provenance &amp; confirmation level standard</span>
              </div>
            </div>
            <StatusBadge label="VERIFIED" variant="valid" size="sm" />
          </div>

          <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-secondary" />
              <div>
                <span className="text-slate-200 font-semibold block">docs/FAILURE_STATES.md</span>
                <span className="text-[10px] text-outline">Standardized system failure catalog</span>
              </div>
            </div>
            <StatusBadge label="VERIFIED" variant="valid" size="sm" />
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};
