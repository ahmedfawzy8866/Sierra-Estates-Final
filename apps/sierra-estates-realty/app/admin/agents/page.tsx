'use client';

import React from 'react';
import {
  Shield, BrainCircuit, Users, Activity, Settings2, RefreshCw,
  PenLine, Palette, Handshake, type LucideIcon,
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  tint: string;
}

// The autonomous agent fleet. Identities map to real modules in the codebase
// (orchestrator, obedian memory layer, Leila concierge, scribe, curator, closer).
const AGENTS: Agent[] = [
  { id: 'orchestrator', name: 'Orchestrator', role: 'Central dispatcher · the Conductor', icon: BrainCircuit, tint: '#7C3AED' },
  { id: 'obedian',      name: 'Obedian',      role: 'Memory & data architect',           icon: Activity,     tint: '#1E88D9' },
  { id: 'leila',        name: 'Leila',        role: 'Lead concierge & qualifying',        icon: Users,        tint: '#E63946' },
  { id: 'scribe',       name: 'The Scribe',   role: 'Ingestion & parsing pipeline',       icon: PenLine,      tint: '#C8961A' },
  { id: 'curator',      name: 'The Curator',  role: 'Inventory dedupe & pricing',         icon: Palette,      tint: '#E9C176' },
  { id: 'closer',       name: 'Stage-9 Closer', role: 'Deal drafting & closing',          icon: Handshake,    tint: '#34D399' },
  { id: 'sentinel',     name: 'System Sentinel', role: 'Infrastructure & reliability',    icon: Shield,       tint: '#34D399' },
];

// Structural overview of the autonomous pipeline a stakeholder flows through.
const PIPELINE_STAGES = [
  'Sourcing', 'Enrichment', 'Qualification', 'Matching', 'Engagement', 'Viewing', 'Proposal', 'Closing',
];

export default function AgentControlCenter() {
  return (
    <div className="max-w-7xl mx-auto space-y-8" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-2">
            AI-Driven Engine
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
            Agents &amp; Bots
          </h1>
          <p className="text-[#3a5570] mt-2 text-sm">
            Monitor and intervene with autonomous agents across the Sierra Estates network.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-widest">
              {AGENTS.length} agents · all online
            </span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm">
            <RefreshCw className="h-4 w-4" />
            Sync
          </button>
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] border border-[#f3f4f5]">
        <div className="pb-4 border-b border-[#f3f4f5] mb-6">
          <h2 className="font-bold text-[#071422] text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            Autonomous Pipeline
          </h2>
        </div>
        <ol className="flex flex-wrap items-center gap-3">
          {PIPELINE_STAGES.map((stage, index) => (
            <li key={stage} className="flex items-center gap-3">
              <span className="rounded-full border border-[#f3f4f5] bg-[#f8f9fa] px-4 py-2 text-sm text-[#071422]">
                <span className="mr-2 font-bold text-[#b88a2d]">{index + 1}</span>
                {stage}
              </span>
              {index < PIPELINE_STAGES.length - 1 && (
                <span aria-hidden className="text-[#3a5570]/40">→</span>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Agent fleet — all online */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <div key={agent.id}
              className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(3,22,50,0.1)] transition-all border border-[#f3f4f5] hover:border-[#C9A84C]/30 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${agent.tint}18`, border: `1px solid ${agent.tint}30` }}>
                  <Icon className="h-6 w-6" style={{ color: agent.tint }} />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <h3 className="text-base font-bold text-[#071422] mb-1">{agent.name}</h3>
              <p className="text-xs text-[#3a5570]/70 leading-relaxed flex-1">{agent.role}</p>
              <div className="mt-5 pt-4 border-t border-[#f3f4f5] flex justify-end">
                <button className="text-xs flex items-center gap-1 text-[#3a5570] hover:text-[#031632] transition font-medium">
                  <Settings2 className="h-3 w-3" />
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Memory + intervention */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] border border-[#f3f4f5]">
          <div className="pb-4 border-b border-[#f3f4f5] mb-6">
            <h2 className="font-bold text-[#071422] text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Memory Explorer · Obedian
            </h2>
          </div>
          <div className="rounded-xl border border-[#f3f4f5] bg-[#f8f9fa] p-5 font-mono text-xs leading-relaxed">
            <div className="flex justify-between items-center mb-4 border-b border-[#f3f4f5] pb-2">
              <span className="text-[#3a5570]/60 font-semibold uppercase tracking-wider">Global Knowledge Graph</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>
            <p className="text-emerald-600 font-semibold mb-1">✓ System state synchronized</p>
            <p className="text-emerald-600 font-semibold mb-1">✓ Preference index online</p>
            <p className="text-emerald-600 font-semibold">✓ Vector cache warmed up</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] border border-[#f3f4f5]">
          <div className="pb-4 border-b border-[#f3f4f5] mb-6">
            <h2 className="font-bold text-[#071422] text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Manual Intervention Queue
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-12 w-12 text-[#3a5570]/40 mb-4" />
            <h3 className="text-base font-bold text-[#071422] mb-1">No alerts requiring human override.</h3>
            <p className="text-xs text-[#3a5570]/70 max-w-sm leading-relaxed">
              The Orchestrator escalates items here if an agent reaches its confidence threshold or requests permission for a destructive action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
