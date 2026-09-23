import React, { useState } from 'react';
import { GlassPanel } from '../components/GlassPanel';
import { StatusBadge } from '../components/StatusBadge';
import { DetectionTarget } from '../App';
import {
  Radar,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Download,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { formatPercentage } from '../utils/formatters';

interface DetectionsViewProps {
  detections: DetectionTarget[];
  selectedTargetIdx: number;
  onSelectTarget: (index: number) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DetectionsView: React.FC<DetectionsViewProps> = ({
  detections,
  selectedTargetIdx,
  onSelectTarget,
  onNavigateToTab,
}) => {
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = detections.filter((d) => {
    const matchesClass =
      filterClass === 'ALL' ||
      d.class.toLowerCase().includes(filterClass.toLowerCase()) ||
      (d.class_type && d.class_type.toLowerCase().includes(filterClass.toLowerCase()));

    const matchesStatus =
      filterStatus === 'ALL' ||
      d.status.toLowerCase() === filterStatus.toLowerCase();

    const matchesPriority =
      filterPriority === 'ALL' ||
      (d.removal_priority && d.removal_priority.includes(filterPriority));

    const matchesSearch =
      searchQuery === '' ||
      d.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.target_id && d.target_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.position.lat.includes(searchQuery) ||
      d.position.lon.includes(searchQuery);

    return matchesClass && matchesStatus && matchesPriority && matchesSearch;
  });

  const handleReset = () => {
    setFilterClass('ALL');
    setFilterStatus('ALL');
    setFilterPriority('ALL');
    setSearchQuery('');
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Class', 'Confidence', 'Status', 'Lat', 'Lon', 'Depth', 'Reliability'];
    const rows = filtered.map((d) => [
      d.target_id || d.id,
      `"${d.class}"`,
      d.confidence,
      d.status,
      d.position.lat,
      d.position.lon,
      d.depth,
      d.reliability,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `detections_inventory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 w-full h-full p-4 lg:p-6 overflow-y-auto space-y-4 max-w-[1920px] mx-auto custom-scrollbar">
      {/* Top Banner / Inventory Ledger Header (Stitch Architecture) */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container-low/90 backdrop-blur-2xl p-4 lg:p-5 border border-white/[0.08] shadow-sm stitch-card-sheen">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="px-space-sm py-0.5 rounded-full bg-surface-container-highest text-secondary text-[10px] font-mono uppercase tracking-widest border border-white/5 font-semibold">
                INVENTORY LEDGER // SIH-AUTONOMOUS-SAHI
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              <span className="text-[10px] font-mono text-tertiary font-semibold">
                SYNCHRONIZED WITH NODE-04
              </span>
            </div>
            <h1 className="font-headline-lg text-lg sm:text-2xl text-on-surface tracking-tight font-bold">
              Target Detections &amp; Anomaly Inventory
            </h1>
            <p className="text-xs text-on-surface-variant max-w-3xl">
              Offline Automated SAHI Inference with Uncertainty &amp; Ecological Risk Assessment
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm self-start md:self-auto">
            <div className="px-space-md py-1.5 rounded-xl bg-surface-container-high/80 border border-white/[0.06] flex items-center gap-space-sm">
              <Radar className="w-4 h-4 text-secondary" />
              <div className="flex flex-col text-[11px] font-mono">
                <span className="text-outline text-[9px] uppercase">Confidence Cutoff</span>
                <span className="text-on-surface font-bold">τ ≥ 0.40 (Dense Patch)</span>
              </div>
            </div>

            <button
              onClick={handleExportCsv}
              className="h-9 px-space-md rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-mono font-semibold transition-all flex items-center gap-space-xs shadow-md border border-white/5 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-secondary" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </section>

      {/* Multi-Parameter Filter & Query Ribbon (Stitch Architecture) */}
      <section className="rounded-2xl bg-surface-container-low/80 backdrop-blur-xl p-space-md border border-white/[0.08] shadow-lg flex flex-col gap-space-sm stitch-card-sheen">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-space-sm items-center">
          {/* Search Box (4 cols) */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coordinates, target hash, class ID, or shadow profiles..."
              className="w-full h-9 pl-9 pr-space-md rounded-xl bg-surface-container-lowest/80 border border-white/[0.06] text-on-surface placeholder:text-outline text-xs font-mono focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          {/* Class Filter (3 cols) */}
          <div className="lg:col-span-3 flex items-center gap-space-xs">
            <span className="text-[10px] font-mono text-outline uppercase whitespace-nowrap">Class:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full h-9 px-space-sm rounded-xl bg-surface-container-high border border-white/[0.06] text-on-surface text-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              <option value="Ghost Gear">Ghost Gear (Nets/Lines)</option>
              <option value="Shipwreck">Shipwreck / Vessel</option>
              <option value="Container">Shipping Container</option>
              <option value="Tyre">Tyres &amp; Rubber</option>
              <option value="Building">Subsea Structure</option>
              <option value="Metallic">Metallic Hardware</option>
            </select>
          </div>

          {/* Status Filter (2 cols) */}
          <div className="lg:col-span-2 flex items-center gap-space-xs">
            <span className="text-[10px] font-mono text-outline uppercase whitespace-nowrap">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-9 px-space-sm rounded-xl bg-surface-container-high border border-white/[0.06] text-on-surface text-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL">All States</option>
              <option value="Pending">Pending Review</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rejected">Rejected</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          {/* Priority Filter (2 cols) */}
          <div className="lg:col-span-2 flex items-center gap-space-xs">
            <span className="text-[10px] font-mono text-outline uppercase whitespace-nowrap">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full h-9 px-space-sm rounded-xl bg-surface-container-high border border-white/[0.06] text-on-surface text-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL">P1 - P4 All</option>
              <option value="P1">P1 Critical</option>
              <option value="P2">P2 High Risk</option>
              <option value="P3">P3 Monitored</option>
              <option value="P4">P4 Low Risk</option>
            </select>
          </div>

          {/* Reset Button (1 col) */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              onClick={handleReset}
              className="h-9 px-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-[11px] font-mono uppercase transition-all w-full flex items-center justify-center gap-1 border border-white/5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Subtitle Telemetry Info */}
        <div className="flex flex-wrap items-center justify-between gap-space-xs pt-1 px-1 text-outline text-[11px] font-mono">
          <div className="flex items-center gap-space-md">
            <span>
              DISPLAYED:{' '}
              <strong className="text-secondary font-bold">
                {filtered.length} OF {detections.length} TARGETS
              </strong>
            </span>
            <span className="hidden sm:inline">
              INFERENCE PATCH:{' '}
              <strong className="text-on-surface font-bold">640×640 px (Overlap: 25%)</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="text-on-surface-variant">Click any target to inspect co-registered sonar telemetry</span>
          </div>
        </div>
      </section>

      {/* 12-Column Structured Table Header (Stitch Architecture) */}
      <div className="hidden xl:grid grid-cols-12 gap-space-md px-space-md py-1 text-outline text-[10px] font-mono uppercase tracking-wider font-semibold">
        <div className="col-span-3">Target &amp; Identity</div>
        <div className="col-span-2">Model Conf &amp; Anthropogenic</div>
        <div className="col-span-2">Acoustic Shadow &amp; Height</div>
        <div className="col-span-2">Estimated Geolocation Fix</div>
        <div className="col-span-2">Eco Risk &amp; Priority</div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      {/* Detections Rows List (Stitch Target Cards) */}
      <div className="flex flex-col gap-space-xs">
        {filtered.map((target, idx) => {
          const originalIdx = detections.findIndex((d) => d.id === target.id);
          const isSelected = originalIdx === selectedTargetIdx;

          return (
            <div
              key={target.id || idx}
              onClick={() => {
                onSelectTarget(originalIdx);
                onNavigateToTab('sonar-analysis');
              }}
              className={`rounded-2xl p-space-md transition-all duration-200 shadow-md flex flex-col xl:grid xl:grid-cols-12 gap-space-md items-start xl:items-center cursor-pointer border ${
                isSelected
                  ? 'bg-surface-container-high/90 border-secondary shadow-[0_0_20px_rgba(123,208,255,0.2)]'
                  : 'bg-surface-container/60 hover:bg-surface-container-high/70 border-white/[0.06]'
              }`}
            >
              {/* Col 1-3: Target & Identity */}
              <div className="xl:col-span-3 flex items-center gap-space-md w-full">
                <div className="w-12 h-12 rounded-xl bg-surface-container-lowest border border-white/10 flex items-center justify-center font-mono text-sm font-bold text-secondary shrink-0 shadow-inner">
                  #{target.target_id || target.id}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-primary">
                      {target.target_id || target.id}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-primary-container/40 text-on-primary-container text-[9px] font-mono font-semibold">
                      {target.class_type || 'ANTHROPOGENIC'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface truncate">
                    {target.class}
                  </span>
                  <span className="text-[10px] font-mono text-outline">
                    Reliability: {target.reliability.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Col 4-5: Model Confidence & Anthropogenic Score */}
              <div className="xl:col-span-2 flex flex-col gap-1 w-full font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-outline text-[10px]">CONF:</span>
                  <span className="text-primary font-bold">{formatPercentage(target.confidence)}</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${Math.round(target.confidence * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-on-surface-variant">
                  Shadow Margin: {formatPercentage(target.shadowStrength)}
                </span>
              </div>

              {/* Col 6-7: Acoustic Shadow & Dimensions */}
              <div className="xl:col-span-2 flex flex-col font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      target.shadowStrength > 0.4
                        ? 'bg-tertiary-container/40 text-tertiary border border-tertiary/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    {target.shadowStrength > 0.4 ? 'SUPPORTED' : 'AMBIGUOUS'}
                  </span>
                  <span className="text-secondary font-semibold">
                    {target.dimensions?.height || '1.2m'} H
                  </span>
                </div>
                <span className="text-[10px] text-outline mt-0.5">
                  Dim: {target.dimensions?.width || '3.5m'} × {target.dimensions?.height || '1.2m'}
                </span>
              </div>

              {/* Col 8-9: Estimated Geolocation Fix */}
              <div className="xl:col-span-2 flex flex-col font-mono text-[11px]">
                <span className="text-on-surface font-semibold">
                  {target.position.lat}, {target.position.lon}
                </span>
                <span className="text-[10px] text-secondary">
                  Depth: {target.depth} • USBL ±1.8m
                </span>
              </div>

              {/* Col 10-11: Ecological Risk & Priority */}
              <div className="xl:col-span-2 flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-xl text-[10px] font-mono font-bold border ${
                    target.removal_priority?.includes('P1') || target.removal_priority?.includes('CRITICAL')
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : target.removal_priority?.includes('P2') || target.removal_priority?.includes('HIGH')
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-primary-container/30 text-primary border-primary/20'
                  }`}
                >
                  {target.removal_priority || 'P2 - HIGH RISK'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    target.status === 'Confirmed'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : target.status === 'Rejected'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-surface-container-high text-outline border-white/5'
                  }`}
                >
                  {target.status.toUpperCase()}
                </span>
              </div>

              {/* Col 12: Action Button */}
              <div className="xl:col-span-1 flex justify-end w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTarget(originalIdx);
                    onNavigateToTab('sonar-analysis');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-primary-container hover:bg-primary-container/90 text-white text-xs font-mono font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-outline font-mono text-xs rounded-2xl bg-surface-container/40 border border-white/[0.06]">
            No contacts matching current filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionsView;
