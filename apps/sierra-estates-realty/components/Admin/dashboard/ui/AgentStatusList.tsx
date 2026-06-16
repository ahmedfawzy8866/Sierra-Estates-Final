'use client';

interface Agent {
  name: string;
  emoji: string;
  status: 'Online' | 'Idle' | 'Running';
  load: number;
  color: string;
}

const AGENTS: Agent[] = [
  {
    name: 'Sierra Bot',
    emoji: '🤖',
    status: 'Online',
    load: 94,
    color: '#C8961A',
  },
  {
    name: 'Leila/Lola',
    emoji: '🐪',
    status: 'Online',
    load: 87,
    color: '#1E88D9',
  },
  {
    name: 'Stage-9 Closer',
    emoji: '💼',
    status: 'Online',
    load: 71,
    color: '#34D399',
  },
  {
    name: 'The Curator',
    emoji: '🎨',
    status: 'Online',
    load: 68,
    color: '#E9C176',
  },
];

export default function AgentStatusList() {
  return (
    <div className="space-y-3">
      {AGENTS.map((agent, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{agent.emoji}</span>
              <span className="text-xs font-semibold text-white">{agent.name}</span>
            </div>
            <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-[#34D399]/20 text-[#34D399]">
              {agent.status}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${agent.load}%`,
                background: `linear-gradient(90deg, ${agent.color}, ${agent.color}cc)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
