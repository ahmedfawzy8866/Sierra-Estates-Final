import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  status?: { label: string; ok?: boolean };
}

export function SectionHeader({ eyebrow, title, subtitle, actions, status }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        {eyebrow && (
          <span className="text-[10px] tracking-[0.25em] font-bold text-[#C9A84C] uppercase font-mono block mb-2">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl sm:text-[2rem] font-bold text-[#071422] tracking-tight leading-tight font-display">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[#3a5570] text-sm mt-1.5 leading-relaxed">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {status && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border w-fit ${
            status.ok !== false
              ? 'border-emerald-200/60 bg-emerald-50/60'
              : 'border-amber-200/60 bg-amber-50/60'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${
              status.ok !== false ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
            <span className="text-[9px] tracking-widest uppercase font-mono font-semibold text-[#3a5570] whitespace-nowrap">
              {status.label}
            </span>
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}
