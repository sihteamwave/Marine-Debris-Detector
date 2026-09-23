import React, { useState } from 'react';
import { GlassPanel } from '../components/GlassPanel';
import { StatusBadge } from '../components/StatusBadge';
import { DetectionTarget } from '../App';
import {
  Radio,
  Ship,
  Anchor,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Printer,
  Compass,
  Send,
  Download,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface ActionDispatchViewProps {
  scenarioId: string;
  scenarioName: string;
  detections: DetectionTarget[];
  activeSector?: string;
  onNavigateToTab?: (tab: any) => void;
}

type ActionType = 'NOTMAR' | 'COAST_GUARD' | 'ROV_DIVE' | 'CPCB_CLEANUP';

export const ActionDispatchView: React.FC<ActionDispatchViewProps> = ({
  scenarioId,
  scenarioName,
  detections,
  activeSector = 'Sector Alpha — Gulf of Mannar & Palk Bay',
  onNavigateToTab,
}) => {
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number>(0);
  const [selectedAction, setSelectedAction] = useState<ActionType>('NOTMAR');
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, 'DRAFT' | 'AUTHORIZED' | 'DISPATCHED'>>({});
  const [copied, setCopied] = useState<boolean>(false);

  const activeTarget = detections[selectedTargetIndex] || detections[0];

  // Helper calculations for height and clearance
  const depthM = parseFloat(activeTarget?.depth?.replace('m', '') || '112');
  const heightM = parseFloat(activeTarget?.dimensions?.height?.replace('m', '') || '6.1');
  const ukcM = Math.max(0, depthM - heightM);
  const isCriticalHaznav = ukcM < 15.0;

  const currentStatus = dispatchStatus[`${activeTarget?.id}_${selectedAction}`] || 'DRAFT';

  // Generator for official NOTMAR text
  const generateNotmarText = () => {
    return `================================================================================
NAVAREA VIII — HYDROGRAPHIC NAVIGATIONAL WARNING (NOTMAR)
ISSUING AUTHORITY: NATIONAL HYDROGRAPHIC OFFICE (NHO) / DG SHIPPING, INDIA
TRANSMITTING COASTAL RADIO: MUMBAI / CHENNAI / PORT BLAIR RADIO
DATE OF TRANSMISSION: ${new Date().toISOString().slice(0, 10)}
================================================================================

1. HYDROGRAPHIC WARNING IN FORCE — INDIAN OCEAN / ARABIAN SEA / BAY OF BENGAL
   SECTOR: ${activeSector.toUpperCase()}
   MISSION TRANSECT REF: ${scenarioId} (${scenarioName})

2. SUBMERGED OBSTRUCTION DETECTED VIA ACOUSTIC SIDE-SCAN SONAR:
   TARGET ID        : ${activeTarget?.target_id || activeTarget?.id}
   CLASSIFICATION   : ${activeTarget?.class?.toUpperCase()}
   COORDINATES      : LATITUDE ${activeTarget?.position?.lat}, LONGITUDE ${activeTarget?.position?.lon}
   SEABED SOUNDING  : ${depthM.toFixed(1)} METERS
   OBSTACLE RELIEF  : ${heightM.toFixed(1)} METERS OFF SEABED (VERIFIED BY ACOUSTIC SHADOW)
   UNDER-KEEL CLEAR : ${ukcM.toFixed(1)} METERS (UKC)

3. NAVIGATIONAL HAZARD ASSESSMENT:
   STATUS           : ${isCriticalHaznav ? 'CRITICAL HAZARD TO NAVIGATION (HAZNAV)' : 'MONITORED ANOMALY'}
   VESSEL EXCLUSION : ALL VESSELS DRAWING MORE THAN ${(ukcM - 2).toFixed(1)} METERS DRAFT ARE ADVISED
                      TO MAINTAIN A MINIMUM CLEARANCE OF 0.5 NAUTICAL MILES AROUND THIS POSITION.

4. AUTHORITY & COMPLIANCE:
   ISSUED PURSUANT TO SECTION 390-404, MERCHANT SHIPPING ACT 1958.
   POSITION DETERMINED BY ACOUSTIC RAY-TRACING (IHO S-44 ORDER 1A SPECIFICATION).

5. CANCEL THIS MESSAGE ONLY UPON CONFIRMED SALVAGE OR OFFICIAL RE-CHARTING.
================================================================================`;
  };

  // Generator for Coast Guard Tasking Order
  const generateCoastGuardText = () => {
    return `================================================================================
INDIAN COAST GUARD (ICGS) — OPERATIONAL SALVAGE TASKING REQUISITION
HEADQUARTERS: COAST GUARD REGION (EAST / WEST / A&N)
CLASSIFICATION: RESTRICTED — OPERATIONAL MARITIME POLLUTION & SALVAGE
================================================================================

1. TASKING ORDER REF: ICG-OP-2026-${activeTarget?.id || '001'}
   OPERATIONAL PLATFORM ALLOCATION: ICGS SAMUDRA PRAHARI / POLLUTION CONTROL VESSEL

2. TARGET SPECIFICATIONS:
   TARGET DESIGNATION : ${activeTarget?.target_id || activeTarget?.id}
   ANOMALY CLASS      : ${activeTarget?.class}
   GEOLOCATION        : ${activeTarget?.position?.lat}, ${activeTarget?.position?.lon}
   WATER DEPTH        : ${depthM.toFixed(1)} M
   PHYSICAL CLEARANCE : ${ukcM.toFixed(1)} M (UKC)
   ESTIMATED DIMENSIONS: ${activeTarget?.dimensions?.width} × ${activeTarget?.dimensions?.height}
   ESTIMATED MASS     : ~14.5 METRIC TONS (CONTAINER / HEAVY STRUCTURAL UNIT)

3. OPERATIONAL SALVAGE OBJECTIVE:
   [a] DEPLOY ROV / ACOUSTIC DIVER SPREAD TO VERIFY STRUCTURAL RIGGING INTEGRITY.
   [b] ASSESS RISK OF HAZARDOUS LEACHATE (IMO MARPOL ANNEX V PROTOCOL).
   [c] PREPARE TETHERING SLINGS FOR OFFSHORE CRANE LIFT (MINIMUM 25-TON CAPACITY).

4. AUTHORIZATION SIGN-OFF:
   CHIEF HYDROGRAPHIC CERTIFIER / COMMANDANT (ICG OPERATIONS)
================================================================================`;
  };

  // Generator for ROV Waypoint Requisition
  const generateRovText = () => {
    return `================================================================================
AUTONOMOUS / TETHERED ROV MICRO-INSPECTION DIVE PLAN
PLATFORM: NIOT DEEP-OCEAN ROV / WORK-CLASS AUV-150
================================================================================

MISSION TARGET    : ${activeTarget?.target_id || activeTarget?.id} (${activeTarget?.class})
DROP COORDINATES  : ${activeTarget?.position?.lat}, ${activeTarget?.position?.lon}
SEABED DEPTH      : ${depthM.toFixed(1)} METERS

ORTHOGONAL DIVE WAYPOINTS:
  WP-01 (INGRESS) : 50m North of Target (Depth ${depthM - 10}m)
  WP-02 (PORT PASS): Acoustic Imaging Pass at 450 kHz (Altitude 5m off seabed)
  WP-03 (STBD PASS): High-Resolution Optical Stills (Distance 3m with LED array)
  WP-04 (EGRESS)  : Ascend along vertical acoustic beacon

INSPECTION OBJECTIVES:
  • Confirm presence of lifting lugs or container twist-locks.
  • Inspect acoustic shadow boundary for buried sediment accumulation.
  • Collect water sample for dissolved heavy metals / plasticizers.
================================================================================`;
  };

  // Generator for CPCB Ecological Litter Requisition
  const generateCpcbText = () => {
    return `================================================================================
CENTRAL POLLUTION CONTROL BOARD (CPCB) — MARINE LITTER REMEDIATION WORK ORDER
MINISTRY OF ENVIRONMENT, FOREST AND CLIMATE CHANGE (MoEFCC), GOVT OF INDIA
================================================================================

ORDER NUMBER      : CPCB/PWM/ML/2026-${activeTarget?.id || '001'}
JURISDICTION      : ${activeSector}
TARGET CATEGORY   : ${activeTarget?.class} (Tier 2: ${activeTarget?.ecological_risk || 'High Risk'})

ECOLOGICAL VULNERABILITY:
  • Entanglement Index: ${activeTarget?.class?.toLowerCase().includes('net') ? 'CRITICAL (Active Ghost Fishing)' : 'Moderate / Benthic Smothering'}
  • Benthic Residence Half-Life: Estimated 200-500+ years without mechanical retrieval.
  • Disposal Standard: Co-processing / mechanical recycling in authorized EPR facility.

MANDATED DISPOSAL ACTION:
  • Recovered material must be transferred to registered coastal recyclers.
  • Chain-of-Custody certificate must be logged in the National Marine Litter Registry.
================================================================================`;
  };

  const getActiveText = () => {
    switch (selectedAction) {
      case 'NOTMAR':
        return generateNotmarText();
      case 'COAST_GUARD':
        return generateCoastGuardText();
      case 'ROV_DIVE':
        return generateRovText();
      case 'CPCB_CLEANUP':
        return generateCpcbText();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAuthorize = () => {
    setDispatchStatus((prev) => ({
      ...prev,
      [`${activeTarget?.id}_${selectedAction}`]: 'AUTHORIZED',
    }));
  };

  const handleDispatch = () => {
    setDispatchStatus((prev) => ({
      ...prev,
      [`${activeTarget?.id}_${selectedAction}`]: 'DISPATCHED',
    }));
  };

  return (
    <div className="flex-1 w-full h-full p-4 lg:p-6 overflow-y-auto space-y-4 max-w-[1920px] mx-auto custom-scrollbar">
      {/* Header Banner */}
      <GlassPanel level={2} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider">
              Standard Operating Procedure (SOP) Console
            </span>
            <span className="text-white/20">•</span>
            <StatusBadge label="DECISION SUPPORT DRAFTING" variant="info" size="sm" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
            Inter-Agency Action &amp; Statutory Dispatch
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl">
            Generates compliant, draft operational notices for the National Hydrographic Office, Indian Coast Guard,
            Port Authorities, and Environmental Directorates based on acoustic survey evidence.
          </p>
        </div>

        {/* Target Selector */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-outline">Target:</span>
          <select
            value={selectedTargetIndex}
            onChange={(e) => setSelectedTargetIndex(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl bg-surface-container-high border border-white/10 text-white font-mono text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
          >
            {detections.map((det, idx) => (
              <option key={det.id || idx} value={idx}>
                {det.target_id || det.id} — {det.class.slice(0, 24)} ({det.confidence}%)
              </option>
            ))}
          </select>
        </div>
      </GlassPanel>

      {/* Target Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassPanel level={2} className="p-3.5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">Active Sector</span>
          <span className="text-xs font-bold text-white font-mono truncate">{activeSector}</span>
          <span className="text-[10px] font-mono text-cyan-300">WGS-84 Geodetic Datum</span>
        </GlassPanel>

        <GlassPanel level={2} className="p-3.5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">Coordinates &amp; Depth</span>
          <span className="text-xs font-bold text-white font-mono truncate">
            {activeTarget?.position?.lat}, {activeTarget?.position?.lon}
          </span>
          <span className="text-[10px] font-mono text-slate-300">Sounding Depth: {depthM.toFixed(1)} m</span>
        </GlassPanel>

        <GlassPanel level={2} className="p-3.5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">Acoustic Height Relief</span>
          <span className="text-xs font-bold text-amber-300 font-mono">
            {heightM.toFixed(1)} m off seabed
          </span>
          <span className="text-[10px] font-mono text-slate-300">Shadow-derived grazing geometry</span>
        </GlassPanel>

        <GlassPanel
          level={2}
          className={`p-3.5 flex flex-col gap-1 border ${
            isCriticalHaznav ? 'border-rose-500/40 bg-rose-950/20' : 'border-emerald-500/40 bg-emerald-950/20'
          }`}
        >
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">Under-Keel Clearance</span>
          <span className={`text-xs font-bold font-mono ${isCriticalHaznav ? 'text-rose-400' : 'text-emerald-400'}`}>
            UKC: {ukcM.toFixed(1)} m — {isCriticalHaznav ? 'CRITICAL HAZNAV' : 'SAFE CLEARANCE'}
          </span>
          <span className="text-[10px] font-mono text-slate-300">
            {isCriticalHaznav ? 'Draft < 15m fairway hazard' : 'Adequate for commercial draft'}
          </span>
        </GlassPanel>
      </div>

      {/* Main Action Tabs & Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Action Protocol Selector */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-outline uppercase tracking-wider block px-1">
            Statutory Action Framework
          </span>

          {/* Action 1: NOTMAR */}
          <button
            onClick={() => setSelectedAction('NOTMAR')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              selectedAction === 'NOTMAR'
                ? 'bg-primary-container/40 border-primary text-white shadow-lg'
                : 'bg-surface-container-low/60 border-white/[0.06] text-on-surface-variant hover:bg-surface-container/60 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-300" />
                <span className="text-xs font-bold font-mono">Notice to Mariners (NOTMAR)</span>
              </div>
              <StatusBadge
                label={dispatchStatus[`${activeTarget?.id}_NOTMAR`] || 'DRAFT'}
                variant={dispatchStatus[`${activeTarget?.id}_NOTMAR`] === 'DISPATCHED' ? 'success' : 'info'}
                size="sm"
              />
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              NAVAREA VIII compliant radio navigational warning for shallow obstructions and shipping channel hazards.
            </p>
          </button>

          {/* Action 2: Coast Guard Tasking */}
          <button
            onClick={() => setSelectedAction('COAST_GUARD')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              selectedAction === 'COAST_GUARD'
                ? 'bg-primary-container/40 border-primary text-white shadow-lg'
                : 'bg-surface-container-low/60 border-white/[0.06] text-on-surface-variant hover:bg-surface-container/60 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold font-mono">Coast Guard Salvage Tasking</span>
              </div>
              <StatusBadge
                label={dispatchStatus[`${activeTarget?.id}_COAST_GUARD`] || 'DRAFT'}
                variant={dispatchStatus[`${activeTarget?.id}_COAST_GUARD`] === 'DISPATCHED' ? 'success' : 'info'}
                size="sm"
              />
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Patrol vessel deployment requisition (ICGS Samudra Prahari) for physical container or wreck salvage.
            </p>
          </button>

          {/* Action 3: ROV Dive */}
          <button
            onClick={() => setSelectedAction('ROV_DIVE')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              selectedAction === 'ROV_DIVE'
                ? 'bg-primary-container/40 border-primary text-white shadow-lg'
                : 'bg-surface-container-low/60 border-white/[0.06] text-on-surface-variant hover:bg-surface-container/60 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-bold font-mono">ROV Micro-Dive Waypoints</span>
              </div>
              <StatusBadge
                label={dispatchStatus[`${activeTarget?.id}_ROV_DIVE`] || 'DRAFT'}
                variant={dispatchStatus[`${activeTarget?.id}_ROV_DIVE`] === 'DISPATCHED' ? 'success' : 'info'}
                size="sm"
              />
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Orthogonal acoustic and optical inspection flight plan for tethered ROVs or deep-ocean AUVs.
            </p>
          </button>

          {/* Action 4: CPCB Marine Litter */}
          <button
            onClick={() => setSelectedAction('CPCB_CLEANUP')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              selectedAction === 'CPCB_CLEANUP'
                ? 'bg-primary-container/40 border-primary text-white shadow-lg'
                : 'bg-surface-container-low/60 border-white/[0.06] text-on-surface-variant hover:bg-surface-container/60 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Anchor className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-bold font-mono">MoES-CPCB Litter Work Order</span>
              </div>
              <StatusBadge
                label={dispatchStatus[`${activeTarget?.id}_CPCB_CLEANUP`] || 'DRAFT'}
                variant={dispatchStatus[`${activeTarget?.id}_CPCB_CLEANUP`] === 'DISPATCHED' ? 'success' : 'info'}
                size="sm"
              />
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Ecological remediation order for ghost nets, tyres, and plastics under the Plastic Waste Management Rules.
            </p>
          </button>

          {/* Operational Guidance Callout */}
          <GlassPanel level={3} className="p-3 text-[11px] text-on-surface-variant space-y-1.5 border-l-2 border-primary">
            <span className="font-mono font-bold text-white block">DECISION SUPPORT NOTICE</span>
            <p>
              In accordance with Master Specification v2, SAMUDRA-SURAKSHA drafts actionable tasking packages.
              Final issuance requires authorization from a certified hydrographer or port authority.
            </p>
          </GlassPanel>
        </div>

        {/* Right 2 Columns: Draft Text & Action Controls */}
        <div className="lg:col-span-2 space-y-3">
          <GlassPanel level={2} className="p-4 flex flex-col gap-3">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono font-bold text-white">
                  Generated Statutory Document Draft
                </span>
                <StatusBadge
                  label={currentStatus}
                  variant={currentStatus === 'DISPATCHED' ? 'success' : currentStatus === 'AUTHORIZED' ? 'info' : 'warning'}
                  size="sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-white font-mono text-xs font-medium flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                {currentStatus === 'DRAFT' && (
                  <button
                    onClick={handleAuthorize}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Authorize Draft</span>
                  </button>
                )}

                {currentStatus === 'AUTHORIZED' && (
                  <button
                    onClick={handleDispatch}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Simulate Dispatch</span>
                  </button>
                )}

                {currentStatus === 'DISPATCHED' && (
                  <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Transmitted to Station</span>
                  </span>
                )}
              </div>
            </div>

            {/* Generated Document Text Area */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-surface-container-lowest border border-white/[0.06] text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto custom-scrollbar select-text max-h-[460px]">
                {getActiveText()}
              </pre>
            </div>

            {/* Footer Attribution */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono text-outline gap-1">
              <span>SHA-256 Audit Seal: Verified • Lineage: CandidateRecord CAN-{selectedTargetIndex + 1}</span>
              <span>Statutory Reference: Merchant Shipping Act 1958 • IHO S-44 Order 1a</span>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
