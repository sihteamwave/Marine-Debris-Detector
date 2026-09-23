import React from 'react';

export type StatusVariant =
  | 'neutral'
  | 'valid'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'tertiary'
  | 'simulated'
  | 'estimated';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  pulse?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  pulse = false,
  icon,
  size = 'sm',
  className = '',
}) => {
  const variantStyles: Record<StatusVariant, { bg: string; text: string; dot: string; border: string }> = {
    neutral: {
      bg: 'bg-surface-container-high/60',
      text: 'text-on-surface-variant',
      dot: 'bg-outline',
      border: 'border-white/5',
    },
    valid: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
      dot: 'bg-emerald-400',
      border: 'border-emerald-500/20',
    },
    success: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
      dot: 'bg-emerald-400',
      border: 'border-emerald-500/20',
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      dot: 'bg-amber-400',
      border: 'border-amber-500/20',
    },
    error: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      dot: 'bg-rose-400',
      border: 'border-rose-500/20',
    },
    info: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      dot: 'bg-secondary',
      border: 'border-primary/20',
    },
    tertiary: {
      bg: 'bg-tertiary-container/30',
      text: 'text-tertiary',
      dot: 'bg-tertiary',
      border: 'border-tertiary/30',
    },
    simulated: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-300',
      dot: 'bg-cyan-400',
      border: 'border-cyan-500/25',
    },
    estimated: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-200',
      dot: 'bg-amber-400',
      border: 'border-amber-500/20',
    },
  };

  const current = variantStyles[variant] || variantStyles.neutral;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wide uppercase border ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${current.dot} ${
          pulse ? 'animate-pulse' : ''
        }`}
      />
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
