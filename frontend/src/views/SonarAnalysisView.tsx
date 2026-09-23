import React, { useState } from 'react';
import { GlassPanel } from '../components/GlassPanel';
import { StatusBadge } from '../components/StatusBadge';
import { FloatingControls } from '../components/FloatingControls';
import { EvidenceInspector } from '../components/EvidenceInspector';
import { RiskPriorityCard } from '../components/RiskPriorityCard';
import { RAGKnowledgeCard } from '../components/RAGKnowledgeCard';
import { HumanReviewBar } from '../components/HumanReviewBar';
import { GisMiniMap } from '../components/GisMiniMap';
import { HeightInversionWidget } from '../components/HeightInversionWidget';
import { DetectionTarget } from '../App';
import {
  Waves,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ExternalLink,
  Zap,
  Upload,
} from 'lucide-react';
import { formatPercentage } from '../utils/formatters';

interface SonarAnalysisViewProps {
  activeItem: any;
  activeDetections: DetectionTarget[];
  selectedTargetIdx: number;
  onSelectTarget: (index: number) => void;
  filterMode: 'Raw' | 'CLAHE Enhanced';
  onToggleFilter: () => void;
  showOverlay: boolean;
  onToggleOverlay: () => void;
  fitMode: 'contain' | 'cover';
  onToggleFit: () => void;
  currentResolution: { width: number; height: number; aspectRatio: number };
  setCurrentResolution: (res: any) => void;
  isAnalyzing: boolean;
  analysisStep: string;
  onRunLiveInference: () => void;
  onExport: (format: 'JSON' | 'CSV') => void;
  onConfirm: () => void;
  onReject: () => void;
  onMarkUnknown: () => void;
  onQueueResurvey: () => void;
  onNavigateToTab: (tab: any) => void;
  onOpenUploadModal?: () => void;
  onProcessFile?: (file: File) => Promise<void>;
}

export const SonarAnalysisView: React.FC<SonarAnalysisViewProps> = ({
  activeItem,
  activeDetections,
  selectedTargetIdx,
  onSelectTarget,
  filterMode,
  onToggleFilter,
  showOverlay,
  onToggleOverlay,
  fitMode,
  onToggleFit,
  currentResolution,
  setCurrentResolution,
  isAnalyzing,
  analysisStep,
  onRunLiveInference,
  onExport,
  onConfirm,
  onReject,
  onMarkUnknown,
  onQueueResurvey,
  onNavigateToTab,
  onOpenUploadModal,
  onProcessFile,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState<boolean>(false);

  const currentTarget: DetectionTarget = activeDetections[selectedTargetIdx] || activeDetections[0] || {
    id: activeItem.id,
    target_id: activeItem.id,
    class: activeItem.class,
    confidence: activeItem.confidence,
    shadowStrength: activeItem.shadowStrength,
    segmentationQuality: activeItem.segmentationQuality,
    seabedSimilarity: activeItem.seabedSimilarity,
    dimensions: activeItem.dimensions,
    reliability: activeItem.reliability,
    status: activeItem.status,
    position: activeItem.position,
    heading: activeItem.heading,
    depth: activeItem.depth,
    speed: activeItem.speed,
    shadowNote: activeItem.shadowNote,
    obb: activeItem.obb,
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, z + 0.2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.7, z - 0.2));
  const handleResetZoom = () => setZoomLevel(1.0);

  return (
    <div className="flex-1 w-full h-full p-4 lg:p-6 overflow-y-auto space-y-4 max-w-[1920px] mx-auto custom-scrollbar">
      {/* Top Hydrographic Telemetry Spec Ribbon (Stitch Design) */}
      <section className="flex flex-wrap items-center justify-between gap-2 px-space-md py-2 rounded-xl bg-surface-container-low/95 border border-white/[0.08] shadow-sm stitch-card-sheen">
        <div className="flex items-center gap-space-lg text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            <span className="text-outline uppercase text-[10px]">Stream:</span>
            <span className="text-on-surface font-semibold">CHIRP-Dual-450/900</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-outline uppercase text-[10px]">Towfish Alt:</span>
            <span className="text-primary font-semibold">11.4m</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-outline uppercase text-[10px]">Heading:</span>
            <span className="text-on-surface font-semibold">{activeItem.heading || '244.6° T'}</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-outline uppercase text-[10px]">Speed:</span>
            <span className="text-on-surface font-semibold">{activeItem.speed || '3.2 kts'}</span>
          </div>
          <div className="hidden xl:flex items-center gap-1.5">
            <span className="text-outline uppercase text-[10px]">Water Temp:</span>
            <span className="text-secondary font-semibold">9.8°C</span>
          </div>
        </div>

        <div className="flex items-center gap-space-xs">
          <span className="px-space-sm py-0.5 rounded-full text-[10px] font-mono bg-surface-container-highest text-on-surface-variant border border-white/5 font-semibold">
            CASCADE AUTO-SYNC
          </span>
          <div className="flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-tertiary-container/30 text-tertiary text-[10px] font-mono font-semibold border border-tertiary/20">
            <Zap className="w-3 h-3 text-tertiary" />
            <span>SAHI INFERENCE ACTIVE</span>
          </div>
        </div>
      </section>

      {/* Primary Workstation Grid: 68% Visualizer / 32% Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left / Center: Acoustic Waterfall Visualizer (approx 68% - 8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-3 lg:sticky lg:top-0">
          <div className="relative w-full rounded-xl bg-surface-container-low/95 border border-white/[0.08] stitch-card-sheen shadow-sm overflow-hidden flex flex-col">
            {/* Top Hydrographic Spec Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-surface-container-high/80 backdrop-blur-md border-b border-white/[0.06] z-20">
              <div className="flex items-center gap-2 min-w-0">
                <Waves className="w-4 h-4 text-primary shrink-0" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider truncate">
                  SIDE-SCAN SONAR WATERFALL
                </span>
                <span className="text-outline-variant text-[10px] hidden sm:inline">|</span>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-on-surface-variant">
                  <span className="text-secondary font-semibold">{activeItem.id}</span>
                  <span className="text-outline">/</span>
                  <span>455 kHz</span>
                  <span className="text-outline">/</span>
                  <span>RANGE: 75m</span>
                  <span className="text-outline">/</span>
                  <span className="text-tertiary">GAIN: +3.2dB</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenUploadModal && (
                  <button
                    onClick={onOpenUploadModal}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-container/40 hover:bg-primary-container border border-primary/40 text-[11px] font-mono font-semibold text-white transition-all cursor-pointer shadow-sm"
                    title="Upload and Ingest Raw Sonar Waterfall"
                  >
                    <Upload className="w-3 h-3 text-secondary animate-pulse" />
                    <span>Upload Scan</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                  <span className="font-mono text-[10px] text-tertiary uppercase tracking-wider font-semibold">
                    LIVE ACOUSTIC SCAN
                  </span>
                </div>
              </div>
            </div>

            {/* Dedicated Tactical HUD Controls Bar (Unobstructed View) */}
            <div className="px-3 py-1.5 bg-surface-container-highest/60 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between gap-2 z-20">
              <div className="flex items-center gap-2 text-[10px] font-mono text-outline">
                <span className="text-secondary font-bold">ACOUSTIC CONTROLS:</span>
                <span>{currentResolution.width}×{currentResolution.height} px</span>
              </div>
              <FloatingControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                filterMode={filterMode}
                onToggleFilter={onToggleFilter}
                showOverlay={showOverlay}
                onToggleOverlay={onToggleOverlay}
                fitMode={fitMode}
                onToggleFit={onToggleFit}
                isAnalyzing={isAnalyzing}
                onRunLiveInference={onRunLiveInference}
                onExport={onExport}
                onOpenUpload={onOpenUploadModal}
                resolutionText={`${currentResolution.width}×${currentResolution.height}`}
              />
            </div>

            {/* Viewport Canvas Area with Acoustic Side-Scan Image & SVG Overlays */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverCanvas(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOverCanvas(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverCanvas(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0] && onProcessFile) {
                  onProcessFile(e.dataTransfer.files[0]);
                }
              }}
              className={`relative w-full min-h-[420px] sm:min-h-[520px] max-h-[680px] bg-surface-container-lowest overflow-hidden select-none flex items-center justify-center p-2 transition-all ${
                isDragOverCanvas ? 'ring-2 ring-secondary bg-secondary-container/10' : ''
              }`}
            >
              {/* Drag over indicator */}
              {isDragOverCanvas && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md border-2 border-dashed border-secondary flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <Upload className="w-10 h-10 text-secondary animate-bounce" />
                  <span className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    Drop Sonar Waterfall to Run YOLO11-Seg
                  </span>
                </div>
              )}

              {/* Nadir Center Blanking Area Line */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-10 bg-surface-container-lowest/85 border-x border-white/[0.04] pointer-events-none z-10 flex flex-col justify-between items-center py-4">
                <span className="text-[8px] font-mono text-outline tracking-tighter [writing-mode:vertical-lr] uppercase">
                  NADIR BLIND ZONE
                </span>
                <div className="w-0.5 h-full bg-primary/20" />
                <span className="text-[8px] font-mono text-secondary">0m</span>
              </div>

              {/* Port & Starboard Swath Range Headers */}
              <div className="absolute top-2 left-3 pointer-events-none flex flex-col gap-0.5 z-20">
                <span className="text-[9px] font-mono text-secondary font-bold tracking-wider">
                  ◀ PORT SWATH (50m)
                </span>
                <span className="text-[9px] font-mono text-outline">PING: #049811</span>
              </div>
              <div className="absolute top-2 right-3 pointer-events-none flex flex-col items-end gap-0.5 z-20">
                <span className="text-[9px] font-mono text-secondary font-bold tracking-wider">
                  STARBOARD SWATH (50m) ▶
                </span>
                <span className="text-[9px] font-mono text-outline">BEAM: 50°</span>
              </div>

              {/* Image-Bounded Stage with Zoom Transformation */}
              <div
                className="relative max-w-full max-h-full flex items-center justify-center select-none shadow-2xl rounded-sm overflow-hidden transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel})`,
                  aspectRatio: `${currentResolution.width} / ${currentResolution.height}`,
                  width: fitMode === 'cover' ? '100%' : undefined,
                  height: fitMode === 'cover' ? '100%' : undefined,
                }}
              >
                {/* Sonar Waterfall Image */}
                <img
                  src={
                    activeItem.annotatedImage ||
                    (activeItem.image.startsWith('blob:')
                      ? activeItem.image
                      : `${import.meta.env.BASE_URL}sonar/${activeItem.image}`)
                  }
                  alt="Side-Scan Sonar Waterfall"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth && img.naturalHeight) {
                      setCurrentResolution({
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        aspectRatio: parseFloat((img.naturalWidth / img.naturalHeight).toFixed(2)),
                      });
                    }
                  }}
                  className={`w-full h-full ${
                    fitMode === 'cover' ? 'object-cover' : 'object-fill'
                  } select-none block transition-all duration-300 ${
                    filterMode === 'CLAHE Enhanced'
                      ? 'contrast-[1.35] brightness-[1.08] saturate-125'
                      : 'contrast-100 brightness-95'
                  }`}
                />

                {/* SVG Detection Overlays (Highlight Masks + Separated Acoustic Shadows) */}
                {showOverlay && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="targetHighlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.25" />
                        </linearGradient>
                        <linearGradient id="selectedHighlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a3e635" stopOpacity="0.55" />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.35" />
                        </linearGradient>
                      </defs>

                      {activeDetections.map((target, tIdx) => {
                        const isSelected = tIdx === selectedTargetIdx;
                        const polyPct = target.segmentation_mask_pct || target.obb?.polygon_pct;
                        const shadowPct = target.shadow_mask_pct;

                        return (
                          <g key={target.id || tIdx}>
                            {/* Separated Acoustic Shadow Candidate Polygon (Dashed Cyan / Dark Dropout) */}
                            {shadowPct && shadowPct.length > 2 && (
                              <polygon
                                points={shadowPct.map((pt) => `${pt[0]},${pt[1]}`).join(' ')}
                                fill="rgba(6, 182, 212, 0.18)"
                                stroke="#06b6d4"
                                strokeWidth="0.5"
                                strokeDasharray="1.5 1"
                                className="transition-all"
                              />
                            )}

                            {/* Physical Target Highlight Mask Polygon */}
                            {polyPct && polyPct.length > 2 && (
                              <polygon
                                points={polyPct.map((pt) => `${pt[0]},${pt[1]}`).join(' ')}
                                fill={isSelected ? 'url(#selectedHighlightGrad)' : 'url(#targetHighlightGrad)'}
                                stroke={isSelected ? '#a3e635' : '#38bdf8'}
                                strokeWidth={isSelected ? '0.9' : '0.6'}
                                className="transition-all"
                              />
                            )}
                          </g>
                        );
                      })}
                    </svg>

                    {/* Interactive Reticle Callout Badges */}
                    {activeDetections.map((target, tIdx) => {
                      if (!target.obb) return null;
                      const isSelected = tIdx === selectedTargetIdx;
                      const left = target.obb.left_pct ?? 50;
                      const top = target.obb.top_pct ?? 50;

                      return (
                        <div
                          key={target.id || tIdx}
                          style={{ left: `${left}%`, top: `${top}%` }}
                          onClick={() => onSelectTarget(tIdx)}
                          className={`absolute pointer-events-auto p-1.5 rounded-xl backdrop-blur-md cursor-pointer transition-all duration-200 border ${
                            isSelected
                              ? 'bg-surface-container-high/90 border-emerald-400 shadow-[0_0_16px_rgba(163,230,53,0.5)] scale-105 z-30'
                              : 'bg-surface-container-low/75 border-white/10 hover:border-white/30 z-20'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-mono text-[9px]">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-primary'
                              }`}
                            />
                            <span className="font-bold text-white">
                              {target.target_id || target.id}
                            </span>
                            <span className="text-secondary">{formatPercentage(target.confidence)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Range Measurement Hash Marks (Left Edge) */}
              <div className="absolute left-2.5 top-12 bottom-12 flex flex-col justify-between pointer-events-none text-outline-variant font-mono text-[9px] z-20">
                <span>-75m</span>
                <span>-50m</span>
                <span>-25m</span>
                <span className="text-secondary font-bold">0m</span>
                <span>+25m</span>
                <span>+50m</span>
                <span>+75m</span>
              </div>

              {/* Bottom Telemetry Overlay Badge (Left) */}
              <div className="absolute bottom-2.5 left-3 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/90 backdrop-blur-md shadow-md border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                <span className="text-[10px] font-mono text-on-surface font-semibold uppercase tracking-wider">
                  ANALYSIS COMPLETE • TARGET #{currentTarget.target_id || currentTarget.id} HIGHLIGHTED
                </span>
              </div>

              {/* Bottom Coordinates & Depth HUD (Right) */}
              <div className="absolute bottom-2.5 right-3 z-20 hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/90 backdrop-blur-md text-[10px] font-mono text-on-surface-variant border border-white/5">
                <span>LAT: {currentTarget.position?.lat || '34°12\'08.4"N'}</span>
                <span className="text-outline">|</span>
                <span>LON: {currentTarget.position?.lon || '119°54\'32.1"W'}</span>
                <span className="text-outline">|</span>
                <span className="text-secondary font-bold">DEPTH: {currentTarget.depth || activeItem.depth}</span>
              </div>

              {/* Scanning HUD Overlay during Live Inference */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-surface-container-lowest/85 backdrop-blur-md flex flex-col items-center justify-center z-40">
                  <div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-secondary animate-spin mb-3" />
                  <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    YOLO11-Seg Sonar Inference Active
                  </div>
                  <div className="text-[11px] font-mono text-secondary mt-1">
                    {analysisStep || 'Analyzing Acoustic Backscatter & Directional Shadow Droplets...'}
                  </div>
                </div>
              )}
            </div>

            {/* Scrubber Waterfall Timeline Bar */}
            <div className="px-4 py-2 bg-surface-container-high/50 border-t border-white/[0.06] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-6 h-6 rounded-lg bg-primary-container hover:bg-primary-container/90 flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button className="w-6 h-6 rounded-lg bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center text-white transition-colors cursor-pointer">
                    <SkipBack className="w-3 h-3 text-slate-300" />
                  </button>
                  <button className="w-6 h-6 rounded-lg bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center text-white transition-colors cursor-pointer">
                    <SkipForward className="w-3 h-3 text-slate-300" />
                  </button>
                  <span className="text-primary font-bold ml-1">
                    FRAME 0248 <span className="text-outline">/ 1850</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-on-surface-variant">REC: 14:28:09 UTC</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-bold">
                    100% PING DENSITY
                  </span>
                </div>
              </div>

              {/* Progress Slider Track with Anomaly Clusters */}
              <div className="w-full h-2.5 bg-surface-container-lowest rounded-full overflow-hidden relative cursor-pointer flex items-center px-0.5">
                <div className="h-1.5 bg-gradient-to-r from-primary-container via-primary/80 to-secondary rounded-full w-full relative">
                  <div className="h-full bg-gradient-to-r from-primary-container to-secondary rounded-full w-[28%]" />
                  {/* Cluster event markers along timeline */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-[28%] w-2.5 h-2.5 rounded-full bg-secondary shadow-md ring-2 ring-primary/40" />
                  <div className="absolute top-1/2 -translate-y-1/2 left-[44%] w-1.5 h-1.5 rounded-full bg-tertiary" />
                  <div className="absolute top-1/2 -translate-y-1/2 left-[62%] w-1.5 h-1.5 rounded-full bg-outline" />
                  <div className="absolute top-1/2 -translate-y-1/2 left-[88%] w-2 h-2 rounded-full bg-rose-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Acoustic SNR & Substrate Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
            <GlassPanel level={2} className="p-2.5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-outline text-[10px] uppercase">Acoustic SNR</span>
                <span className="text-tertiary font-bold">18.4 dB</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full w-3/4" />
              </div>
              <span className="text-[9px] text-on-surface-variant">High acoustic signal clarity</span>
            </GlassPanel>

            <GlassPanel level={2} className="p-2.5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-outline text-[10px] uppercase">Substrate Density</span>
                <span className="text-primary font-bold">0.62 (SILT)</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full w-3/5" />
              </div>
              <span className="text-[9px] text-on-surface-variant">Compatible acoustic penetrability</span>
            </GlassPanel>

            <GlassPanel level={2} className="p-2.5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-outline text-[10px] uppercase">USBL Confidence</span>
                <span className="text-secondary font-bold">±1.8m RAD</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full w-4/5" />
              </div>
              <span className="text-[9px] text-on-surface-variant">Estimated vehicle position reference</span>
            </GlassPanel>
          </div>
        </section>

        {/* Right: Translucent Inspector Shelf (approx 32% - 4 cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-2.5">
          {/* Target Selector Tabs if multiple detections */}
          {activeDetections.length > 1 && (
            <GlassPanel level={2} className="p-2.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-outline uppercase font-semibold">
                <span>Detected Contacts ({activeDetections.length}):</span>
                <span className="text-secondary font-mono text-[9px]">ACTIVE: #{selectedTargetIdx + 1}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {activeDetections.map((d, i) => (
                  <button
                    key={d.id || i}
                    onClick={() => onSelectTarget(i)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      i === selectedTargetIdx
                        ? 'bg-primary-container text-white shadow-md ring-1 ring-secondary/50'
                        : 'bg-surface-container-high/60 text-outline hover:text-slate-200'
                    }`}
                  >
                    <span>#{i + 1} {d.class.split('(')[0].trim()}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-secondary">
                      {formatPercentage(d.confidence)}
                    </span>
                  </button>
                ))}
              </div>
            </GlassPanel>
          )}

          {/* 1. Evidence Inspector */}
          <EvidenceInspector target={currentTarget} scenario={activeItem} />

          {/* 1b. Physical Acoustic Height Inversion & Navigational Clearance */}
          <HeightInversionWidget
            target={currentTarget}
            scenarioDepth={activeItem?.depth}
            onDispatchNotmar={() => onNavigateToTab?.('action-dispatch')}
          />

          {/* 2. Decoupled Risk & Priority Cards */}
          <RiskPriorityCard target={currentTarget} />

          {/* 3. Authoritative RAG Knowledge Card */}
          <RAGKnowledgeCard
            target={currentTarget}
            onExploreLiterature={() => onNavigateToTab?.('rag-evidence')}
          />

          {/* 4. Actionable Human Review Bar */}
          <HumanReviewBar
            target={currentTarget}
            onConfirm={onConfirm}
            onReject={onReject}
            onMarkUnknown={onMarkUnknown}
            onQueueResurvey={onQueueResurvey}
          />

          {/* 5. GIS Tactical Geo-Location Mini-Map */}
          <GisMiniMap
            target={currentTarget}
            onExpand={() => onNavigateToTab?.('gis-map')}
          />
        </aside>
      </div>
    </div>
  );
};

export default SonarAnalysisView;
