import React from 'react';
import { GlassPanel } from './GlassPanel';
import { DetectionTarget } from '../App';
import { AlertTriangle, Compass, ShieldAlert } from 'lucide-react';

interface RiskPriorityCardProps {
  target: DetectionTarget;
}

export const RiskPriorityCard: React.FC<RiskPriorityCardProps> = ({ target }) => {
  const ecoRisk = target.ecological_risk_assessment;
  const opsPriority = target.operational_priority_assessment;

  const ecoRiskLevel = ecoRisk?.risk_level || target.ecological_risk || 'Moderate';
  const opsPriorityLevel = opsPriority?.priority_level || target.removal_priority || 'Standard';

  const isHighRisk = ecoRiskLevel === 'Critical' || ecoRiskLevel === 'High';
  const isHighPriority = opsPriorityLevel === 'Critical' || opsPriorityLevel === 'High';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 select-none">
      {/* 1. Ecological Consequence Card */}
      <GlassPanel level={2} className="p-3 flex flex-col justify-between gap-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className={`w-3.5 h-3.5 ${isHighRisk ? 'text-amber-400' : 'text-primary'}`} />
            <span className="text-[10px] font-mono text-outline uppercase font-semibold">
              Ecological Risk
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              isHighRisk
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-primary/10 text-primary border-primary/20'
            }`}
          >
            {ecoRiskLevel.toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-on-surface font-semibold">
              {target.class.split('(')[0].trim()}
            </span>
            {ecoRisk && (
              <span className="font-mono text-xs text-secondary font-bold">
                Score: {ecoRisk.score.toFixed(1)}/10
              </span>
            )}
          </div>
          <p className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-2">
            {ecoRisk?.evidence_basis?.join(' • ') ||
              'Assessment based on debris permanence, toxic leach potential, and benthic impact.'}
          </p>
        </div>

        {ecoRisk?.components && (
          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/[0.04] text-[9px] font-mono text-outline">
            {Object.entries(ecoRisk.components).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="capitalize">{k.replace('_', ' ')}:</span>
                <span className="text-slate-200 font-semibold">{v}</span>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>

      {/* 2. Operational Removal Priority Card */}
      <GlassPanel level={2} className="p-3 flex flex-col justify-between gap-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5">
            <Compass className={`w-3.5 h-3.5 ${isHighPriority ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span className="text-[10px] font-mono text-outline uppercase font-semibold">
              Ops Removal Priority
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              isHighPriority
                ? 'bg-secondary-container/40 text-secondary border-secondary/40'
                : 'bg-surface-container-high/60 text-on-surface-variant border-white/5'
            }`}
          >
            {opsPriorityLevel.toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-on-surface font-semibold">Action Urgency</span>
            {opsPriority && (
              <span className="font-mono text-xs text-tertiary font-bold">
                Rank: {opsPriority.rank_score.toFixed(1)}/10
              </span>
            )}
          </div>
          <p className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-2">
            {opsPriority?.action_recommendation ||
              'Operational priority weighed by depth accessibility, navigational hazard, and retrieval feasibility.'}
          </p>
        </div>

        {opsPriority?.components && (
          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/[0.04] text-[9px] font-mono text-outline">
            {Object.entries(opsPriority.components).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="capitalize">{k.replace('_', ' ')}:</span>
                <span className="text-slate-200 font-semibold">{v}</span>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
};
