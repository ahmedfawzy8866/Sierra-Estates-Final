import React from 'react';

const PRESETS: Record<string, { bg: string; text: string; border: string }> = {
  draft:           { bg: 'bg-gray-50',    text: 'text-gray-500',   border: 'border-gray-200'  },
  offered:         { bg: 'bg-blue-50',    text: 'text-blue-600',   border: 'border-blue-200'  },
  negotiation:     { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200' },
  signing:         { bg: 'bg-purple-50',  text: 'text-purple-600', border: 'border-purple-200'},
  payment_pending: { bg: 'bg-orange-50',  text: 'text-orange-600', border: 'border-orange-200'},
  closed:          { bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200'},
  active:          { bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200'},
  pending:         { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200' },
  cancelled:       { bg: 'bg-red-50',     text: 'text-red-600',    border: 'border-red-200'   },
  online:          { bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200'},
};

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const style = PRESETS[status.toLowerCase()] ?? { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' };
  return (
    <span className={`inline-flex items-center text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest border ${style.bg} ${style.text} ${style.border}`}>
      {label ?? status.replace(/_/g, ' ')}
    </span>
  );
}
