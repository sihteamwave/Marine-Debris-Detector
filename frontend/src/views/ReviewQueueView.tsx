import React, { useEffect, useState } from 'react';
import { GlassPanel } from '../components/GlassPanel';
import { StatusBadge } from '../components/StatusBadge';
import { DetectionTarget } from '../App';
import { CheckSquare, Anchor, CheckCircle2, XCircle, HelpCircle, RefreshCw } from 'lucide-react';

interface ReviewQueueViewProps {
  detections: DetectionTarget[];
  selectedTargetIdx: number;
  onSelectTarget: (index: number) => void;
  onConfirm: () => void;
  onReject: () => void;
  onMarkUnknown: () => void;
  onQueueResurvey: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  detections,
  selectedTargetIdx,
  onSelectTarget,
  onConfirm,
  onReject,
  onMarkUnknown,
  onQueueResurvey,
  onNavigateToTab,
}) => {
  const [feedbackSummary, setFeedbackSummary] = useState<{
    confirmed_count: number;
    rejected_count: number;
    unknown_count: number;
    total_reviews: number;
  }>({
    confirmed_count: 0,
    rejected_count: 0,
    unknown_count: 0,
    total_reviews: 0,
  });

  const [resurveyQueue, setResurveyQueue] = useState<any[]>([]);

  const fetchAuditData = async () => {
    try {
      const fRes = await fetch('/api/feedback/summary');
      if (fRes.ok) {
        const d = await fRes.json();
        if (d.summary) setFeedbackSummary(d.summary);
      }
      const rRes = await fetch('/api/resurvey/queue');
      if (rRes.ok) {
        const d = await rRes.json();
        if (d.queue) setResurveyQueue(d.queue);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const pendingDetections = detections.filter(
    (d) => d.status === 'Pending' || d.uncertainty_decision === 'REVIEW_REQUIRED'
  );

  return (
    <div className="flex-1 w-full h-full p-4 lg:p-6 overflow-y-auto space-y-4 max-w-[1920px] mx-auto custom-scrollbar">
      {/* Top Header */}
      <GlassPanel level={2} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CheckSquare className="w-5 h-5 text-tertiary" />
          <div>
            <h2 className="text-base font-bold text-white font-mono">
              Human Analyst Review Queue &amp; Re-Survey Sorties
            </h2>
            <p className="text-xs text-on-surface-variant">
              Controlled operator verification loop, immutable audit staging, and targeted re-survey queue
            </p>
          </div>
        </div>

        <button
          onClick={fetchAuditData}
          className="p-2 rounded-xl bg-surface-container-high/60 hover:bg-surface-container-high text-slate-300 transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh Audit History"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </GlassPanel>

      {/* Audit Summary Counters Grid (Stitch Spec) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlassPanel level={2} className="p-4 flex flex-col justify-between rounded-xl stitch-card-sheen shadow-sm">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">Pending In Mission</span>
          <span className="text-3xl font-bold font-mono text-amber-300 my-1">
            {pendingDetections.length}
          </span>
          <span className="text-[10px] text-on-surface-variant font-mono">Awaiting verification</span>
        </GlassPanel>

        <GlassPanel level={2} className="p-4 flex flex-col justify-between rounded-xl stitch-card-sheen shadow-sm">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">Audited Confirmed</span>
          <span className="text-3xl font-bold font-mono text-emerald-400 my-1">
            {feedbackSummary.confirmed_count}
          </span>
          <span className="text-[10px] text-on-surface-variant font-mono">Staged for dataset release</span>
        </GlassPanel>

        <GlassPanel level={2} className="p-4 flex flex-col justify-between rounded-xl stitch-card-sheen shadow-sm">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">Audited Rejected</span>
          <span className="text-3xl font-bold font-mono text-rose-400 my-1">
            {feedbackSummary.rejected_count}
          </span>
          <span className="text-[10px] text-on-surface-variant font-mono">False alarms logged</span>
        </GlassPanel>

        <GlassPanel level={2} className="p-4 flex flex-col justify-between rounded-xl stitch-card-sheen shadow-sm">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">Re-Survey Sorties</span>
          <span className="text-3xl font-bold font-mono text-secondary my-1">
            {resurveyQueue.length}
          </span>
          <span className="text-[10px] text-on-surface-variant font-mono">Targeted missions queued</span>
        </GlassPanel>
      </div>

      {/* Main Grid: Pending Targets (Left) + Re-Survey Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Pending Verification Targets (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold px-1">
            Candidates Requiring Review ({pendingDetections.length})
          </span>

          {pendingDetections.map((target, idx) => {
            const originalIdx = detections.findIndex((d) => d.id === target.id);
            const isSelected = originalIdx === selectedTargetIdx;

            return (
              <GlassPanel
                key={target.id || idx}
                level={isSelected ? 3 : 2}
                className={`p-3.5 flex flex-col gap-2.5 transition-all cursor-pointer ${
                  isSelected ? 'border-primary/50 ring-1 ring-primary/40' : 'hover:border-white/20'
                }`}
                onClick={() => onSelectTarget(originalIdx)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-primary">
                      {target.target_id || target.id}
                    </span>
                    <span className="text-sm font-semibold text-white truncate max-w-[240px]">
                      {target.class}
                    </span>
                  </div>
                  <StatusBadge
                    label={target.uncertainty_decision || 'REVIEW REQUIRED'}
                    variant={target.uncertainty_decision === 'ACCEPTED' ? 'valid' : 'warning'}
                    size="sm"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono bg-surface-container-high/30 p-2 rounded-xl">
                  <span className="text-outline">Confidence: <strong className="text-white">{target.confidence}%</strong></span>
                  <span className="text-outline">Shadow: <strong className="text-tertiary">{target.shadowStrength}%</strong></span>
                  <span className="text-outline">Status: <strong className="text-secondary">{target.status}</strong></span>
                </div>

                {/* Inline Action Bar */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-white/[0.04]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTarget(originalIdx);
                      onConfirm();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-tertiary-container hover:bg-tertiary-container/90 text-white font-mono text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTarget(originalIdx);
                      onReject();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-surface-container-high hover:bg-error-container text-rose-300 hover:text-white font-mono text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTarget(originalIdx);
                      onMarkUnknown();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-secondary font-mono text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Unknown</span>
                  </button>
                </div>
              </GlassPanel>
            );
          })}

          {pendingDetections.length === 0 && (
            <div className="p-8 text-center text-outline font-mono text-xs">
              All candidates in active mission have been reviewed.
            </div>
          )}
        </div>

        {/* Queued Targeted Re-Survey Sorties (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold px-1">
            Active Re-Survey Sortie Queue ({resurveyQueue.length})
          </span>

          {resurveyQueue.map((sortie, idx) => (
            <GlassPanel key={sortie.task_id || idx} level={2} className="p-3.5 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <span className="text-xs font-mono font-bold text-secondary">{sortie.task_id}</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-secondary-container/30 text-secondary font-bold">
                  {sortie.priority}
                </span>
              </div>
              <span className="text-xs font-semibold text-white">{sortie.target_class}</span>
              <p className="text-[11px] text-slate-300">{sortie.reason}</p>
              <div className="text-[10px] font-mono text-outline pt-1 border-t border-white/[0.04] flex justify-between">
                <span>{sortie.recommended_sensor_mode || 'High-Frequency SSS (900 kHz)'}</span>
                <span className="text-secondary">{sortie.status}</span>
              </div>
            </GlassPanel>
          ))}

          {resurveyQueue.length === 0 && (
            <GlassPanel level={2} className="p-6 text-center text-outline font-mono text-xs">
              No re-survey sorties currently queued.
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
};
