'use client';

const AGENTS = [
  { name: 'Sierra Bot', emoji: '🤖', desc: 'Primary AI concierge — handles client queries & recommendations', status: 'Online', load: 94, tasks: 1203 },
  { name: 'Leila / Lola', emoji: '🐪', desc: 'Bilingual Arabic specialist — translates & handles Gulf negotiations', status: 'Online', load: 87, tasks: 889 },
  { name: 'Stage-9 Closer', emoji: '💼', desc: 'Automated deal engine — drafts contracts, DocuSign, payments', status: 'Online', load: 71, tasks: 421 },
  { name: 'WhatsApp Scraper', emoji: '🕵️', desc: 'Monitors Property Finder, OLX & WhatsApp groups', status: 'Running', load: 55, tasks: 2847 },
  { name: 'The Scribe', emoji: '✍️', desc: 'S1-S2 ingestion — parses raw listing data & normalizes schema', status: 'Idle', load: 12, tasks: 4821 },
  { name: 'The Curator', emoji: '🎨', desc: 'S3-S5 inventory management — deduplication, quality & AVM pricing', status: 'Online', load: 68, tasks: 3102 },
];

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map((agent, i) => (
          <div key={i} className="bg-[#0F2035] border border-white/8 rounded-xl p-4 hover:border-white/12 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{agent.emoji}</span>
              <span className={`text-[8px] font-bold px-2 py-1 rounded-full ${
                agent.status === 'Online' ? 'bg-[#34D399]/20 text-[#34D399]' :
                agent.status === 'Running' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                'bg-white/10 text-white/60'
              }`}>
                {agent.status}
              </span>
            </div>
            <div className="font-bold text-sm text-white mb-1">{agent.name}</div>
            <div className="text-xs text-white/60 leading-relaxed mb-3">{agent.desc}</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Load</span>
                <span className="text-white/80 font-bold">{agent.load}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C8961A] rounded-full"
                  style={{ width: `${agent.load}%` }}
                />
              </div>
              <div className="text-xs text-white/40 pt-2 border-t border-white/5">
                {agent.tasks.toLocaleString()} tasks
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
