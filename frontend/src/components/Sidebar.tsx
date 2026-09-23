import {
  LayoutDashboard,
  Waves,
  Upload,
  Radar,
  Globe,
  BookOpen,
  CheckSquare,
  FileText,
  Database,
  Radio,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type ConsoleTab =
  | 'overview'
  | 'sonar-analysis'
  | 'upload'
  | 'detections'
  | 'action-dispatch'
  | 'gis-map'
  | 'rag-evidence'
  | 'review-queue'
  | 'reports'
  | 'datasets';

interface SidebarProps {
  activeTab: ConsoleTab;
  onTabChange: (tab: ConsoleTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingReviewCount?: number;
  onOpenUploadModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  pendingReviewCount = 0,
  onOpenUploadModal,
}) => {
  const navItems: { id: ConsoleTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'overview', label: 'Command Cockpit', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'sonar-analysis', label: 'Sonar Workstation', icon: <Waves className="w-4 h-4" /> },
    { id: 'action-dispatch', label: 'SOP Action Dispatch', icon: <Radio className="w-4 h-4" /> },
    { id: 'gis-map', label: 'National Maritime GIS', icon: <Globe className="w-4 h-4" /> },
    { id: 'detections', label: 'Anomaly Registry', icon: <Radar className="w-4 h-4" /> },
    {
      id: 'review-queue',
      label: 'Hydrographic Review',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
    { id: 'reports', label: 'Statutory Reports & IHO', icon: <FileText className="w-4 h-4" /> },
    { id: 'rag-evidence', label: 'Statutory RAG', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'upload', label: 'Ingest Survey Pass', icon: <Upload className="w-4 h-4" /> },
    { id: 'datasets', label: 'Acoustic Datasets', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`relative z-40 flex flex-col justify-between py-3 transition-all duration-300 select-none ${
        isCollapsed ? 'w-16 px-2' : 'w-60 px-3'
      } bg-surface-container-low/75 backdrop-blur-2xl border-r border-white/[0.07]`}
    >
      <div className="flex flex-col gap-1">
        {/* Section Header */}
        {!isCollapsed && (
          <div className="px-3 pt-1 pb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] text-outline uppercase tracking-widest font-semibold">
              Mission Consoles
            </span>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                className="p-1 rounded hover:bg-white/5 text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-primary-container/85 text-white font-semibold shadow-[0_2px_8px_rgba(30,111,159,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                    : 'text-on-surface-variant hover:bg-white/[0.04] hover:text-on-surface'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <span className={`shrink-0 ${isActive ? 'text-cyan-200' : 'text-outline'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {item.badge !== undefined && !isCollapsed && (
                  <span className="ml-auto px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full bg-secondary shadow-[0_0_8px_rgba(123,208,255,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Workspace Node */}
      <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
        {isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="w-full flex justify-center p-1.5 rounded hover:bg-white/5 text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
        <div
          className={`px-2.5 py-2 rounded-xl bg-surface-container-high/30 border border-white/[0.05] flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!isCollapsed && (
            <span className="font-mono text-[9px] text-outline uppercase tracking-wider">WORKSPACE</span>
          )}
          <span className="font-mono text-[10px] text-secondary font-semibold">
            {isCollapsed ? '26057' : 'NODE-PACIFIC-04'}
          </span>
        </div>
      </div>
    </aside>
  );
};
