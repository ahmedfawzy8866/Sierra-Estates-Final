'use client';

import React from 'react';
import {
  Shield, BrainCircuit, Users, Activity, Settings2, RefreshCw,
  PenLine, Palette, Handshake, type LucideIcon,
} from 'lucide-react';
import { SectionHeader, EmptyState } from '@/components/Admin';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  tint: string;
}

const AGENTS: Agent[] = [
  { id: 'orchestrator', name: 'Orchestrator',    role: 'Central dispatcher — the Conductor',    icon: BrainCircuit, tint: '#7C3AED' },
  { id: 'obedian',      name: 'Obedian',          role: 'Memory & data architect',               icon: Activity,     tint: '#1E88D9' },
  { id: 'leila',        name: 'Leila',            role: 'Lead concierge & qualifying',            icon: Users,        tint: '#E63946' },
  { id: 'scribe',       name: 'The Scribe',       role: 'Ingestion & parsing pipeline',           icon: PenLine,      tint: '#C8961A' },
  { id: 'curator',      name: 'The Curator',      role: 'Inventory deduplification & pricing',    icon: Palette,      tint: '#E9C176' },
  { id: 'closer',       name: 'Stage-9 Closer',   role: 'Deal drafting & closing',                icon: Handshake,    tint: '#34D399' },
  { id: 'sentinel',     name: 'System Sentinel',  role: 'Infrastructure & reliability',           icon: Shield,       tint: '#64748b' },
];

const PIPELINE_STAGES = [
  'Sourcing', 'Enrichment', 'Qualification',
  'Matching', 'Engagement', 'Viewing',
  'Proposal', 'Closing',
];

export default function AgentControlCenter() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="AI-Driven Engine"
        title="Agents & Bots"
        subtitle="Monitor and intervene with autonomous agents across the Sierra Estates network."
        status={{ label: `${AGENTS.length} agents · all online`, ok: true }}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm">
            <RefreshCw size={15} />
            Sync
          </button>
        }
      />

      {/* Pipeline stages */}
      <div className="bg-white rounded-2xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] p-6 sm:p-8">
        <h2 className="font-bold text-[#071422] text-base font-display mb-5">Autonomous Pipeline</h2>
        <ol className="flex flex-wrap items-center gap-2">
          {PIPELINE_STAGES.map((stage, i) => (
            <li key={stage} className="flex items-center gap-2">
              <span className="rounded-full bg-[#f3f4f5] px-4 py-1.5 text-[12px] font-semibold text-[#071422]">
                <span className="text-[#C9A84C] font-mono mr-1.5">{i + 1}</span>
                {stage}
              </span>
              {i < PIPELINE_STAGES.length - 1 && (
                <span aria-hidden className="text-[#3a5570]/25 text-sm">→</span>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Agent fleet */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className="bg-white rounded-2xl p-6 border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] hover:shadow-[0_6px_24px_-4px_rgba(3,22,50,0.1)] hover:border-[#C9A84C]/20 transition-all flex flex-col group"
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${agent.tint}15`, border: `1px solid ${agent.tint}25` }}
                >
                  <Icon size={20} style={{ color: agent.tint }} />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <h3 className="text-[13px] font-bold text-[#071422] mb-1 font-display">{agent.name}</h3>
              <p className="text-[11px] text-[#3a5570]/60 leading-relaxed flex-1">{agent.role}</p>
              <div className="mt-4 pt-4 border-t border-[#f3f4f5] flex justify-end">
                <button className="flex items-center gap-1.5 text-[11px] text-[#3a5570]/50 hover:text-[#031632] transition font-semibold group-hover:text-[#3a5570]">
                  <Settings2 size={12} />
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Memory + intervention */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="bg-white rounded-2xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-[#f3f4f5]">
            <h2 className="font-bold text-[#071422] text-base font-display">Memory Explorer · Obedian</h2>
          </div>
          <div className="px-6 sm:px-8 py-6">
            <div className="rounded-xl border border-[#f3f4f5] bg-[#f8f9fa] p-5 font-mono text-[11px] leading-relaxed space-y-2">
              <div className="flex justify-between items-center pb-3 border-b border-[#f3f4f5] mb-3">
                <span className="text-[#3a5570]/40 uppercase tracking-wider text-[9px] font-bold">Global Knowledge Graph</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              </div>
              <p className="text-emerald-600 font-semibold">✓ System state synchronized</p>
              <p className="text-emerald-600 font-semibold">✓ Preference index online</p>
              <p className="text-emerald-600 font-semibold">✓ Vector cache warmed up</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-[#f3f4f5]">
            <h2 className="font-bold text-[#071422] text-base font-display">Manual Intervention Queue</h2>
          </div>
          <EmptyState
            icon={Shield}
            title="No alerts requiring human override"
            description="The Orchestrator escalates items here if an agent reaches its confidence threshold or requests permission for a destructive action."
          />
        </div>
      </div>
    </div>
  );
}
