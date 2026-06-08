'use client';

const STAGES = [
  { s: 'S1', h: 95, c: '#C8961A' },
  { s: 'S2', h: 88, c: '#E9C176' },
  { s: 'S3', h: 82, c: '#1E88D9' },
  { s: 'S4', h: 79, c: '#34D399' },
  { s: 'S5', h: 74, c: '#7C3AED' },
  { s: 'S6', h: 68, c: '#E63946' },
  { s: 'S7', h: 61, c: '#C8961A' },
  { s: 'S8', h: 55, c: '#1E88D9' },
  { s: 'S9', h: 42, c: '#34D399' },
  { s: 'S10', h: 28, c: '#C8961A' },
];

export default function PipelineChart() {
  return (
    <div className="flex items-end gap-1 h-24">
      {STAGES.map(stage => (
        <div key={stage.s} className="flex flex-col items-center flex-1">
          <div
            className="w-full rounded-t-sm transition-all duration-200"
            style={{
              height: `${stage.h}%`,
              background: `linear-gradient(180deg, ${stage.c}, ${stage.c}44)`,
            }}
          />
          <span className="text-[7px] text-white/40 mt-1 font-mono font-bold">
            {stage.s}
          </span>
        </div>
      ))}
    </div>
  );
}
