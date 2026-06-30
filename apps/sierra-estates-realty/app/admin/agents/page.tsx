'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Shield, BrainCircuit, Users, Activity, RefreshCw,
  PenLine, Palette, Handshake, AlertTriangle, Play, Pause, Plus, type LucideIcon,
} from 'lucide-react';
import { SectionHeader, EmptyState } from '@/components/Admin';
import { auth } from '@/lib/firebase';

// ─── Curated persona fleet (the designed pipeline roles) ──────────────────────
// These are conceptual roles. Where a live worker reports under the same id in
// Firestore `agents`, we overlay its real status; otherwise it shows as Designed.
interface Persona {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  tint: string;
}

const PERSONAS: Persona[] = [
  { id: 'orchestrator', name: 'Orchestrator',   role: 'Central dispatcher — the Conductor',   icon: BrainCircuit, tint: '#7C3AED' },
  { id: 'obedian',      name: 'Obedian',         role: 'Memory & data architect',              icon: Activity,     tint: '#1E88D9' },
  { id: 'leila',        name: 'Leila',           role: 'Lead concierge & qualifying',           icon: Users,        tint: '#E63946' },
  { id: 'scribe',       name: 'The Scribe',      role: 'Ingestion & parsing pipeline',          icon: PenLine,      tint: '#C8961A' },
  { id: 'curator',      name: 'The Curator',     role: 'Inventory deduplication & pricing',     icon: Palette,      tint: '#E9C176' },
  { id: 'closer',       name: 'Stage-9 Closer',  role: 'Deal drafting & closing',               icon: Handshake,    tint: '#34D399' },
  { id: 'sentinel',     name: 'System Sentinel', role: 'Infrastructure & reliability',          icon: Shield,       tint: '#64748b' },
];

// Default admin-managed automation flows, mapped to the real workers in
// DEPLOYMENT.md. Seeded on demand via POST /api/admin/workflows (status: paused).
const DEFAULT_WORKFLOWS = [
  { name: 'WhatsApp Lead Sync',      nameAr: 'مزامنة عملاء واتساب',    desc: 'n8n broker-group scraping → lead ingestion',        descAr: '', color: '#C9A84C' },
  { name: 'PropertyFinder Sync',     nameAr: 'مزامنة بروبرتي فايندر',   desc: 'Python API listing import + dedupe',                 descAr: '', color: '#1E88D9' },
  { name: 'Nightly Data Enrichment', nameAr: 'إثراء البيانات الليلي',    desc: 'GitHub Actions external data-sync pipeline',          descAr: '', color: '#7C3AED' },
  { name: 'Owner Negotiation Follow-ups', nameAr: 'متابعة تفاوض الملاك', desc: 'Scheduled WhatsApp follow-ups for stale negotiations', descAr: '', color: '#34D399' },
  { name: 'Lead Qualification',      nameAr: 'تأهيل العملاء',           desc: 'Leila concierge — qualify & route new leads',        descAr: '', color: '#E63946' },
];

const PIPELINE_STAGES = [
  'Sourcing', 'Enrichment', 'Qualification',
  'Matching', 'Engagement', 'Viewing',
  'Proposal', 'Closing',
];

// ─── Live API shapes (see app/api/admin/agents + workflows) ───────────────────
interface Worker {
  id: string;
  name: string;
  desc?: string;
  emoji?: string;
  color?: string;
  status?: string;
  load?: number;
  tasks?: number;
  lastPulse?: unknown;
  lastError?: string | null;
  updatedAt?: unknown;
}

interface Workflow {
  id: string;
  name: string;
  desc?: string;
  color?: string;
  status?: string;
  runs?: number;
  last?: string;
  updatedAt?: unknown;
}

const ONLINE = new Set(['online', 'active', 'running', 'syncing']);

function statusTone(status?: string): 'ok' | 'warn' | 'idle' {
  const s = (status ?? '').toLowerCase();
  if (ONLINE.has(s)) return 'ok';
  if (s === 'error' || s === 'failed') return 'warn';
  return 'idle';
}

const TONE_STYLES: Record<'ok' | 'warn' | 'idle', string> = {
  ok:   'bg-emerald-50 text-emerald-700 border-emerald-100',
  warn: 'bg-red-50 text-red-700 border-red-100',
  idle: 'bg-gray-50 text-gray-500 border-gray-200',
};

/** Firestore admin Timestamps serialize to {_seconds}; the whatsapp worker sends an ISO string. */
function formatTime(value: unknown): string | null {
  if (!value) return null;
  let date: Date | null = null;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) date = d;
  } else if (typeof value === 'object') {
    const v = value as { _seconds?: number; seconds?: number };
    const secs = v._seconds ?? v.seconds;
    if (typeof secs === 'number') date = new Date(secs * 1000);
  }
  if (!date) return null;
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AgentControlCenter() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');
      const headers = { Authorization: `Bearer ${token}` };

      const [agentsRes, workflowsRes] = await Promise.all([
        fetch('/api/admin/agents', { headers, cache: 'no-store' }),
        fetch('/api/admin/workflows', { headers, cache: 'no-store' }),
      ]);
      if (!agentsRes.ok) throw new Error(`Agents request failed (${agentsRes.status})`);
      if (!workflowsRes.ok) throw new Error(`Workflows request failed (${workflowsRes.status})`);

      const agentsData = await agentsRes.json() as { agents?: Worker[] };
      const workflowsData = await workflowsRes.json() as { workflows?: Workflow[] };
      setWorkers(agentsData.agents ?? []);
      setWorkflows(workflowsData.workflows ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fleet status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const authHeaders = useCallback(async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  // Pause / activate an automation flow via PATCH /api/admin/workflows/[id].
  const toggleWorkflow = useCallback(async (id: string, current?: string) => {
    const next = (current ?? '').toLowerCase() === 'active' ? 'paused' : 'active';
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/workflows/${id}`, {
        method: 'PATCH',
        headers: await authHeaders(),
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, status: next } : w)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workflow');
    } finally {
      setBusyId(null);
    }
  }, [authHeaders]);

  // One-click seed of the default admin-managed automation flows (mapped to the
  // real workers in DEPLOYMENT.md). Posts through the authed create route so it
  // works in production with the signed-in admin's token.
  const seedWorkflows = useCallback(async () => {
    setSeeding(true);
    setError(null);
    try {
      const headers = await authHeaders();
      for (const wf of DEFAULT_WORKFLOWS) {
        const res = await fetch('/api/admin/workflows', {
          method: 'POST',
          headers,
          body: JSON.stringify(wf),
        });
        if (!res.ok) throw new Error(`Seed failed (${res.status})`);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed workflows');
    } finally {
      setSeeding(false);
    }
  }, [authHeaders, load]);

  const onlineCount = workers.filter((w) => statusTone(w.status) === 'ok').length;
  const activeFlows = workflows.filter((w) => (w.status ?? '').toLowerCase() === 'active').length;
  const liveById = new Map(workers.map((w) => [w.id, w]));

  const summaryLabel = loading
    ? 'Syncing fleet…'
    : error
      ? 'Fleet status unavailable'
      : `${onlineCount}/${workers.length || 0} workers online · ${activeFlows} active flows`;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="AI-Driven Engine"
        title="Agents & Workflows"
        subtitle="Monitor and intervene with autonomous workers and automation flows across the Sierra Estates network."
        status={{ label: summaryLabel, ok: !error }}
        actions={
          <button
            onClick={() => void load()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Sync
          </button>
        }
      />

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Could not reach the fleet APIs.</p>
            <p className="text-red-600/80 text-[13px] mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Pipeline stages (concept) */}
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

      {/* Operational workers — LIVE */}
      <section>
        <h2 className="font-bold text-[#071422] text-base font-display mb-4">Operational Workers · live</h2>
        {loading && workers.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white border border-black/[0.03] animate-pulse" />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)]">
            <EmptyState
              icon={Activity}
              title="No workers are reporting yet"
              description="Background workers (the WhatsApp scraper, n8n flows) publish their heartbeat to Firestore. Once one reports, it appears here in real time."
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {workers.map((w) => {
              const tone = statusTone(w.status);
              const pulse = formatTime(w.lastPulse) ?? formatTime(w.updatedAt);
              return (
                <div
                  key={w.id}
                  className="bg-white rounded-2xl p-6 border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] hover:shadow-[0_6px_24px_-4px_rgba(3,22,50,0.1)] transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${w.color ?? '#6366f1'}15`, border: `1px solid ${w.color ?? '#6366f1'}25` }}
                    >
                      {w.emoji ?? '🤖'}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${TONE_STYLES[tone]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tone === 'ok' ? 'bg-emerald-500 animate-pulse' : tone === 'warn' ? 'bg-red-500' : 'bg-gray-400'}`} />
                      {w.status ?? 'Idle'}
                    </span>
                  </div>
                  <h3 className="text-[13px] font-bold text-[#071422] mb-1 font-display">{w.name}</h3>
                  {w.desc && <p className="text-[11px] text-[#3a5570]/60 leading-relaxed flex-1">{w.desc}</p>}

                  {typeof w.load === 'number' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-mono text-[#3a5570]/50 mb-1">
                        <span>LOAD</span><span>{w.load}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#f3f4f5] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, w.load))}%`, backgroundColor: w.color ?? '#6366f1' }} />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-[#f3f4f5] flex items-center justify-between text-[10px] font-mono text-[#3a5570]/50">
                    <span>{typeof w.tasks === 'number' ? `${w.tasks} tasks` : ''}</span>
                    {pulse && <span>↺ {pulse}</span>}
                  </div>
                  {w.lastError && (
                    <p className="mt-2 text-[10px] text-red-600 font-mono truncate" title={w.lastError}>⚠ {w.lastError}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Automation workflows — LIVE */}
      <section>
        <h2 className="font-bold text-[#071422] text-base font-display mb-4">Automation Workflows · live</h2>
        {workflows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)]">
            <EmptyState
              icon={RefreshCw}
              title={loading ? 'Loading workflows…' : 'No automation workflows defined'}
              description="Admin-managed automation flows (n8n triggers, scheduled syncs) are surfaced here."
              action={
                !loading ? (
                  <button
                    onClick={() => void seedWorkflows()}
                    disabled={seeding}
                    className="flex items-center gap-2 px-4 py-2 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {seeding ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />}
                    {seeding ? 'Seeding…' : 'Seed default workflows'}
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden divide-y divide-[#f3f4f5]">
            {workflows.map((f) => {
              const tone = statusTone(f.status);
              const isActive = (f.status ?? '').toLowerCase() === 'active';
              const busy = busyId === f.id;
              return (
                <div key={f.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color ?? '#6366f1' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-[#071422] truncate">{f.name}</p>
                    {f.desc && <p className="text-[11px] text-[#3a5570]/60 truncate">{f.desc}</p>}
                  </div>
                  <div className="hidden sm:block text-[10px] font-mono text-[#3a5570]/50 text-right shrink-0">
                    {typeof f.runs === 'number' && <div>{f.runs} runs</div>}
                    {f.last && <div>last: {f.last}</div>}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${TONE_STYLES[tone]}`}>
                    {f.status ?? 'paused'}
                  </span>
                  <button
                    onClick={() => void toggleWorkflow(f.id, f.status)}
                    disabled={busy}
                    title={isActive ? 'Pause workflow' : 'Activate workflow'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/[0.06] text-[11px] font-semibold text-[#3a5570] hover:text-[#031632] hover:border-[#C9A84C]/40 transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {busy ? <RefreshCw size={12} className="animate-spin" /> : isActive ? <Pause size={12} /> : <Play size={12} />}
                    {isActive ? 'Pause' : 'Activate'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Agent roles (designed) with live overlay where available */}
      <section>
        <h2 className="font-bold text-[#071422] text-base font-display mb-4">Agent Roles</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {PERSONAS.map((agent) => {
            const Icon = agent.icon;
            const live = liveById.get(agent.id);
            const tone = live ? statusTone(live.status) : 'idle';
            return (
              <div
                key={agent.id}
                className="bg-white rounded-2xl p-6 border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] hover:shadow-[0_6px_24px_-4px_rgba(3,22,50,0.1)] hover:border-[#C9A84C]/20 transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${agent.tint}15`, border: `1px solid ${agent.tint}25` }}
                  >
                    <Icon size={20} style={{ color: agent.tint }} />
                  </div>
                  {live ? (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${TONE_STYLES[tone]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tone === 'ok' ? 'bg-emerald-500 animate-pulse' : tone === 'warn' ? 'bg-red-500' : 'bg-gray-400'}`} />
                      {live.status ?? 'Idle'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-200 uppercase tracking-wide">
                      Designed
                    </span>
                  )}
                </div>
                <h3 className="text-[13px] font-bold text-[#071422] mb-1 font-display">{agent.name}</h3>
                <p className="text-[11px] text-[#3a5570]/60 leading-relaxed flex-1">{agent.role}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Manual intervention queue */}
      <div className="bg-white rounded-2xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden">
        <div className="px-6 sm:px-8 py-5 border-b border-[#f3f4f5]">
          <h2 className="font-bold text-[#071422] text-base font-display">Manual Intervention Queue</h2>
        </div>
        <EmptyState
          icon={Shield}
          title="No alerts requiring human override"
          description="The Orchestrator escalates items here if a worker reaches its confidence threshold or requests permission for a destructive action."
        />
      </div>
    </div>
  );
}
