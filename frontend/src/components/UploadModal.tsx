import React, { useState, useRef } from 'react';
import { Upload, X, Waves, CheckCircle2, Zap, ArrowRight, Compass } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessFile: (file: File, metadata: { altitude: string; frequency: string; heading: string; missionName: string }) => Promise<void>;
  onSelectSample: (filename: string, name: string) => void;
  isAnalyzing?: boolean;
  analysisStep?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onProcessFile,
  onSelectSample,
  isAnalyzing = false,
  analysisStep = '',
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

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
    onClose();
  };

  const sampleScenarios = [
    {
      name: 'Cargo Container / Tyre Complex',
      file: 'clear_debris_blue.jpg',
      freq: '455 kHz',
      alt: '12.4m',
    },
    {
      name: 'Shallow Shipwreck Anomaly',
      file: 'shallow_wreck_anomaly.jpg',
      freq: '900 kHz',
      alt: '9.8m',
    },
    {
      name: 'Subsea Tire Reef Complex',
      file: 'tire_reef_complex.jpg',
      freq: '450 kHz',
      alt: '11.0m',
    },
    {
      name: 'Pipeline & Submerged Debris',
      file: 'pipeline_anomaly.jpg',
      freq: '900 kHz',
      alt: '14.2m',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      {/* Outer Click Backdrop */}
      <div className="fixed inset-0" onClick={isAnalyzing ? undefined : onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl rounded-xl bg-surface-container-low/95 border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Specular highlight top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.07] bg-surface-container-high/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary-container/40 border border-primary/40 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Upload className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight flex items-center gap-2">
                <span>INGEST SIDE-SCAN SONAR DATA</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container/30 text-primary border border-primary/20 font-bold">
                  YOLO11-SEG
                </span>
              </h2>
              <p className="text-[11px] text-outline">
                Upload raw waterfall imagery (.jpg, .png, .tif, .sss, .xtf) for automated segmentation
              </p>
            </div>
          </div>

          {!isAnalyzing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-outline hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          {/* Drag & Drop Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed p-6 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
              isDragOver
                ? 'border-secondary bg-secondary-container/20 scale-[1.01]'
                : selectedFile
                ? 'border-primary/60 bg-surface-container-high/30'
                : 'border-white/[0.12] hover:border-primary/40 bg-surface-container-lowest/50'
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
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-black">
                  <img src={previewUrl} alt="Sonar Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono text-xs font-bold text-white truncate">
                      {selectedFile?.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-outline">
                    <span>SIZE: {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB</span>
                    {imageDims && (
                      <span>• DIMS: {imageDims.width} × {imageDims.height} px</span>
                    )}
                  </div>
                  <span className="text-[11px] text-secondary font-medium">
                    Ready for YOLO11-Seg instance segmentation. Click to choose another file.
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high/80 border border-white/[0.08] flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Waves className="w-6 h-6 text-secondary animate-pulse" />
                </div>
                <div className="text-center">
                  <div className="text-xs sm:text-sm font-semibold text-slate-200">
                    Drag and drop side-scan sonar image here, or <span className="text-primary underline">browse</span>
                  </div>
                  <div className="text-[10px] font-mono text-outline mt-1">
                    Supports PNG, JPG, JPEG, TIFF, SSS, and XTF waterfall sweeps
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Preload Sample Sonar Files */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider font-semibold">
              Or Select Reference SSS Acoustic Mission:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {sampleScenarios.map((s, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSample(s.file, s.name);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-surface-container-high/30 hover:bg-surface-container-high/60 border border-white/[0.06] hover:border-primary/40 text-left transition-all cursor-pointer flex flex-col gap-0.5 group"
                >
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                    {s.name}
                  </span>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-outline">
                    <span className="text-secondary">{s.freq}</span>
                    <span>• Alt: {s.alt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Acquisition Metadata Form */}
          <div className="p-3.5 rounded-2xl bg-surface-container-high/20 border border-white/[0.05] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-outline uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-secondary" />
                <span>Towfish Acquisition Parameters</span>
              </span>
              <span className="text-[9px] font-mono text-secondary font-semibold">HYDROGRAPHIC METADATA</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-outline">MISSION / TRANSECT ID</label>
                <input
                  type="text"
                  value={missionName}
                  onChange={(e) => setMissionName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest/80 border border-white/[0.08] text-white focus:outline-none focus:border-primary/60 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-outline">TRANSDUCER FREQUENCY</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest/80 border border-white/[0.08] text-white focus:outline-none focus:border-primary/60 text-xs"
                >
                  <option value="450 kHz / 900 kHz CHIRP">450 / 900 kHz Dual CHIRP</option>
                  <option value="455 kHz Standard">455 kHz Standard Swath</option>
                  <option value="900 kHz High-Res">900 kHz High-Resolution</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-outline">TOWFISH ALTITUDE (m)</label>
                <input
                  type="text"
                  value={altitude}
                  onChange={(e) => setAltitude(e.target.value)}
                  placeholder="11.4"
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest/80 border border-white/[0.08] text-white focus:outline-none focus:border-primary/60 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-outline">VESSEL HEADING</label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="275° (W)"
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest/80 border border-white/[0.08] text-white focus:outline-none focus:border-primary/60 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-white/[0.07] bg-surface-container-high/70 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="text-[10px] font-mono text-outline">
            {isAnalyzing ? (
              <span className="text-secondary animate-pulse">{analysisStep || 'Executing YOLO11-Seg...'}</span>
            ) : (
              <span>Offline inference via PyTorch on local hardware</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isAnalyzing && (
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-mono text-outline hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isAnalyzing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-container via-primary to-secondary text-white font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'SEGMENTING...' : 'RUN YOLO11-SEG AI'}</span>
              {!isAnalyzing && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
