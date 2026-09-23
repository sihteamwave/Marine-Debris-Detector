import React from 'react';
import { GlassPanel } from './GlassPanel';
import { CheckCircle2, XCircle, HelpCircle, Anchor } from 'lucide-react';

interface HumanReviewBarProps {
  target?: any;
  targetId?: string;
  targetClass?: string;
  reviewStatus?: string;
  onConfirm: () => void;
  onReject: () => void;
  onMarkUnknown: () => void;
  onQueueResurvey: () => void;
}

export const HumanReviewBar: React.FC<HumanReviewBarProps> = ({
  target,
  targetId: propTargetId,
  targetClass: propTargetClass,
  reviewStatus: propReviewStatus,
  onConfirm,
  onReject,
  onMarkUnknown,
  onQueueResurvey,
}) => {
  const targetId = propTargetId || target?.target_id || target?.id || 'TGT-001';
  const targetClass = propTargetClass || target?.class || 'Acoustic Target';
  const reviewStatus = propReviewStatus || target?.status || 'Pending';
  return (
    <GlassPanel level={2} className="p-3 flex flex-col gap-2.5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">
            Human Analyst Verification
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
            reviewStatus === 'Confirmed'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : reviewStatus === 'Rejected'
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : reviewStatus === 'Unknown'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-surface-container-high text-outline border-white/5'
          }`}
        >
          {reviewStatus.toUpperCase()}
        </span>
      </div>

      {/* Verification Action Buttons Group (3-Button Layout) */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={onConfirm}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-tertiary-container/80 hover:bg-tertiary-container text-white font-medium text-xs shadow-sm transition-all active:scale-95 cursor-pointer border border-tertiary/30"
          title="Confirm detection finding (staged for retraining)"
        >
          <CheckCircle2 className="w-4 h-4 mb-0.5 text-tertiary" />
          <span className="text-[11px] font-semibold">Confirm</span>
        </button>

        <button
          onClick={onReject}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-surface-container-high hover:bg-error-container/80 text-on-surface hover:text-white font-medium text-xs shadow-sm transition-all active:scale-95 cursor-pointer border border-white/5 hover:border-error/40"
          title="Reject detection finding (false alarm)"
        >
          <XCircle className="w-4 h-4 mb-0.5 text-rose-400" />
          <span className="text-[11px] font-semibold">Reject</span>
        </button>

        <button
          onClick={onMarkUnknown}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-surface-container-high hover:bg-surface-bright text-secondary font-medium text-xs shadow-sm transition-all active:scale-95 cursor-pointer border border-white/5"
          title="Mark candidate as genuinely ambiguous anomaly"
        >
          <HelpCircle className="w-4 h-4 mb-0.5 text-secondary" />
          <span className="text-[11px] font-semibold">Unknown</span>
        </button>
      </div>

      {/* Targeted Re-Survey Dispatch Button */}
      <button
        onClick={onQueueResurvey}
        className="w-full py-1.5 px-3 rounded-xl bg-surface-container-high/60 hover:bg-surface-container-high text-secondary border border-white/[0.06] hover:border-secondary/40 text-[11px] font-mono font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
        title="Dispatch target coordinates for future AUV/ROV re-survey"
      >
        <Anchor className="w-3.5 h-3.5 text-secondary" />
        <span>Queue Targeted Re-Survey Sortie</span>
      </button>
    </GlassPanel>
  );
};
