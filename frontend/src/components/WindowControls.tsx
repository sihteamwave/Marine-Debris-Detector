import React from 'react';

interface WindowControlsProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  return (
    <div className="flex items-center gap-2 group/traffic select-none">
      {/* Close: #ff5f56 */}
      <button
        onClick={onClose}
        aria-label="Close Window"
        className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
      >
        <svg
          className="w-1.5 h-1.5 text-[#4c0000] opacity-0 group-hover/traffic:opacity-80 transition-opacity"
          viewBox="0 0 6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <path d="M1 1L5 5M5 1L1 5" />
        </svg>
      </button>

      {/* Minimize: #ffbd2e */}
      <button
        onClick={onMinimize}
        aria-label="Minimize Window"
        className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
      >
        <svg
          className="w-1.5 h-1.5 text-[#5c3c00] opacity-0 group-hover/traffic:opacity-80 transition-opacity"
          viewBox="0 0 6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <path d="M1 3H5" />
        </svg>
      </button>

      {/* Expand / Maximize: #27c93f */}
      <button
        onClick={onMaximize}
        aria-label="Toggle Fullscreen"
        className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
      >
        <svg
          className="w-1.5 h-1.5 text-[#004d00] opacity-0 group-hover/traffic:opacity-80 transition-opacity"
          viewBox="0 0 6 6"
          fill="currentColor"
        >
          <path d="M1 1.5L4.5 5H1V1.5Z" />
          <path d="M5 4.5L1.5 1H5V4.5Z" />
        </svg>
      </button>
    </div>
  );
};
