import React, { useState, useRef } from 'react';
import { GlassPanel } from '../components/GlassPanel';
import { StatusBadge } from '../components/StatusBadge';
import {
  Upload,
  Waves,
  CheckCircle2,
  Zap,
  ArrowRight,
  Compass,
  FileText,
  AlertCircle,
  FileCheck,
  Radar,
} from 'lucide-react';

interface UploadViewProps {
  onProcessFile: (file: File, metadata: { altitude: string; frequency: string; heading: string; missionName: string }) => Promise<void>;
  onSelectSample: (filename: string, name: string) => void;
  isAnalyzing: boolean;
  analysisStep: string;
  onNavigateToTab: (tab: any) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onProcessFile,
  onSelectSample,
  isAnalyzing,
  analysisStep,
  onNavigateToTab,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{ width: number; height: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Hydrographic metadata state
  const [altitude, setAltitude] = useState<string>('11.4');
  const [frequency, setFrequency] = useState<string>('450 kHz / 900 kHz CHIRP');
  const [heading, setHeading] = useState<string>('275° (W)');
  const [missionName, setMissionName] = useState<string>('Survey_Transect_Echo_26057');
  const [surveyNotes, setSurveyNotes] = useState<string>('High-density seabed sweep co-registered for automated debris detection.');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setImageDims({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;

    if (!missionName || missionName === 'Survey_Transect_Echo_26057') {
      setMissionName(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    await onProcessFile(selectedFile, {
      altitude: `${altitude} m`,
      frequency,
      heading,
      missionName,
    });
    onNavigateToTab('sonar-analysis');
  };

  const sampleScenarios = [
    {
      name: 'Cargo Container / Tyre Complex',
      file: 'clear_debris_blue.jpg',
      freq: '455 kHz',
      alt: '12.4m',
      desc: 'High acoustic contrast cargo unit on silty benthic substrate with clear shadow shelf.',
    },
    {
      name: 'Shallow Shipwreck Anomaly',
      file: 'shallow_wreck_anomaly.jpg',
      freq: '900 kHz',
      alt: '9.8m',
      desc: 'Elongated vessel hull structure with high-reflectivity acoustic ribbing and shadow dropout.',
    },
    {
      name: 'Subsea Tire Reef Complex',
      file: 'tire_reef_complex.jpg',
      freq: '450 kHz',
      alt: '11.0m',
      desc: 'Multiple circular anthropogenic anomalies clustered along shallow benthic transect.',
    },
    {
      name: 'Pipeline & Submerged Debris',
      file: 'pipeline_anomaly.jpg',
      freq: '900 kHz',
      alt: '14.2m',
      desc: 'Linear infrastructure corridor with adjacent discarded marine debris contacts.',
    },
  ];

  return (
    <div className="flex-1 w-full h-full p-4 lg:p-6 overflow-y-auto space-y-4 max-w-[1920px] mx-auto custom-scrollbar">
      {/* Top Console Header */}
      <GlassPanel level={2} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary">INGESTION CONSOLE</span>
            <span className="text-white/20">•</span>
            <StatusBadge label="OFFLINE PIPELINE" variant="valid" size="sm" />
            <StatusBadge label="YOLO11-SEG READY" variant="info" size="sm" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight font-mono">
            Side-Scan Sonar Data Ingestion &amp; Live AI Execution
          </h1>
          <p className="text-xs text-on-surface-variant max-w-3xl">
            Import raw side-scan sonar waterfall records (.jpg, .png, .tif, .sss, .xtf) into the analytical workstation. 
            Configure acquisition tow geometry to calculate honest slant-to-ground coordinates, pre-inference QA checks, and multi-target instance segmentation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateToTab('sonar-analysis')}
            className="px-3.5 py-2 rounded-xl bg-surface-container-high/60 hover:bg-surface-container-high border border-white/[0.08] text-xs font-mono text-slate-200 transition-colors cursor-pointer"
          >
            Cancel &amp; Return
          </button>
        </div>
      </GlassPanel>

      {/* Main Form & Dropzone Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Drag & Drop Zone + Preview (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-3xl border-2 border-dashed p-8 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[360px] ${
              isDragOver
                ? 'border-secondary bg-secondary-container/20 shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-[1.01]'
                : selectedFile
                ? 'border-primary/60 bg-surface-container-high/20'
                : 'border-white/[0.12] hover:border-primary/40 bg-surface-container-lowest/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.sss,.xtf,.dat,.tif,.tiff"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {previewUrl ? (
              <div className="flex flex-col items-center gap-4 w-full text-center">
                <div className="relative w-full max-w-md h-56 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                  <img src={previewUrl} alt="Sonar Scan Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-xs font-bold text-white truncate max-w-[280px]">
                      {selectedFile?.name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-outline">
                  <span className="px-2 py-1 rounded-lg bg-surface-container-high/60 border border-white/5">
                    SIZE: {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB
                  </span>
                  {imageDims && (
                    <span className="px-2 py-1 rounded-lg bg-surface-container-high/60 border border-white/5">
                      DIMS: {imageDims.width} × {imageDims.height} px
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-lg bg-surface-container-high/60 border border-white/5">
                    FORMAT: {selectedFile?.name.split('.').pop()?.toUpperCase() || 'RAW'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-[11px] font-mono text-secondary transition-colors"
                >
                  Choose Different Sonar File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-3xl bg-surface-container-high/60 border border-white/[0.08] flex items-center justify-center text-primary shadow-inner">
                  <Upload className="w-7 h-7 text-secondary animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Drag &amp; Drop Side-Scan Sonar File Here
                  </h3>
                  <p className="text-xs text-outline mt-1 max-w-sm">
                    Upload waterfall sweeps in PNG, JPG, JPEG, TIFF, SSS, or XTF formats
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 rounded-xl bg-primary-container/60 hover:bg-primary-container border border-primary/40 text-white font-mono text-xs font-semibold shadow-sm transition-all"
                >
                  Browse Local Storage
                </button>
              </div>
            )}
          </div>

          {/* Quick Preload Benchmark Scenarios */}
          <GlassPanel level={2} className="p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-outline uppercase tracking-wider font-semibold">
                Or Preload Official SIH26057 Reference Missions:
              </span>
              <span className="text-[10px] font-mono text-secondary">4 BENCHMARKS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sampleScenarios.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectSample(s.file, s.name);
                    onNavigateToTab('sonar-analysis');
                  }}
                  className="p-3 rounded-2xl bg-surface-container-high/30 hover:bg-surface-container-high/70 border border-white/[0.06] hover:border-primary/40 text-left transition-all cursor-pointer flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                      {s.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary-container/30 text-secondary border border-primary/20 font-bold">
                      {s.freq}
                    </span>
                  </div>
                  <p className="text-[10px] text-outline line-clamp-2 leading-relaxed">
                    {s.desc}
                  </p>
                  <span className="text-[9px] font-mono text-secondary/80 mt-0.5">
                    Towfish Altitude: {s.alt}
                  </span>
                </button>
              ))}
            </div>
          </GlassPanel>
        </section>

        {/* Right: Hydrographic Sensor & Acquisition Settings (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <GlassPanel level={2} className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-secondary" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Towfish Sensor Config
                </span>
              </div>
              <span className="text-[10px] font-mono text-secondary font-semibold">
                ACQUISITION SPEC
              </span>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-outline uppercase font-semibold">
                  Transect File Identifier
                </label>
                <input
                  type="text"
                  value={missionName}
                  onChange={(e) => setMissionName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-white focus:outline-none focus:border-primary/60 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-outline uppercase font-semibold">
                  Acoustic Transducer Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-white focus:outline-none focus:border-primary/60 text-xs"
                >
                  <option value="450 kHz / 900 kHz CHIRP">450 / 900 kHz Dual CHIRP (Wide Search + High Res)</option>
                  <option value="455 kHz Standard">455 kHz Standard Swath (75m Port/Stbd)</option>
                  <option value="900 kHz High-Res">900 kHz High-Resolution (50m Port/Stbd)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-outline uppercase font-semibold">
                    Towfish Altitude (m)
                  </label>
                  <input
                    type="text"
                    value={altitude}
                    onChange={(e) => setAltitude(e.target.value)}
                    placeholder="11.4"
                    className="px-3 py-2 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-white focus:outline-none focus:border-primary/60 text-xs"
                  />
                  <span className="text-[9px] text-outline">Nominal 10-15% of swath range</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-outline uppercase font-semibold">
                    Tow Heading
                  </label>
                  <input
                    type="text"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="275° (W)"
                    className="px-3 py-2 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-white focus:outline-none focus:border-primary/60 text-xs"
                  />
                  <span className="text-[9px] text-outline">Magnetic gyro reference</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-outline uppercase font-semibold">
                  Survey Log Notes
                </label>
                <textarea
                  rows={2}
                  value={surveyNotes}
                  onChange={(e) => setSurveyNotes(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-white focus:outline-none focus:border-primary/60 text-xs resize-none"
                />
              </div>
            </div>

            {/* QA Gate Pre-Flight Notice */}
            <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/[0.05] flex items-start gap-2.5 text-xs">
              <Radar className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 text-[11px]">
                <span className="font-mono font-bold text-white">Pre-Inference QA Gate</span>
                <span className="text-outline">
                  Acoustic saturation, dynamic range, and speckle noise will be evaluated before YOLO11-Seg segmentation.
                </span>
              </div>
            </div>

            {/* Execution CTA Button */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || isAnalyzing}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary-container via-primary to-secondary text-white font-mono text-sm font-bold flex items-center justify-center gap-2.5 shadow-[0_0_24px_rgba(6,182,212,0.4)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Zap className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'SEGMENTING WATERFALL...' : 'EXECUTE YOLO11-SEG PIPELINE'}</span>
                {!isAnalyzing && <ArrowRight className="w-4 h-4" />}
              </button>

              {isAnalyzing && (
                <div className="text-center text-xs font-mono text-secondary animate-pulse">
                  {analysisStep || 'Executing YOLO11-Seg Multi-Target Segmentation...'}
                </div>
              )}
            </div>
          </GlassPanel>
        </section>
      </div>
    </div>
  );
};
