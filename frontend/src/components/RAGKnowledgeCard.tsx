import React, { useState } from 'react';
import { GlassPanel } from './GlassPanel';
import { DetectionTarget } from '../App';
import { BookOpen, ExternalLink, ChevronDown, Award } from 'lucide-react';

interface RAGKnowledgeCardProps {
  target: DetectionTarget;
  onExploreLiterature?: () => void;
}

export const RAGKnowledgeCard: React.FC<RAGKnowledgeCardProps> = ({ target, onExploreLiterature }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sources = target.rag_sources || [];
  const summary =
    target.rag_summary ||
    'Benthic anomalous contact verified against offline NOAA & IMO marine debris reference standards.';

  return (
    <GlassPanel level={2} className="p-3 flex flex-col gap-2 select-none">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-secondary" />
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">
            Authoritative Knowledge (RAG)
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-primary-container/30 text-primary border border-primary/20 font-bold">
          LOCAL OFFLINE
        </span>
      </div>

      {/* Scientific Summary */}
      <p className="text-[11px] text-slate-300 leading-relaxed">
        {summary}
      </p>

      {/* Sources Toggle Bar */}
      {sources.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-white/[0.04]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between text-[10px] font-mono text-secondary hover:text-white transition-colors cursor-pointer py-0.5"
          >
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-secondary" />
              <span>{sources.length} Peer-Reviewed Citation{sources.length > 1 ? 's' : ''}</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {isExpanded && (
            <div className="space-y-1.5 pt-1">
              {sources.map((src, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-surface-container-high/40 border border-white/[0.04] flex flex-col gap-0.5 text-[10px]"
                >
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-semibold text-slate-200 truncate">{src.title}</span>
                    {src.year && <span className="text-outline font-mono">{src.year}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-outline text-[9px] font-mono">
                    <span className="text-secondary">{src.authority || src.organization}</span>
                    {src.citation && <span>• {src.citation}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </GlassPanel>
  );
};
