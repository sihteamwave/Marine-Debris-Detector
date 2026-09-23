import React from 'react';
import { GlassPanel } from '../components/GlassPanel';
import { StatusBadge } from '../components/StatusBadge';
import { DetectionTarget } from '../App';
import { SECTORS } from '../components/GovernmentHeader';
import {
  Waves,
  Radar,
  Globe,
  ShieldCheck,
  Zap,
  ArrowRight,
  Radio,
  Ship,
  Compass,
  Anchor,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { formatPercentage } from '../utils/formatters';

interface OverviewViewProps {
  scenario: {
    id: string;
    name: string;
    speed: string;
    heading: string;
    depth: string;
    qa_assessment?: {
      status: string;
      usable_sonar_coverage_pct: number;
    };
    coverage_assessment?: {
      usable_percentage: number;
    };
  };
  detections: DetectionTarget[];
  onSelectTarget: (index: number) => void;
  onNavigateToTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  scenario,
  detections,
  onSelectTarget,
  onNavigateToTab,
}) => {
  const confirmedCount = detections.filter((d) => d.status === 'Confirmed').length;
  const pendingCount = detections.filter((d) => d.status === 'Pending').length;
  const usableCoverage = scenario.coverage_assessment?.usable_percentage || 94.2;

  // Find if any target is shallow HAZNAV (<15m clearance)
  const shallowHaznavCount = detections.filter((d) => {
    const depthVal = parseFloat(d.depth?.replace('m', '') || '100');
    const heightVal = parseFloat(d.dimensions?.height?.replace('m', '') || '5');
    return Math.max(0, depthVal - heightVal) < 15.0;
  }).length;

  return (
    <div className="flex-1 w-full h-full overflow-y-auto space-y-4 p-4 lg:p-6 max-w-[1920px] mx-auto custom-scrollbar">
      {/* Mission Overview Top Header & Metadata HUD Strip */}
      <section className="flex flex-col gap-3 bg-surface-container-low/90 backdrop-blur-2xl p-4 lg:p-5 rounded-xl border border-white/[0.08] shadow-sm stitch-card-sheen">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse shadow-[0_0_12px_rgba(60,221,199,0.8)]" />
            <h1 className="font-headline-md text-base sm:text-lg text-on-surface tracking-tight font-semibold">
              Marine Intelligence / Mission Overview
            </h1>
            <span className="px-space-xs py-0.5 rounded text-[10px] font-mono bg-surface-container-highest text-secondary uppercase font-semibold border border-white/5">
              Telemetry Lock
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3 text-amber-300" />
              RESTRICTED • GOVT OF INDIA
            </span>
          </div>

          <div className="flex items-center gap-space-xs bg-surface-container-lowest/80 border border-white/[0.06] px-space-md py-1 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
            <span className="text-[11px] font-mono text-tertiary font-semibold uppercase tracking-wider">
              Status:
            </span>
            <span className="text-[11px] font-mono text-on-surface font-semibold">
              COMPLETE (Offline Batch Analysis)
            </span>
          </div>
        </div>

        {/* Monospace Dense Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-xs pt-space-xs text-on-surface-variant bg-surface-container/60 p-space-sm rounded-xl border border-white/[0.04]">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider">Mission ID</span>
            <span className="text-xs font-mono text-primary font-bold">{scenario.id}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider">Survey Zone</span>
            <span className="text-xs font-mono text-on-surface truncate font-semibold">
              {scenario.name.split('/')[0]}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider">Acoustic Log File</span>
            <span className="text-xs font-mono text-secondary truncate font-semibold">
              SSS_REC_20241018_450K.sdf
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider">Towfish Dynamic</span>
            <span className="text-xs font-mono text-tertiary font-semibold">
              {scenario.speed} • {scenario.heading}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider">Swath Frequency</span>
            <span className="text-xs font-mono text-on-surface font-semibold">450 kHz Dual-Chirp</span>
          </div>
        </div>
      </section>

      {/* 5 Key Metric Glass Cards (Stitch Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        {/* 1. Total Detections */}
        <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container/70 backdrop-blur-xl border border-white/[0.07] shadow-lg stitch-card-sheen relative overflow-hidden group hover:bg-surface-container-high/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
              Total Detections
            </span>
            <Radar className="w-4 h-4 text-primary" />
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="text-3xl font-mono text-on-surface font-bold tracking-tight">
              {detections.length}
            </span>
            <span className="text-[11px] font-mono text-outline uppercase">Targets</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant pt-space-xs bg-surface-container-lowest/50 px-space-xs py-0.5 rounded-lg border border-white/[0.04]">
            <span className="text-secondary font-semibold">{confirmedCount} Verified</span>
            <span className="text-outline-variant">•</span>
            <span className="text-outline">{detections.length - confirmedCount} Pending</span>
          </div>
        </div>

        {/* 2. Verified Targets */}
        <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container/70 backdrop-blur-xl border border-white/[0.07] shadow-lg stitch-card-sheen relative overflow-hidden group hover:bg-surface-container-high/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
              Verified Targets
            </span>
            <CheckCircle2 className="w-4 h-4 text-tertiary" />
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="text-3xl font-mono text-tertiary font-bold tracking-tight">
              {confirmedCount}
            </span>
            <span className="text-[11px] font-mono text-tertiary-container font-semibold">
              {detections.length > 0 ? ((confirmedCount / detections.length) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className="text-[11px] font-mono text-on-surface-variant pt-space-xs truncate">
            Confirmed by Hydrographer
          </div>
        </div>

        {/* 3. Review Required */}
        <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container/70 backdrop-blur-xl border border-white/[0.07] shadow-lg stitch-card-sheen relative overflow-hidden group hover:bg-surface-container-high/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
              Review Required
            </span>
            <AlertTriangle className="w-4 h-4 text-secondary" />
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="text-3xl font-mono text-secondary font-bold tracking-tight">
              {pendingCount.toString().padStart(2, '0')}
            </span>
            <span className="text-[11px] font-mono text-outline uppercase">Queue</span>
          </div>
          <div className="text-[11px] font-mono text-on-surface-variant pt-space-xs truncate">
            Pending Human Inspection
          </div>
        </div>

        {/* 4. HAZNAV Fairway Obstructions */}
        <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container/70 backdrop-blur-xl border border-white/[0.07] shadow-lg stitch-card-sheen relative overflow-hidden group hover:bg-surface-container-high/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
              HAZNAV Hazards
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="text-3xl font-mono text-rose-400 font-bold tracking-tight">
              {shallowHaznavCount.toString().padStart(2, '0')}
            </span>
            <span className="text-[11px] font-mono text-rose-400/80 uppercase">Fairway</span>
          </div>
          <div className="text-[11px] font-mono text-on-surface-variant pt-space-xs truncate">
            Clearance &lt; 15m in transit lane
          </div>
        </div>

        {/* 5. Survey Coverage */}
        <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container/70 backdrop-blur-xl border border-white/[0.07] shadow-lg stitch-card-sheen relative overflow-hidden group hover:bg-surface-container-high/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
              Survey Coverage
            </span>
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="text-3xl font-mono text-primary font-bold tracking-tight">
              {usableCoverage}%
            </span>
            <span className="text-[11px] font-mono text-tertiary uppercase font-semibold">Nominal</span>
          </div>
          <div className="text-[11px] font-mono text-on-surface-variant pt-space-xs truncate">
            QA Gate: {scenario.qa_assessment?.status || 'VALID'}
          </div>
        </div>
      </div>

      {/* Main Grid: 60% Left (Waterfall Overview & Targets) / 40% Right (Sectors & Sorties) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
        {/* Left Column: Waterfall Overview & Priority Anomaly Table */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Sonar Waterfall Overview Card */}
          <div className="flex flex-col bg-surface-container/70 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-xl overflow-hidden p-space-md stitch-card-sheen">
            <div className="flex items-center justify-between pb-space-sm border-b border-white/[0.06]">
              <div className="flex items-center gap-space-xs">
                <Waves className="w-4 h-4 text-secondary" />
                <span className="font-mono text-xs sm:text-sm text-on-surface font-bold uppercase tracking-wider">
                  Side-Scan Sonar Acoustic Waterfall Overview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container-high text-on-surface-variant uppercase border border-white/5">
                  Port / Stbd: 75m Range
                </span>
                <button
                  onClick={() => onNavigateToTab('sonar-analysis')}
                  className="px-2.5 py-1 rounded-lg bg-primary-container hover:bg-primary-container/90 text-white text-[11px] font-mono font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <span>Open Workstation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tactical Waterfall Viewport Container */}
            <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-surface-container-lowest my-space-sm border border-white/[0.06]">
              <div className="absolute inset-0 bg-[#0a0e14] opacity-90 flex items-center justify-center">
                {/* Nadir Center Blanking Line */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 bg-surface-container-lowest/90 border-x border-white/[0.04] pointer-events-none z-10 flex flex-col justify-between items-center py-2">
                  <span className="text-[8px] font-mono text-outline tracking-tighter uppercase [writing-mode:vertical-lr]">
                    NADIR
                  </span>
                  <div className="w-0.5 h-full bg-primary/20" />
                  <span className="text-[8px] font-mono text-secondary">0m</span>
                </div>

                {/* Range Indicators */}
                <div className="absolute top-2 left-3 pointer-events-none text-[9px] font-mono text-secondary font-bold">
                  ◀ PORT (75m)
                </div>
                <div className="absolute top-2 right-3 pointer-events-none text-[9px] font-mono text-secondary font-bold">
                  STARBOARD (75m) ▶
                </div>

                {/* Background Sonar Waterfall Simulation */}
                <div className="w-full h-full opacity-60 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/40 via-surface-container-lowest to-surface-container-lowest flex items-center justify-center">
                  <div className="text-center font-mono space-y-1">
                    <Waves className="w-8 h-8 text-primary/40 mx-auto animate-pulse" />
                    <div className="text-xs text-secondary font-bold">ACOUSTIC STREAM LIVE FEED</div>
                    <div className="text-[10px] text-outline">
                      YOLO11-Seg Auto-Tracking Active • Swath Width: 150m
                    </div>
                  </div>
                </div>

                {/* Simulated Target Bounding Reticles */}
                {detections.slice(0, 3).map((det, idx) => (
                  <div
                    key={det.id || idx}
                    onClick={() => {
                      onSelectTarget(idx);
                      onNavigateToTab('sonar-analysis');
                    }}
                    style={{
                      left: `${20 + idx * 30}%`,
                      top: `${30 + (idx % 2) * 25}%`,
                    }}
                    className="absolute p-2 rounded-xl bg-surface-container-high/80 border border-primary/40 backdrop-blur-md cursor-pointer hover:scale-105 hover:border-secondary transition-all shadow-lg"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                      <span className="text-white">#{idx + 1} {det.class.split('(')[0]}</span>
                      <span className="text-tertiary">{formatPercentage(det.confidence)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Telemetry Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-space-xs text-[11px] font-mono text-on-surface-variant">
              <span>Towfish Alt: <strong className="text-primary font-bold">11.4m</strong></span>
              <span>Speed: <strong className="text-on-surface font-bold">{scenario.speed}</strong></span>
              <span>Depth: <strong className="text-secondary font-bold">{scenario.depth}</strong></span>
              <span>USBL Layback: <strong className="text-tertiary font-bold">42.1m (Compensated)</strong></span>
            </div>
          </div>

          {/* Priority Detected Contacts Inventory */}
          <div className="flex flex-col bg-surface-container/70 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-xl p-space-md stitch-card-sheen">
            <div className="flex items-center justify-between pb-space-sm border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs sm:text-sm text-on-surface font-bold uppercase tracking-wider">
                  Priority Contacts Inventory
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab('detections')}
                className="text-xs font-mono text-primary hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({detections.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-white/[0.04] mt-1">
              {detections.slice(0, 5).map((target, idx) => (
                <div
                  key={target.id || idx}
                  className="py-2.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition-colors cursor-pointer"
                  onClick={() => {
                    onSelectTarget(idx);
                    onNavigateToTab('sonar-analysis');
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high/80 border border-white/5 flex items-center justify-center font-mono text-xs font-bold text-secondary shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white truncate">
                          {target.class}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold border ${
                            target.status === 'Confirmed'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : target.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {target.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-outline">
                        Pos: {target.position.lat}, {target.position.lon} • Shadow: {formatPercentage(target.shadowStrength)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="font-mono text-xs font-bold text-primary">
                        {formatPercentage(target.confidence)}
                      </div>
                      <div className="text-[9px] font-mono text-outline uppercase">
                        {target.reliability}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTarget(idx);
                        onNavigateToTab('sonar-analysis');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-secondary text-[11px] font-mono font-semibold border border-white/5 transition-all"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Strategic Sectors & Operational Assets */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Pan-India Surveillance Grid */}
          <div className="flex flex-col bg-surface-container/70 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-xl p-space-md stitch-card-sheen">
            <div className="flex items-center justify-between pb-space-sm border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-300" />
                <h2 className="font-mono text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Strategic Maritime Surveillance Grid
                </h2>
              </div>
              <button
                onClick={() => onNavigateToTab('gis-map')}
                className="text-xs font-mono text-primary hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Full GIS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {SECTORS.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => onNavigateToTab('gis-map')}
                  className="p-3 rounded-xl bg-surface-container-high/40 border border-white/[0.06] hover:border-primary/40 hover:bg-surface-container-high/60 transition-all flex flex-col justify-between gap-1.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{sec.name.split('—')[0]}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-cyan-300">
                      {sec.depthRange}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 font-semibold truncate">
                    {sec.name.split('—')[1]}
                  </div>
                  <div className="text-[10px] text-outline font-sans pt-1 border-t border-white/[0.04]">
                    {sec.primaryRisk}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Operational Sorties Status */}
          <div className="flex flex-col bg-surface-container/70 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-xl p-space-md stitch-card-sheen gap-space-sm">
            <div className="flex items-center justify-between pb-space-xs border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Operational Assets &amp; Response
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">ALL NOMINAL</span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-surface-container-high/30 border border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-white">ORV Sagar Nidhi / INS Makar</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">
                    Dual 100/450 kHz Side-Scan Sonar Towfish Array
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  ACTIVE SURVEY
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container-high/30 border border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-white">NIOT AUV-150 / Micro-ROV</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">
                    Orthogonal Verification &amp; Slant Inspection
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  STANDBY CRADLE
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container-high/30 border border-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-white">ICGS Samudra Prahari</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">
                    Indian Coast Guard Heavy Pollution Salvage
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  TASKING READY
                </span>
              </div>
            </div>

            {/* Quick Action Dispatch Button */}
            <button
              onClick={() => onNavigateToTab('action-dispatch')}
              className="w-full mt-1 py-2 px-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary-container/90 hover:to-secondary-container/90 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-200" />
              <span>Initiate Inter-Agency SOP Action Dispatch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
