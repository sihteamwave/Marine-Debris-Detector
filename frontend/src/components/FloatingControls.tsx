import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Eye, EyeOff, Zap, Download, Upload } from 'lucide-react';

interface FloatingControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  filterMode: 'Raw' | 'CLAHE Enhanced';
  onToggleFilter: () => void;
  showOverlay: boolean;
  onToggleOverlay: () => void;
  fitMode: 'contain' | 'cover';
  onToggleFit: () => void;
  isAnalyzing: boolean;
  onRunLiveInference: () => void;
  onExport: (format: 'JSON' | 'CSV') => void;
  onOpenUpload?: () => void;
  resolutionText?: string;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  filterMode,
  onToggleFilter,
  showOverlay,
  onToggleOverlay,
  fitMode,
  onToggleFit,
  isAnalyzing,
  onRunLiveInference,
  onExport,
  onOpenUpload,
  resolutionText,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 p-0.5 rounded-lg bg-surface-container-highest/60 select-none">
      {/* Zoom Group */}
      <div className="flex items-center gap-0.5 bg-surface-container/70 p-0.5 rounded-xl">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-on-surface transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5 text-slate-300" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-on-surface transition-colors cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5 text-slate-300" />
        </button>
        <button
          onClick={onResetZoom}
          title="Reset Zoom to 1:1"
          className="px-2 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-[10px] font-mono text-slate-300 transition-colors cursor-pointer"
        >
          1:1
        </button>
      </div>

      <div className="w-px h-4 bg-white/[0.1] my-auto" />

      {/* Raw / CLAHE Toggle */}
      <button
        onClick={onToggleFilter}
        className={`px-2.5 h-7 rounded-xl text-[10px] font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
          filterMode === 'CLAHE Enhanced'
            ? 'bg-primary-container/60 text-primary border-primary/40 shadow-sm'
            : 'bg-surface-container/70 text-slate-400 border-transparent hover:text-slate-200'
        }`}
        title="Toggle Contrast Limited Adaptive Histogram Equalization"
      >
        <span>CLAHE</span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            filterMode === 'CLAHE Enhanced' ? 'bg-secondary' : 'bg-outline'
          }`}
        />
      </button>

      {/* Mask & Shadow Overlay Toggle */}
      <button
        onClick={onToggleOverlay}
        className={`px-2.5 h-7 rounded-xl text-[10px] font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
          showOverlay
            ? 'bg-secondary-container/30 text-secondary border-secondary/40 shadow-sm'
            : 'bg-surface-container/70 text-slate-400 border-transparent hover:text-slate-200'
        }`}
        title="Toggle AI Detection Polygons & Shadows"
      >
        {showOverlay ? (
          <Eye className="w-3.5 h-3.5 text-secondary" />
        ) : (
          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span className="hidden sm:inline">OVERLAYS</span>
      </button>

      {/* Fit Mode Toggle */}
      <button
        onClick={onToggleFit}
        className="px-2 h-7 rounded-xl bg-surface-container/70 hover:bg-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
        title={`Scale mode: ${fitMode.toUpperCase()}`}
      >
        <Maximize className="w-3 h-3 text-outline" />
        <span className="uppercase">{fitMode}</span>
      </button>

      {resolutionText && (
        <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono text-outline">
          {resolutionText}
        </span>
      )}

      <div className="w-px h-4 bg-white/[0.1] my-auto" />

      {/* Upload Scan Button */}
      {onOpenUpload && (
        <button
          onClick={onOpenUpload}
          className="px-2.5 h-7 rounded-xl bg-surface-container/80 hover:bg-surface-container-high text-secondary hover:text-white text-[11px] font-mono font-medium flex items-center gap-1.5 border border-white/[0.06] transition-all cursor-pointer"
          title="Upload / Ingest Side-Scan Sonar Scan"
        >
          <Upload className="w-3.5 h-3.5 text-secondary" />
          <span className="hidden sm:inline">Upload</span>
        </button>
      )}

      {/* Run Live AI Action Button */}
      <button
        onClick={onRunLiveInference}
        disabled={isAnalyzing}
        className="px-3 h-7 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container/80 hover:from-primary-container/90 hover:to-secondary-container text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 shadow-[0_2px_12px_rgba(30,111,159,0.4)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        title="Run YOLO11-Seg Detection Analysis"
      >
        <Zap
          className={`w-3.5 h-3.5 text-secondary ${
            isAnalyzing ? 'animate-spin' : 'animate-pulse'
          }`}
        />
        <span>{isAnalyzing ? 'Analyzing...' : 'Run Live AI'}</span>
      </button>

      {/* Export Quick Button */}
      <button
        onClick={() => onExport('JSON')}
        className="w-7 h-7 flex items-center justify-center rounded-xl bg-surface-container/70 hover:bg-white/10 text-on-surface transition-colors cursor-pointer"
        title="Export Findings as JSON Report"
      >
        <Download className="w-3.5 h-3.5 text-slate-300" />
      </button>
    </div>
  );
};
