'use client';

import { useState, useMemo } from 'react';

const LEADS = [
  { name: 'Ahmed Al-Rashid', phone: '+20 100 111 2233', interest: 'Villa · Hyde Park · EGP 20M+', stage: 'Viewing Scheduled', color: '#C8961A', hot: true },
  { name: 'Sara Mohamed', phone: '+20 101 222 3344', interest: '3-Bed · Mivida · Rent', stage: 'AI Matched', color: '#1E88D9', hot: false },
  { name: 'Khalid Mansour', phone: '+971 50 333 4455', interest: 'Penthouse · Uptown · EGP 15M', stage: 'Contract Draft', color: '#34D399', hot: true },
  { name: 'Nadia Hassan', phone: '+20 112 444 5566', interest: 'Apartment · Madinaty · EGP 5M', stage: 'Initial Contact', color: '#7C3AED', hot: false },
  { name: 'Omar Farouk', phone: '+20 100 555 6677', interest: 'Twin House · Mountain View', stage: 'Negotiating', color: '#E63946', hot: true },
  { name: 'Layla Karim', phone: '+20 109 666 7788', interest: 'Furnished 2-Bed · Eastown', stage: 'AI Matched', color: '#E9C176', hot: false },
];

export default function LeadsPage() {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => 
    LEADS.filter(l => !q || l.name.toLowerCase().includes(q.toLowerCase()) || l.interest.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search leads…"
          className="flex-1 min-w-[200px] px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 text-sm focus:border-[#C8961A] focus:outline-none transition-colors"
        />
        <button className="px-4 py-2 bg-[#C8961A] text-[#071422] rounded-lg font-bold text-sm hover:opacity-90">
          + Add Lead
        </button>
        <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-bold text-sm hover:bg-white/15">
          ⬇ Export CSV
        </button>
      </div>

      <div className="bg-[#0F2035] border border-white/8 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
          <div className="text-xs font-bold tracking-widest uppercase text-[#C9A84C]">
            CRM · Leads
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-[#E63946]/20 text-[#E63946] font-bold">
            {filtered.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-[9px] font-bold tracking-widest uppercase text-[#C8961A]">Client</th>
                <th className="px-4 py-3 text-left text-[9px] font-bold tracking-widest uppercase text-[#C8961A]">Phone</th>
                <th className="px-4 py-3 text-left text-[9px] font-bold tracking-widest uppercase text-[#C8961A]">Interest</th>
                <th className="px-4 py-3 text-left text-[9px] font-bold tracking-widest uppercase text-[#C8961A]">Stage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white/90"
                      style={{ background: l.color + '30' }}
                    >
                      {l.name[0]}
                    </div>
                    <span className="text-white font-semibold">{l.name}</span>
                    {l.hot && <span>🔥</span>}
                  </td>
                  <td className="px-4 py-3 text-white/60 font-mono text-xs">{l.phone}</td>
                  <td className="px-4 py-3 text-white/80">{l.interest}</td>
                  <td className="px-4 py-3">
                    <span className="text-[8px] px-2 py-1 rounded-full bg-white/10 text-white/80 font-bold uppercase">
                      {l.stage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
