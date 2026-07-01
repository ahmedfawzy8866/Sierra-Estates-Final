import React from 'react';
import { Flame, TrendingUp, Minus, Snowflake } from 'lucide-react';

interface LeadScoreBadgeProps {
  score: number;       // 0-10
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Sierra Estates — Lead Score Badge
 * Color-coded score indicator for lead quality.
 * 8-10: Hot (red/orange), 5-7: Warm (amber), 2-4: Cool (blue), 0-1: Cold (slate)
 */
export default function LeadScoreBadge({ score, size = 'md', showLabel = false }: LeadScoreBadgeProps) {
  const clamped = Math.max(0, Math.min(10, score));

  const getTier = () => {
    if (clamped >= 8) return { label: 'Hot', color: 'bg-red-500/15 text-red-400 border-red-500/30', icon: Flame, iconColor: 'text-red-400' };
    if (clamped >= 5) return { label: 'Warm', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: TrendingUp, iconColor: 'text-amber-400' };
    if (clamped >= 2) return { label: 'Cool', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: Minus, iconColor: 'text-blue-400' };
    return { label: 'Cold', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30', icon: Snowflake, iconColor: 'text-slate-400' };
  };

  const tier = getTier();
  const Icon = tier.icon;

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[10px] px-2 py-0.5 gap-1',
    lg: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const iconSize = { sm: 10, md: 12, lg: 14 };

  return (
    <span className={`inline-flex items-center font-mono font-bold uppercase tracking-wider border rounded ${tier.color} ${sizeClasses[size]}`}>
      <Icon size={iconSize[size]} className={tier.iconColor} />
      {clamped.toFixed(0)}
      {showLabel && <span className="ml-0.5 opacity-70">{tier.label}</span>}
    </span>
  );
}
