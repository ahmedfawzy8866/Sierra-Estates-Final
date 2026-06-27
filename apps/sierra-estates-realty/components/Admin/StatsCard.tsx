import React from 'react';

export interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<any>;
  color: string;
}

export default function StatsCard({ label, value, change, icon: Icon, color }: StatsCardProps) {
  const cardStyle = { borderLeftColor: color };
  const iconBgStyle = { backgroundColor: `${color}14` };
  const iconStyle = { color };
  const valueStyle = { color, fontFamily: 'var(--font-mono)' };

  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(3,22,50,0.1)] transition-all border-l-[3px] bezel"
      style={cardStyle}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={iconBgStyle}
        >
          <Icon size={18} style={iconStyle} />
        </div>
        {change && (
          <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            <span>↑</span>
            {change}
          </div>
        )}
      </div>
      <div
        className="text-3xl sm:text-2xl font-bold tracking-tight mb-2"
        style={valueStyle}
      >
        {value}
      </div>
      <div className="text-xs sm:text-xs font-semibold text-[#071422]">{label}</div>
    </div>
  );
}
