'use client';

interface KPI {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  color: string;
  spark: number[];
}

interface KPICardProps {
  kpi: KPI;
  loading?: boolean;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-6 mt-2">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-200"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === data.length - 1 ? color : `${color}55`,
            minHeight: '2px',
          }}
        />
      ))}
    </div>
  );
}

export default function KPICard({ kpi, loading }: KPICardProps) {
  if (loading) {
    return (
      <div className="bg-[#0F2035] border border-white/8 rounded-xl p-4 h-32 animate-pulse" />
    );
  }

  return (
    <div className="bg-[#0F2035] border border-white/8 rounded-xl p-4 hover:border-white/12 transition-colors">
      <div
        className="text-2xl font-bold font-mono mb-1 tracking-tight"
        style={{ color: kpi.color }}
      >
        {kpi.value}
      </div>
      <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-1">
        {kpi.label}
      </div>
      <div className={`text-xs font-bold font-mono ${kpi.up ? 'text-[#34D399]' : 'text-[#E63946]'}`}>
        {kpi.up ? '↑' : '↓'} {kpi.delta}
      </div>
      <Sparkline data={kpi.spark} color={kpi.color} />
    </div>
  );
}
