import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 'floating';
  specular?: boolean;
  className?: string;
  onClick?: () => void;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  level = 2,
  specular = true,
  className = '',
  onClick,
}) => {
  const levelClass =
    level === 1
      ? 'glass-surface-l1'
      : level === 3
      ? 'glass-surface-l3'
      : level === 'floating'
      ? 'glass-floating'
      : 'glass-surface-l2';

  return (
    <div
      onClick={onClick}
      className={`rounded-card transition-all duration-200 ${levelClass} ${
        specular ? 'glass-specular-highlight' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
