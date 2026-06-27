import React from 'react';
import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';

export interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent?: string;
  delta?: { value: number; isPositive: boolean };
  loading?: boolean;
}

export function KPICard({ label, value, sub, icon: Icon, accent = '#031632', delta, loading }: KPICardProps) {
  if (loading) {
    return <div className="bg-white rounded-2xl p-6 h-[152px] animate-pulse border border-black/[0.03]" />;
  }

  const DeltaIcon = delta?.isPositive ? ArrowUp : ArrowDown;

  return (
    <div
      className="relative bg-white rounded-2xl p-6 border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] hover:shadow-[0_6px_24px_-4px_rgba(3,22,50,0.1)] transition-shadow group overflow-hidden"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${accent}08 0%, transparent 60%)` }}
      />
      <div className="relative flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}14` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        {delta && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg font-mono ${
            delta.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}>
            <DeltaIcon size={10} />
            {delta.value}%
          </div>
        )}
      </div>
      <div className="text-[2rem] leading-none font-bold tracking-tight mb-1.5 font-mono" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-[13px] font-semibold text-[#071422] mb-0.5">{label}</div>
      {sub && <div className="text-[11px] text-[#3a5570]/50 uppercase tracking-wide font-mono">{sub}</div>}
    </div>
  );
}
