import React from 'react';
import {
  Shield,
  Anchor,
  Compass,
  Radio,
  UserCheck,
  ChevronDown,
  Layers,
  MapPin,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export type UserRole =
  | 'FIELD_HYDROGRAPHER'
  | 'CHIEF_CERTIFIER'
  | 'HARBOR_MASTER'
  | 'ENVIRONMENT_DIRECTOR';

export interface SectorInfo {
  id: string;
  name: string;
  coords: string;
  depthRange: string;
  primaryRisk: string;
}

export const SECTORS: SectorInfo[] = [
  {
    id: 'SEC-ALPHA',
    name: 'Sector Alpha — Gulf of Mannar & Palk Bay',
    coords: '7.8220° N, 77.4847° E',
    depthRange: '15 - 120 m',
    primaryRisk: 'Marine Protected Area • Ghost Gear Remediation',
  },
  {
    id: 'SEC-BRAVO',
    name: 'Sector Bravo — Mumbai & JNPT Deepwater Channel',
    coords: '18.9220° N, 72.8347° E',
    depthRange: '12 - 38 m',
    primaryRisk: 'High-Density Container Shipping Corridor • HAZNAV',
  },
  {
    id: 'SEC-CHARLIE',
    name: 'Sector Charlie — Cochin Port Fairway',
    coords: '9.9312° N, 76.2673° E',
    depthRange: '14 - 65 m',
    primaryRisk: 'Coastal Trawl Fairway & Submerged Obstructions',
  },
  {
    id: 'SEC-DELTA',
    name: 'Sector Delta — Chennai Outer Roads',
    coords: '13.0827° N, 80.2707° E',
    depthRange: '18 - 45 m',
    primaryRisk: 'Industrial Port Anchorage & Cyclone Wreck Basin',
  },
  {
    id: 'SEC-ECHO',
    name: 'Sector Echo — Visakhapatnam Naval Anchorage',
    coords: '17.6868° N, 83.2185° E',
    depthRange: '25 - 90 m',
    primaryRisk: 'Eastern Seaboard Naval Approach & Offshore Infrastructure',
  },
  {
    id: 'SEC-FOXTROT',
    name: 'Sector Foxtrot — Andaman Sea & Nicobar Chokepoint',
    coords: '11.6234° N, 92.7265° E',
    depthRange: '30 - 350 m',
    primaryRisk: 'Ten Degree Channel • International Maritime Fairway',
  },
];

interface GovernmentHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedSector: string;
  onSectorChange: (sectorName: string) => void;
  onOpenDatasetModal?: () => void;
}

export const GovernmentHeader: React.FC<GovernmentHeaderProps> = ({
  currentRole,
  onRoleChange,
  selectedSector,
  onSectorChange,
  onOpenDatasetModal,
}) => {
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'FIELD_HYDROGRAPHER':
        return 'Field Hydrographer / AUV Operator';
      case 'CHIEF_CERTIFIER':
        return 'Chief Hydrographic Certifier';
      case 'HARBOR_MASTER':
        return 'Harbor Master / VTS Safety Authority';
      case 'ENVIRONMENT_DIRECTOR':
        return 'Marine Environment Directorate (MoES/CPCB)';
    }
  };

  return (
    <header className="relative z-50 border-b border-white/[0.08] bg-surface-container-lowest/90 backdrop-blur-2xl">
      {/* Top Security & Protocol Strip */}
      <div className="px-4 py-1 bg-surface-container-low/80 border-b border-white/[0.04] flex flex-wrap items-center justify-between text-[10px] font-mono text-outline">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-amber-400 font-semibold uppercase tracking-wider">
            <Lock className="w-3 h-3 text-amber-400" />
            Restricted — Official Hydrographic &amp; Coastal Defense Use
          </span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Govt. of India • Ministry of Earth Sciences (MoES)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-cyan-300">
            <CheckCircle2 className="w-3 h-3" />
            IHO S-44 Order 1a
          </span>
          <span className="text-white/20 hidden md:inline">•</span>
          <span className="text-slate-400 hidden md:inline">IMO MARPOL Annex V</span>
          <span className="text-white/20 hidden md:inline">•</span>
          <span className="text-emerald-400 hidden md:inline">SHA-256 Audit Trail Active</span>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Emblem & Platform Title */}
        <div className="flex items-center gap-3">
          {/* Official Emblem Icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-container to-marine-800 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-white/20">
            <Anchor className="w-5 h-5 text-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white tracking-tight font-mono">
                SAMUDRA-SURAKSHA
              </span>
              <span className="text-xs text-primary font-medium font-sans">
                (समुद्र-सुरक्षा)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary-container/40 text-cyan-200 border border-primary/30">
                v2.0-GOV
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-mono">
              National Hydrographic Debris &amp; Underwater Anomaly Intelligence System
            </p>
          </div>
        </div>

        {/* Right: Sector Selector & Role Profile Switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Maritime Sector Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-container-high/60 border border-white/[0.08] text-xs font-mono">
            <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <select
              value={selectedSector}
              onChange={(e) => onSectorChange(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer pr-1"
            >
              {SECTORS.map((sec) => (
                <option key={sec.id} value={sec.name} className="bg-surface-container-high text-white">
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          {/* RBAC Role Profile Switcher */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary-container/25 border border-primary/30 text-xs font-mono text-white">
            <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-white font-mono text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="FIELD_HYDROGRAPHER" className="bg-surface-container-high text-white">
                Role: Field Hydrographer (AUV)
              </option>
              <option value="CHIEF_CERTIFIER" className="bg-surface-container-high text-white">
                Role: Chief Hydrographic Certifier
              </option>
              <option value="HARBOR_MASTER" className="bg-surface-container-high text-white">
                Role: Harbor Master (VTS)
              </option>
              <option value="ENVIRONMENT_DIRECTOR" className="bg-surface-container-high text-white">
                Role: Marine Environment Directorate
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
