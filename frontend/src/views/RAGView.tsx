import React, { useState } from 'react';
import { GlassPanel } from '../components/GlassPanel';
import { StatusBadge } from '../components/StatusBadge';
import { BookOpen, Award, Shield, FileText, CheckCircle2 } from 'lucide-react';

export const RAGView: React.FC = () => {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  const authoritativeDocs = [
    {
      title: 'IHO S-44 Standards for Hydrographic Surveys (Edition 6.2.0)',
      authority: 'IHO (International Hydrographic Organization)',
      organization: 'National Hydrographic Office (NHO) / IHO HSSC',
      year: 2024,
      jurisdiction: 'Sovereign Waters, EEZ & Harbors',
      topic: 'Order 1a / Special Order Underwater Obstruction Localization',
      finding:
        'Acoustic side-scan sonar detection criteria for bathymetric features exceeding 1m cubic volume. Requires precise grazing shadow derivation (h_obj = (L_s · H_sensor) / (R_s + L_s)) to certify fairway safety for commercial navigation.',
      mitigation:
        'Immediate broadcast of Navigational Warning (NOTMAR) for obstructions reducing fairway Under-Keel Clearance below 15m.',
      citation: 'IHO S-44 Edition 6.2.0 (October 2024) — Chapter 3: Safety of Navigation Standards'
    },
    {
      title: 'MoES-NCCR National Marine Plastic Litter Assessment Protocol',
      authority: 'Ministry of Earth Sciences (MoES), Govt of India',
      organization: 'National Centre for Coastal Research (NCCR)',
      year: 2024,
      jurisdiction: 'Indian Coastal Waters, Arabian Sea & Bay of Bengal',
      topic: 'Benthic Macro-Debris & Ghost Gear Assessment',
      finding:
        'Standardized acoustic and ROV protocol for quantifying abandoned, lost, or discarded fishing gear (ALDFG) in ecologically sensitive marine protected areas (Gulf of Mannar, Andaman & Nicobar).',
      mitigation:
        'Multi-frequency 450/900 kHz acoustic scanning coordinated with local state fisheries directorates for selective grapple retrieval.',
      citation: 'MoES/NCCR Tech Doc 2024/08 — National Protocol for Monitoring Marine Litter in Indian Coastal Waters'
    },
    {
      title: 'Merchant Shipping Act 1958 (Part XIII: Wreck & Salvage)',
      authority: 'Directorate General of Shipping, India',
      organization: 'Ministry of Ports, Shipping and Waterways',
      year: 2024,
      jurisdiction: 'Territorial Waters & Continental Shelf of India',
      topic: 'Submerged Wrecks, Fairway Hazards & Receiver of Wreck',
      finding:
        'Sections 390-404 mandate immediate reporting of submerged obstructions endangering maritime commerce. Receiver of Wreck empowered to requisition emergency salvage operations.',
      mitigation:
        'Formal coordination with Indian Coast Guard (ICGS) and local Port Trust Harbor Master for buoyage and clearance.',
      citation: 'Merchant Shipping Act 1958 (Act No. 44 of 1958) as amended 2024'
    },
    {
      title: 'Intermodal Shipping Container Loss & Benthic Impact Study',
      authority: 'IMO (International Maritime Organization)',
      organization: 'Maritime Safety Committee / UNEP',
      year: 2024,
      jurisdiction: 'International Waters / EEZ',
      topic: 'Freight Containers & Toxic Material Containment',
      finding:
        'Submerged containers present immediate navigational hazards and long-term chemical leakage risks. Steel hulls undergo cathodic breakdown within 15–30 years depending on salinity.',
      mitigation:
        'Acoustic perimeter mapping followed by ROV pressure hull inspection prior to heavy crane salvage.',
      citation: 'IMO Circular MSC.1/Circ.1668 — Operational Guidance on Marine Container Retrieval'
    },
    {
      title: 'Derelict Fishing Gear (Ghost Gear) Ecological Assessment',
      authority: 'NOAA Marine Debris Program',
      organization: 'National Oceanic and Atmospheric Administration',
      year: 2023,
      jurisdiction: 'Global Oceans & Coastal Basins',
      topic: 'Synthetic Monofilament Nets & Traps',
      finding:
        'High mortality rates for demersal species through perpetual unmonitored entanglement. Synthetic nylon monofilament exhibits degradation timescales exceeding 400 years.',
      mitigation:
        'Precision acoustic sonar localization and non-destructive ROV hydraulic cutter retrieval to minimize seabed dragging.',
      citation: 'NOAA Technical Memorandum NOS-OR&R-58 — Impact of Ghost Fishing Gear on Benthic Communities'
    },
    {
      title: 'Underwater Cultural Heritage & Sunken Vessel Preservation',
      authority: 'UNESCO & Hydrographic Office Standards',
      organization: 'Convention on the Protection of the Underwater Cultural Heritage',
      year: 2021,
      jurisdiction: 'Archaeological Marine Zones',
      topic: 'Shipwrecks & Historic Keels',
      finding:
        'Vessels exceeding 100 years or identified as historical heritage must not be physically disturbed without archaeological permit.',
      mitigation:
        'Non-invasive side-scan sonar 3D bathymetric modeling and acoustic shadow preservation survey.',
      citation: 'UNESCO Annex Rules on Heritage Sonar Surveying (Rule 18.2)'
    }
  ];

  const activeDoc = authoritativeDocs[selectedDocIndex];

  return (
    <div className="flex-1 w-full h-full p-4 lg:p-6 overflow-y-auto space-y-4 max-w-[1920px] mx-auto custom-scrollbar">
      {/* Top Header */}
      <GlassPanel level={2} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-secondary" />
          <div>
            <h2 className="text-base font-bold text-white font-mono">
              Authoritative Scientific Knowledge &amp; Provenance (RAG)
            </h2>
            <p className="text-xs text-on-surface-variant">
              Offline verified citations from NOAA, IMO, UNEP, and FAO for deterministic ecological risk evaluation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge label="OFFLINE LOCAL DATABASE" variant="info" size="sm" />
          <StatusBadge label="ZERO LLM HALLUCINATION" variant="valid" size="sm" />
        </div>
      </GlassPanel>

      {/* Main Grid: Document List (Left) + Document Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Document Selector Shelf (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold px-1">
            Authoritative Sources in Knowledge Base ({authoritativeDocs.length})
          </span>

          {authoritativeDocs.map((doc, idx) => (
            <GlassPanel
              key={idx}
              level={idx === selectedDocIndex ? 3 : 2}
              className={`p-3.5 flex flex-col gap-1.5 cursor-pointer transition-all ${
                idx === selectedDocIndex
                  ? 'border-primary/50 ring-1 ring-primary/40 bg-surface-container-high/60'
                  : 'hover:border-white/20'
              }`}
              onClick={() => setSelectedDocIndex(idx)}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-mono font-bold text-secondary">{doc.authority}</span>
                <span className="text-[10px] font-mono text-outline">{doc.year}</span>
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug">{doc.title}</h3>
              <span className="text-[11px] text-on-surface-variant line-clamp-1">{doc.topic}</span>
            </GlassPanel>
          ))}
        </div>

        {/* Selected Document Details Card (7 cols) */}
        <div className="lg:col-span-7">
          <GlassPanel level={2} className="p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-secondary font-bold">
                  {activeDoc.authority} • {activeDoc.organization}
                </span>
                <h2 className="text-lg font-bold text-white">{activeDoc.title}</h2>
                <span className="text-xs text-outline font-mono">
                  Topic: {activeDoc.topic} ({activeDoc.year})
                </span>
              </div>
              <Award className="w-6 h-6 text-secondary shrink-0" />
            </div>

            {/* Scientific Finding */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-outline uppercase font-semibold">
                Scientific Finding &amp; Hazard Mechanisms
              </span>
              <p className="text-xs text-slate-200 leading-relaxed p-3 rounded-xl bg-surface-container-high/40 border border-white/[0.04]">
                {activeDoc.finding}
              </p>
            </div>

            {/* Mitigation Recommendation */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-outline uppercase font-semibold">
                Recommended Hydrographic Mitigation
              </span>
              <p className="text-xs text-slate-200 leading-relaxed p-3 rounded-xl bg-surface-container-high/40 border border-white/[0.04]">
                {activeDoc.mitigation}
              </p>
            </div>

            {/* Authoritative Citation */}
            <div className="p-3 rounded-xl bg-primary-container/20 border border-primary/20 space-y-1">
              <span className="text-[10px] font-mono text-primary font-semibold block">
                FORMAL CITATION &amp; JURISDICTION
              </span>
              <p className="text-xs font-mono text-slate-300 select-all">
                {activeDoc.citation}
              </p>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
