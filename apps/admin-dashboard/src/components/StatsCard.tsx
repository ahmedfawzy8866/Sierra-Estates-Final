import React from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;         // Percentage change (e.g., +12.5 or -3.2)
  icon?: LucideIcon;
  iconColor?: string;      // Tailwind class, e.g. 'text-cyan-400'
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

/**
 * Sierra Estates — Stats Card
 * KPI metric card for admin analytics pages.
 */
export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-cyan-400',
  variant = 'default',
}: StatsCardProps) {
  const variantStyles = {
    default: 'border-slate-800',
    success: 'border-emerald-500/20',
    warning: 'border-amber-500/20',
    danger: 'border-red-500/20',
  };

  const changeColor = change === undefined || change === 0
    ? 'text-slate-500'
    : change > 0
      ? 'text-emerald-400'
      : 'text-red-400';

  const ChangeIcon = change === undefined || change === 0
    ? Minus
    : change > 0
      ? TrendingUp
      : TrendingDown;

  return (
    <div className={`bg-slate-950/60 border rounded-lg p-4 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && <Icon size={16} className={iconColor} strokeWidth={1.75} />}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-[10px] font-mono ${changeColor}`}>
          <ChangeIcon size={10} />
          <span>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-slate-600 ml-0.5">vs prev</span>
        </div>
      )}
    </div>
  );
}
