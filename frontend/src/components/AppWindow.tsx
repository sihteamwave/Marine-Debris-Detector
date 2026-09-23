import React from 'react';
import { StatusBadge } from './StatusBadge';
import {
  Clock,
  Database,
  ChevronDown,
  Upload,
  Shield,
  Anchor,
  MapPin,
  UserCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { UserRole, SECTORS } from './GovernmentHeader';

interface AppWindowProps {
  children: React.ReactNode;
  activeScenarioId: string;
  activeScenarioName: string;
  scenarios: Array<{ id: string; name: string; confidence: number }>;
  onSelectScenario: (index: number) => void;
  showMissionDropdown: boolean;
  setShowMissionDropdown: (show: boolean) => void;
  onOpenDatasetModal?: () => void;
  onOpenUploadModal?: () => void;
  currentTime: string;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedSector: string;
  onSectorChange: (sectorName: string) => void;
}

export const AppWindow: React.FC<AppWindowProps> = ({
  children,
  activeScenarioId,
  activeScenarioName,
  scenarios,
  onSelectScenario,
  showMissionDropdown,
  setShowMissionDropdown,
  onOpenDatasetModal,
  onOpenUploadModal,
  currentTime,
  currentRole,
  onRoleChange,
  selectedSector,
  onSectorChange,
}) => {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-surface-container-lowest text-on-surface select-none">
      {/* 1. Sovereign National Security & Compliance Strip (Edge-to-Edge) */}
      <div className="h-6 shrink-0 bg-surface-container-lowest border-b border-white/[0.06] flex items-center justify-between px-3 sm:px-4 text-[10px] font-mono text-outline z-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-1 text-amber-400 font-semibold uppercase tracking-wider shrink-0">
            <Lock className="w-3 h-3 text-amber-400" />
            RESTRICTED
          </span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span className="text-slate-400 truncate hidden sm:inline">
            Official Hydrographic &amp; Coastal Defense Use • Govt. of India • MoES
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <span className="flex items-center gap-1 text-cyan-300">
            <CheckCircle2 className="w-3 h-3 text-cyan-300" />
            IHO S-44 1a
          </span>
          <span className="text-white/20 hidden md:inline">•</span>
          <span className="text-slate-400 hidden md:inline">IMO MARPOL V</span>
          <span className="text-white/20 hidden md:inline">•</span>
          <span className="flex items-center gap-1 text-emerald-400 hidden lg:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SHA-256 Active
          </span>
          <span className="text-white/20 hidden xl:inline">•</span>
          <div className="hidden xl:flex items-center gap-1 text-on-surface-variant font-mono">
            <Clock className="w-3 h-3 text-secondary" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* 2. Unified Master Operational Command Header (Edge-to-Edge) */}
      <header className="h-14 min-h-[56px] shrink-0 bg-surface-container-low/90 backdrop-blur-2xl border-b border-white/[0.08] flex items-center justify-between px-3 sm:px-4 lg:px-6 z-40 relative gap-3">
        {/* Left: Emblem & National Platform Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container via-primary/80 to-marine-800 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-white/20">
            <Anchor className="w-4 h-4 text-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight font-mono">
                SAMUDRA-SURAKSHA
              </span>
              <span className="text-[10px] text-primary font-medium hidden md:inline">
                (समुद्र-सुरक्षा)
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary-container/40 text-cyan-200 border border-primary/30 font-bold">
                v2.0-GOV
              </span>
            </div>
            <span className="text-[9px] text-on-surface-variant font-mono hidden xl:block opacity-75">
              National Hydrographic Debris &amp; Side-Scan Sonar Intelligence
            </span>
          </div>
        </div>

        {/* Center: Mission Scenario Selector & Sector Selector */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Active Mission Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMissionDropdown(!showMissionDropdown)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-surface-container-high/70 hover:bg-surface-container-high border border-white/[0.08] hover:border-primary/40 text-xs font-mono text-slate-200 transition-all cursor-pointer shadow-sm"
              title="Switch Active Sonar Mission Scenario"
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0" />
              <span className="text-secondary font-bold text-[11px] sm:text-xs">{activeScenarioId}:</span>
              <span className="text-slate-200 font-semibold max-w-[90px] sm:max-w-[140px] md:max-w-[180px] truncate text-[11px] sm:text-xs">
                {activeScenarioName.split('/')[0]}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
                  showMissionDropdown ? 'rotate-180 text-secondary' : ''
                }`}
              />
            </button>

            {/* Mission Dropdown Panel */}
            {showMissionDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMissionDropdown(false)} />
                <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-10 w-72 sm:w-80 bg-surface-container-low/98 backdrop-blur-3xl border border-white/[0.12] rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="text-[10px] font-mono text-outline px-2.5 py-1 uppercase tracking-wider border-b border-white/[0.06] flex items-center justify-between">
                    <span>Select Mission Scenario</span>
                    <span className="text-secondary font-bold">{scenarios.length} Scenarios</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1 custom-scrollbar">
                    {scenarios.map((sc, idx) => (
                      <button
                        key={sc.id}
                        onClick={() => {
                          onSelectScenario(idx);
                          setShowMissionDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          sc.id === activeScenarioId
                            ? 'bg-primary-container text-white font-bold shadow-sm'
                            : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="font-mono text-[11px] font-bold text-secondary">{sc.id}</div>
                          <div className="text-[11px] text-slate-300 truncate max-w-[180px] sm:max-w-[200px]">
                            {sc.name}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-secondary shrink-0">
                          {sc.confidence}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Maritime Sector Dropdown */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-high/50 border border-white/[0.08] text-xs font-mono">
            <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <select
              value={selectedSector}
              onChange={(e) => onSectorChange(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer max-w-[160px] lg:max-w-[210px] truncate"
            >
              {SECTORS.map((sec) => (
                <option key={sec.id} value={sec.name} className="bg-surface-container-high text-white">
                  {sec.id}: {sec.name.split('—')[1]?.trim() || sec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: RBAC Role, Action Buttons & Live Indicator */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* RBAC Role Selector */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-container/20 border border-primary/30 text-xs font-mono text-white">
            <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-white font-mono text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="FIELD_HYDROGRAPHER" className="bg-surface-container-high text-white">
                Role: Field Hydrographer
              </option>
              <option value="CHIEF_CERTIFIER" className="bg-surface-container-high text-white">
                Role: Chief Certifier
              </option>
              <option value="HARBOR_MASTER" className="bg-surface-container-high text-white">
                Role: Harbor Master
              </option>
              <option value="ENVIRONMENT_DIRECTOR" className="bg-surface-container-high text-white">
                Role: Environment Director
              </option>
            </select>
          </div>

          {/* Primary Action: Ingest Sonar */}
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-container via-primary/80 to-secondary-container/60 hover:from-primary-container hover:to-secondary-container border border-primary/50 text-white font-mono text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all active:scale-95 cursor-pointer"
              title="Ingest Raw Side-Scan Sonar Waterfall"
            >
              <Upload className="w-3.5 h-3.5 text-secondary animate-pulse" />
              <span className="hidden sm:inline">Ingest Sonar</span>
            </button>
          )}

          {/* Datasets Reference Modal Button */}
          {onOpenDatasetModal && (
            <button
              onClick={onOpenDatasetModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-high/50 hover:bg-surface-container-high border border-white/[0.08] hover:border-primary/40 text-xs text-primary transition-all cursor-pointer"
              title="View Training Datasets Catalog & Lineage"
            >
              <Database className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-[11px]">Datasets</span>
            </button>
          )}
        </div>
      </header>

      {/* 3. Full-Bleed Master Workspace Body (Docked Sidebar + Active View) */}
      <div className="flex-1 flex overflow-hidden relative">
        {children}
      </div>

      {/* 4. Unified Full-Bleed Status & Telemetry Ribbon (Pinned to Viewport Bottom) */}
      <footer className="h-6 shrink-0 bg-surface-container-low/95 border-t border-white/[0.06] flex items-center justify-between px-3 sm:px-4 z-40 text-[10px] font-mono text-outline">
        <div className="flex items-center gap-3 truncate">
          <div className="flex items-center gap-1.5">
            <span className="text-outline">MODEL:</span>
            <span className="text-on-surface font-semibold truncate">
              YOLO11-Seg (Ultralytics + Shadow Physics)
            </span>
          </div>
          <span className="text-white/10 hidden sm:inline">•</span>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-outline">GEOLOC:</span>
            <span className="text-secondary font-semibold">Slant-to-Ground (EXACT_NOT_CLAIMED)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
          <span className="hidden sm:inline text-outline">TELEMETRY:</span>
          <span className="text-tertiary font-semibold">CASCADE STANDBY / READY</span>
        </div>
      </footer>
    </div>
  );
};

export default AppWindow;
