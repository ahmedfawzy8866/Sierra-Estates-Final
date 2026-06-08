'use client';

import { useState } from 'react';

const WORKFLOWS = [
  { name: 'Lead Ingestion → Firestore', status: 'active', runs: 12840, last: '2 min ago' },
  { name: 'WhatsApp Scraper Cron (30m)', status: 'active', runs: 6420, last: '28 min ago' },
  { name: 'Listing Price AVM Sync', status: 'active', runs: 3210, last: '1 hr ago' },
  { name: 'Stage-9 Contract Generator', status: 'active', runs: 421, last: '15 min ago' },
  { name: 'Broker KPI Report (Daily)', status: 'active', runs: 186, last: '6 hrs ago' },
  { name: 'Stale Listing Monitor', status: 'warning', runs: 890, last: '2 hrs ago' },
  { name: 'Email Follow-Up Sequence', status: 'paused', runs: 1240, last: '1 day ago' },
];

export default function WorkflowsPage() {
  const [wfs, setWfs] = useState(WORKFLOWS.map(w => ({ ...w })));

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <button className="px-4 py-2 bg-[#C8961A] text-[#071422] rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
          ▶ Run All Active
        </button>
        <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-bold text-sm hover:bg-white/15 transition-colors">
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0F2035] border border-white/8 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <div className="text-xs font-bold tracking-widest uppercase text-[#C9A84C]">
              Automation Workflows · n8n
            </div>
          </div>
          <div className="space-y-1">
            {wfs.map((w, i) => (
              <div key={i} className="px-4 py-3 border-b border-white/5 last:border-0 flex items-center gap-3 hover:bg-white/[0.03]">
                <div className={`w-2 h-2 rounded-full ${w.status === 'active' ? 'bg-[#34D399]' : w.status === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#E63946]'} animate-pulse`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white">{w.name}</div>
                  <div className="text-[9px] text-white/40 font-mono">{w.runs.toLocaleString()} runs · {w.last}</div>
                </div>
                <span className={`text-[8px] font-bold px-2 py-1 rounded-full ${
                  w.status === 'active' ? 'bg-[#34D399]/20 text-[#34D399]' :
                  w.status === 'warning' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                  'bg-[#E63946]/20 text-[#E63946]'
                }`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0F2035] border border-white/8 rounded-xl p-4">
          <div className="text-xs font-bold tracking-widest uppercase text-[#C9A84C] mb-4">
            Lead Pipeline · Stage Funnel
          </div>
          <div className="space-y-3">
            {[
              { s: 'S1-2', label: 'Ingestion & Parsing', count: 4821, pct: 100 },
              { s: 'S3-5', label: 'Inventory & Pricing', count: 3102, pct: 64 },
              { s: 'S6-8', label: 'Matching & Outreach', count: 1240, pct: 26 },
              { s: 'S9', label: 'Negotiation', count: 421, pct: 8.7 },
              { s: 'S10', label: 'Closed Deals', count: 97, pct: 2 },
            ].map((row, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/80"><span className="text-[#C8961A] font-bold font-mono">{row.s}</span> · {row.label}</span>
                  <span className="text-white/40 font-mono">{row.count.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C8961A]"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
