'use client';

interface Lead {
  name: string;
  phone: string;
  interest: string;
  stage: string;
  color: string;
  hot: boolean;
}

interface LeadsListProps {
  leads: Lead[];
  maxHeight?: string;
}

export default function LeadsList({ leads, maxHeight = 'max-h-[200px]' }: LeadsListProps) {
  if (!leads.length) {
    return (
      <div className="text-center py-8 text-white/30 text-xs">
        No leads
      </div>
    );
  }

  return (
    <div className={`overflow-y-auto ${maxHeight}`}>
      {leads.map((lead, i) => (
        <div key={i} className="px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-white/90"
              style={{ background: lead.color + '30', borderColor: lead.color + '50', border: '1px solid' }}
            >
              {lead.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white">{lead.name}</div>
              <div className="text-[9px] text-white/40 truncate">{lead.interest}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[7px] px-2 py-0.5 rounded bg-white/10 text-white/60 font-bold uppercase">
              {lead.stage}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
