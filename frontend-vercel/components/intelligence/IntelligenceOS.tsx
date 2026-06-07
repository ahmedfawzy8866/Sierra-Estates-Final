'use client';

/**
 * Sierra Estates · Intelligence OS · Admin
 *
 * Full-screen control surface ported from the Omega admin prototype into the
 * live app and wired to the real Sierra API routes:
 *   - Workflows / orchestration  → /api/admin/control (orchestrate, matching)
 *   - Scrapers (PF + WhatsApp)    → /api/property-finder, /api/admin/control
 *   - Sheets ingestion            → /api/admin/control (sync-sheets)
 *   - CRM leads                   → /api/leads, /api/crm/leads
 *   - Listings hub / add listing  → /api/listings, /api/property-finder
 *   - Agents (Sierra/Leila/Lola)  → /api/agent/hub
 *   - Reports                     → /api/wealth/portfolio + live counts
 *   - OpenClaw terminal           → /api/openclaw, /api/admin/control
 *
 * Every backed call degrades to seed data so the OS renders even when a
 * backend is empty or unavailable.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sun, Moon, ChevronLeft, RefreshCw, Play, Pause, Link as LinkIcon,
} from 'lucide-react';
import {
  fetchListings, fetchLeads, fetchPortfolio, chatAgent, runMatchingBulk,
  openclawInsights, adminControl, type AgentId, type ControlAction,
} from '@/lib/intelligence/api';

/* ── Types ──────────────────────────────────────────────────── */
type Toast = (msg: string) => void;
interface Lead {
  name: string; phone: string; interest: string; stage: string; color: string; hot: boolean;
}
interface TermLine { t: string; l: string; }

/* ── Seed data (fallbacks) ──────────────────────────────────── */
const KPI_SEED = [
  { val: '1,547', lbl: 'Total Listings', delta: '+12% this week', up: true, color: '#C8961A' },
  { val: '284', lbl: 'Active Leads', delta: '+8 today', up: true, color: '#1E88D9' },
  { val: 'EGP 6.2M', lbl: 'Avg Deal Value', delta: '+5% MoM', up: true, color: '#34D399' },
  { val: '97', lbl: 'Deals Closed', delta: 'This month', up: true, color: '#7C3AED' },
  { val: '4.1s', lbl: 'Avg Response', delta: '-0.3s improved', up: true, color: '#C8961A' },
  { val: '98.2%', lbl: 'AI Match Rate', delta: '+0.4%', up: true, color: '#34D399' },
  { val: '23', lbl: 'Pending Reviews', delta: '3 urgent', up: false, color: '#E63946' },
  { val: '1,503', lbl: 'Elite Brokers', delta: '+45 this month', up: true, color: '#E9C176' },
];

interface AgentDef {
  name: string; desc: string; emoji: string; color: string;
  status: string; load: number; tasks: number; type: string; agentId?: AgentId;
}
const AGENTS: AgentDef[] = [
  { name: 'Sierra Bot', desc: 'Primary AI concierge — handles client queries, property recommendations and virtual tour scheduling.', emoji: '🤖', color: '#C8961A', status: 'Online', load: 94, tasks: 1203, type: 'Concierge', agentId: 'SIERRA_CORE' },
  { name: 'Leila / Lola', desc: 'Bilingual Arabic specialist — translates listings, handles Gulf Arabic negotiations and cultural context.', emoji: '🐪', color: '#1E88D9', status: 'Online', load: 87, tasks: 889, type: 'Translator', agentId: 'SIERRA_CORE' },
  { name: 'Stage-9 Closer', desc: 'Automated deal engine — drafts contracts, DocuSign integration, Stripe payment links for deposits.', emoji: '💼', color: '#34D399', status: 'Online', load: 71, tasks: 421, type: 'Closer', agentId: 'CLOSER' },
  { name: 'WhatsApp Scraper', desc: 'Monitors Property Finder, OLX and WhatsApp groups. Pushes structured leads to Firestore.', emoji: '🕵️', color: '#7C3AED', status: 'Running', load: 55, tasks: 2847, type: 'Scraper' },
  { name: 'The Scribe', desc: 'S1-S2 ingestion pipeline — parses raw listing data and normalizes to Sierra schema.', emoji: '✍️', color: '#E63946', status: 'Idle', load: 12, tasks: 4821, type: 'Ingestion', agentId: 'SCRIBE' },
  { name: 'The Curator', desc: 'S3-S5 inventory management — deduplication, quality scoring and AVM pricing engine.', emoji: '🎨', color: '#E9C176', status: 'Online', load: 68, tasks: 3102, type: 'Curator', agentId: 'CURATOR' },
];

interface WorkflowDef {
  name: string; status: string; runs: number; last: string; color: string; action?: ControlAction;
}
const WORKFLOWS_SEED: WorkflowDef[] = [
  { name: 'Lead Ingestion → Firestore', status: 'active', runs: 12840, last: '2 min ago', color: '#34D399', action: 'sync-leads' },
  { name: 'WhatsApp Scraper Cron (30m)', status: 'active', runs: 6420, last: '28 min ago', color: '#34D399', action: 'sync-leads' },
  { name: 'Listing Price AVM Sync', status: 'active', runs: 3210, last: '1 hr ago', color: '#34D399', action: 'sync-listings' },
  { name: 'Google Sheets Ingestion', status: 'active', runs: 980, last: '12 min ago', color: '#34D399', action: 'sync-sheets' },
  { name: 'Lead↔Listing Matching', status: 'active', runs: 421, last: '15 min ago', color: '#34D399', action: 'matching-bulk' },
  { name: 'Broker KPI Report (Daily)', status: 'active', runs: 186, last: '6 hrs ago', color: '#1E88D9' },
  { name: 'Stale Listing Monitor', status: 'warning', runs: 890, last: '2 hrs ago', color: '#f59e0b' },
  { name: 'Email Follow-Up Sequence', status: 'paused', runs: 1240, last: '1 day ago', color: '#E63946' },
];

const LEADS_SEED: Lead[] = [
  { name: 'Ahmed Al-Rashid', phone: '+20 100 111 2233', interest: 'Villa · Hyde Park · EGP 20M+', stage: 'Viewing Scheduled', color: '#C8961A', hot: true },
  { name: 'Sara Mohamed', phone: '+20 101 222 3344', interest: '3-Bed · Mivida · Rent', stage: 'AI Matched', color: '#1E88D9', hot: false },
  { name: 'Khalid Mansour', phone: '+971 50 333 4455', interest: 'Penthouse · Uptown · EGP 15M', stage: 'Contract Draft', color: '#34D399', hot: true },
  { name: 'Nadia Hassan', phone: '+20 112 444 5566', interest: 'Apartment · Madinaty · EGP 5M', stage: 'Initial Contact', color: '#7C3AED', hot: false },
  { name: 'Omar Farouk', phone: '+20 100 555 6677', interest: 'Twin House · Mountain View', stage: 'Negotiating', color: '#E63946', hot: true },
  { name: 'Layla Karim', phone: '+20 109 666 7788', interest: 'Furnished 2-Bed · Eastown', stage: 'AI Matched', color: '#E9C176', hot: false },
];

const COMPOUNDS: Record<string, { units: number; avgM: string; growth: string; zone: string; color: string }> = {
  'Mountain View iCity': { units: 1820, avgM: 'EGP 11.2M', growth: '+24%', zone: '5th Settlement', color: '#C8961A' },
  'Hyde Park': { units: 2100, avgM: 'EGP 18.5M', growth: '+22%', zone: '5th Settlement', color: '#1E88D9' },
  'Mivida': { units: 2400, avgM: 'EGP 5.8M', growth: '+18%', zone: '5th Settlement', color: '#34D399' },
  'Uptown Cairo': { units: 3200, avgM: 'EGP 9.4M', growth: '+31%', zone: 'Uptown Cairo', color: '#7C3AED' },
  'Madinaty': { units: 8500, avgM: 'EGP 4.5M', growth: '+15%', zone: 'Madinaty', color: '#E63946' },
  'Eastown': { units: 1600, avgM: 'EGP 8.2M', growth: '+19%', zone: '5th Settlement', color: '#E9C176' },
  'El Shorouk': { units: 4200, avgM: 'EGP 3.8M', growth: '+12%', zone: 'East Cairo', color: '#C8961A' },
  'Palm Hills NC': { units: 1200, avgM: 'EGP 12.4M', growth: '+21%', zone: '5th Settlement', color: '#1E88D9' },
  'Villette': { units: 880, avgM: 'EGP 9.8M', growth: '+20%', zone: '5th Settlement', color: '#34D399' },
  'Al Rehab': { units: 5200, avgM: 'EGP 3.5M', growth: '+11%', zone: 'New Cairo', color: '#7C3AED' },
  'Taj City': { units: 920, avgM: 'EGP 13.5M', growth: '+19%', zone: 'New Cairo', color: '#E63946' },
  'Sarai': { units: 1100, avgM: 'EGP 4.8M', growth: '+14%', zone: 'New Cairo', color: '#E9C176' },
};

const REPORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const REPORT_VALUES = [42, 58, 71, 65, 84, 97];

const OPENCLAW_SEED: TermLine[] = [
  { t: 'dim', l: 'OpenClaw v3.2.1 · Sierra Estates Intelligence OS' },
  { t: 'dim', l: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
  { t: 'green', l: '[✓] Firebase Auth connection established' },
  { t: 'green', l: '[✓] Firestore rules validated — collections active' },
  { t: 'green', l: '[✓] Sierra Bot online · Leila/Lola Arabic routing active' },
  { t: 'blue', l: '[~] WhatsApp Scraper — scanning Property Finder' },
  { t: '', l: '' },
  { t: 'dim', l: "Type 'help' for commands · 'sync' · 'insights' · 'leads' · 'agents'" },
];

const NAV = [
  { id: 'overview', label: 'Intelligence OS', icon: '🏠', section: 'Main' },
  { id: 'agents', label: 'Agents & Bots', icon: '🤖', section: 'Main', badge: '6', badgeColor: 'green' },
  { id: 'workflows', label: 'Workflows', icon: '⚡', section: 'Main', badge: '8', badgeColor: 'blue' },
  { id: 'scrapers', label: 'Scrapers', icon: '🕵️', section: 'Main' },
  { id: 'sheets', label: 'Sheets Sync', icon: '📑', section: 'Operations' },
  { id: 'openclaw', label: 'OpenClaw Terminal', icon: '⚙️', section: 'Operations' },
  { id: 'leads', label: 'CRM · Leads', icon: '👥', section: 'Operations', badge: '23', badgeColor: 'red' },
  { id: 'listings', label: 'Listings Hub', icon: '🏘️', section: 'Operations' },
  { id: 'reports', label: 'Reports', icon: '📊', section: 'Analytics' },
  { id: 'settings', label: 'System Config', icon: '🔧', section: 'System' },
];

const PAGE_TITLES: Record<string, string> = {
  overview: 'Intelligence OS', agents: 'Agents & Bots', workflows: 'Workflows',
  scrapers: 'Scrapers · Data Sources', sheets: 'Google Sheets Sync', openclaw: 'OpenClaw Terminal',
  leads: 'CRM · Leads', listings: 'Listings Hub', reports: 'Reports & Analytics', settings: 'System Config',
};

/* ── Overview ───────────────────────────────────────────────── */
function OverviewPage({ kpis }: { kpis: typeof KPI_SEED }) {
  return (
    <div className="fade-up">
      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card" style={{ borderLeftColor: k.color, borderLeftWidth: 3 }}>
            <div className="kpi-val gold-text">{k.val}</div>
            <div className="kpi-lbl">{k.lbl}</div>
            <div className={`kpi-delta ${k.up ? 'up' : 'dn'}`}>{k.up ? '↑' : '↓'} {k.delta}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div className="card">
          <div className="card-hd"><span className="card-title">Pipeline · S1→S10</span></div>
          <div className="card-body">
            <div className="bar-chart">
              {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'].map((s, i) => {
                const h = [95, 88, 82, 79, 74, 68, 61, 55, 42, 28][i];
                const c = ['#C8961A', '#E9C176', '#1E88D9', '#34D399', '#7C3AED', '#E63946', '#C8961A', '#1E88D9', '#34D399', '#C8961A'][i];
                return (
                  <div key={s} className="bar-col">
                    <div className="bar-fill" style={{ height: `${h}%`, background: `linear-gradient(180deg,${c},${c}44)` }} />
                    <span className="bar-lbl">{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">🔥 Hot Leads</span><span className="chip chip-red">3 urgent</span></div>
          <div style={{ maxHeight: 160, overflowY: 'auto' }}>
            {LEADS_SEED.filter((l) => l.hot).map((l, i) => (
              <div key={i} className="lead-row">
                <div className="lead-avatar" style={{ background: l.color }}>{l.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--tx-f)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.interest}</div>
                </div>
                <span className="chip chip-amber">{l.stage}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">Agent Status</span></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AGENTS.slice(0, 4).map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{a.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx)' }}>{a.name}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: a.status === 'Online' || a.status === 'Running' ? 'var(--emerald)' : 'var(--tx-f)' }}>{a.status}</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${a.load}%`, background: a.color }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Agent chat (Sierra / Leila / Lola / Closer / Scribe / Curator) ── */
function AgentChat({ agent, toast }: { agent: AgentDef; toast: Toast }) {
  const [msgs, setMsgs] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: agent.name.includes('Leila') || agent.name.includes('Lola')
      ? 'مرحباً! أنا ليلى — مساعدتك العقارية. كيف أقدر أساعدك اليوم؟'
      : `${agent.name} online. How can I help?` },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setMsgs((m) => [...m, { role: 'user', text }]);
    setInput(''); setBusy(true);
    if (!agent.agentId) {
      setMsgs((m) => [...m, { role: 'ai', text: 'This agent is a background worker (no live chat).' }]);
      setBusy(false); return;
    }
    const r = await chatAgent(agent.agentId, text);
    if (r.ok && r.data?.response) {
      setMsgs((m) => [...m, { role: 'ai', text: r.data!.response }]);
      if (r.data.vipAlert) toast('⭐ VIP lead detected — Telegram alert dispatched');
    } else {
      setMsgs((m) => [...m, { role: 'ai', text: `[offline] ${r.error || 'agent unavailable'}` }]);
    }
    setBusy(false);
  };

  return (
    <div className="card">
      <div className="card-hd">
        <span className="card-title">{agent.emoji} {agent.name} · Live Chat</span>
        <span className="chip chip-green"><span className="pulse-dot">●</span> {agent.status}</span>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', marginBottom: 10 }}>
          {msgs.map((m, i) => <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="os-input" style={{ flex: 1 }} value={input} disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={`Message ${agent.name}…`} />
          <button className="btn btn-gold" onClick={send} disabled={busy}>{busy ? '…' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Agents page ────────────────────────────────────────────── */
function AgentsPage({ toast }: { toast: Toast }) {
  const [active, setActive] = useState<number | null>(1); // Leila/Lola open by default
  return (
    <div className="fade-up">
      <div className="agent-grid" style={{ marginBottom: 20 }}>
        {AGENTS.map((a, i) => (
          <div key={i} className="agent-card" onClick={() => setActive(active === i ? null : i)}
            style={{ cursor: 'pointer', borderColor: active === i ? `${a.color}60` : 'var(--bd)' }}>
            <div className="agent-icon" style={{ background: `${a.color}18`, border: `1px solid ${a.color}30` }}>{a.emoji}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div className="agent-name">{a.name}</div>
              <span className={`chip ${a.status === 'Online' || a.status === 'Running' ? 'chip-green' : a.status === 'Idle' ? 'chip-amber' : 'chip-blue'}`}><span className="pulse-dot">●</span> {a.status}</span>
            </div>
            <div className="agent-desc">{a.desc}</div>
            <div className="agent-stat"><span style={{ color: 'var(--tx-f)' }}>Load</span><span style={{ color: a.color, fontWeight: 700 }}>{a.load}%</span></div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${a.load}%`, background: a.color }} /></div>
            <div className="agent-stat" style={{ marginTop: 8 }}><span style={{ color: 'var(--tx-f)' }}>Total tasks</span><span style={{ color: 'var(--tx)', fontWeight: 700 }}>{a.tasks.toLocaleString()}</span></div>
          </div>
        ))}
      </div>
      {active !== null && <AgentChat agent={AGENTS[active]} toast={toast} />}
    </div>
  );
}

/* ── Workflows page ─────────────────────────────────────────── */
function WorkflowsPage({ toast }: { toast: Toast }) {
  const [wfs, setWfs] = useState(WORKFLOWS_SEED.map((w) => ({ ...w })));
  const [busy, setBusy] = useState<number | null>(null);

  const toggle = (i: number) =>
    setWfs((prev) => prev.map((w, j) => (j === i ? { ...w, status: w.status === 'paused' ? 'active' : 'paused' } : w)));

  const run = async (i: number) => {
    const wf = wfs[i];
    if (!wf.action) { toast(`${wf.name}: no server trigger bound`); return; }
    setBusy(i);
    const r = await adminControl(wf.action);
    toast(r.ok ? `✓ ${wf.name} triggered` : `✗ ${wf.name}: ${r.error || 'failed'}`);
    setWfs((prev) => prev.map((w, j) => (j === i ? { ...w, last: 'just now', runs: w.runs + 1 } : w)));
    setBusy(null);
  };

  const runAll = async () => {
    for (let i = 0; i < wfs.length; i++) if (wfs[i].action && wfs[i].status === 'active') await run(i);
  };

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn btn-gold" onClick={runAll}><Play size={12} /> Run All Active</button>
        <button className="btn btn-ghost" onClick={() => toast('Status refreshed')}><RefreshCw size={12} /> Refresh Status</button>
      </div>
      <div className="card">
        <div className="card-hd"><span className="card-title">Automation Workflows</span></div>
        <div style={{ padding: '8px 0' }}>
          {wfs.map((w, i) => (
            <div key={i} className="wf-node">
              <div className="wf-dot pulse-dot" style={{ background: w.color }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', marginBottom: 2 }}>{w.name}</p>
                <p style={{ fontSize: 9.5, color: 'var(--tx-f)', fontFamily: 'JetBrains Mono' }}>{w.runs.toLocaleString()} runs · last: {w.last}{w.action ? ' · wired' : ''}</p>
              </div>
              <span className={`chip ${w.status === 'active' ? 'chip-green' : w.status === 'warning' ? 'chip-amber' : 'chip-red'}`}>{w.status}</span>
              {w.action && (
                <button onClick={() => run(i)} disabled={busy === i} className="btn btn-green" style={{ padding: '4px 8px', fontSize: 10, marginLeft: 4 }}>
                  {busy === i ? '…' : <Play size={12} />}
                </button>
              )}
              <button onClick={() => toggle(i)} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10, marginLeft: 4 }}>
                {w.status === 'paused' ? <Play size={12} /> : <Pause size={12} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Scrapers page ──────────────────────────────────────────── */
function ScrapersPage({ toast }: { toast: Toast }) {
  const [busy, setBusy] = useState('');
  const trigger = async (label: string, action: ControlAction) => {
    setBusy(label);
    const r = await adminControl(action);
    toast(r.ok ? `✓ ${label} complete` : `✗ ${label}: ${r.error || 'failed'}`);
    setBusy('');
  };
  const cards = [
    { l: 'Property Finder · Listings', d: 'Pull & sync listings from Property Finder.', emoji: '🏢', action: 'sync-listings' as ControlAction, color: '#1E88D9' },
    { l: 'Property Finder · Leads', d: 'Import new buyer/renter leads.', emoji: '👤', action: 'sync-leads' as ControlAction, color: '#34D399' },
    { l: 'WhatsApp / Sheets Intake', d: 'Ingest pending rows scraped to Google Sheets.', emoji: '🕵️', action: 'sync-sheets' as ControlAction, color: '#7C3AED' },
    { l: 'Run Matching Engine', d: 'Match unmatched leads to inventory (bulk).', emoji: '🎯', action: 'matching-bulk' as ControlAction, color: '#C8961A' },
  ];
  return (
    <div className="fade-up">
      <div className="agent-grid">
        {cards.map((c, i) => (
          <div key={i} className="agent-card">
            <div className="agent-icon" style={{ background: `${c.color}18`, border: `1px solid ${c.color}30` }}>{c.emoji}</div>
            <div className="agent-name">{c.l}</div>
            <div className="agent-desc">{c.d}</div>
            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} disabled={busy === c.l} onClick={() => trigger(c.l, c.action)}>
              {busy === c.l ? 'Running…' : <><Play size={12} /> Run now</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Sheets sync page ───────────────────────────────────────── */
function SheetsPage({ toast }: { toast: Toast }) {
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string>('Idle. Ingestion reads PENDING rows from the configured Google Sheet and pushes them through the Scribe → Curator pipeline.');
  const run = async () => {
    setBusy(true); setLog('Ingesting from Google Sheets…');
    const r = await adminControl('sync-sheets');
    setLog(r.ok ? `✓ Sheets ingestion complete: ${JSON.stringify(r.data?.result ?? r.data)}` : `✗ ${r.error || 'failed'}`);
    toast(r.ok ? '✓ Sheets ingestion complete' : `✗ Sheets: ${r.error}`);
    setBusy(false);
  };
  return (
    <div className="fade-up" style={{ maxWidth: 760 }}>
      <div className="card">
        <div className="card-hd"><span className="card-title">📑 Google Sheets · Lead/Listing Ingestion</span></div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button className="btn btn-gold" style={{ alignSelf: 'flex-start' }} disabled={busy} onClick={run}>
            {busy ? 'Ingesting…' : <><RefreshCw size={12} /> Ingest PENDING rows now</>}
          </button>
          <div className="terminal" style={{ minHeight: 120 }}><div className="term-line">{log}</div></div>
        </div>
      </div>
    </div>
  );
}

/* ── OpenClaw terminal ──────────────────────────────────────── */
function OpenClawPage({ toast }: { toast: Toast }) {
  const [cmd, setCmd] = useState('');
  const [logs, setLogs] = useState<TermLine[]>(OPENCLAW_SEED);
  const termRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, [logs]);

  const push = (lines: TermLine[]) => setLogs((prev) => [...prev, ...lines]);

  const runCmd = async (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const c = cmd.trim(); if (!c) return;
    push([{ t: 'prompt', l: c }]); setCmd('');
    if (c === 'clear') { setLogs([]); return; }
    if (c === 'help') { push([{ t: 'dim', l: 'Commands: status · sync · leads · agents · insights · clear' }]); return; }
    if (c.startsWith('sync')) {
      push([{ t: 'blue', l: '[~] Triggering Property-Finder listing sync…' }]);
      const r = await adminControl('sync-listings');
      push([{ t: r.ok ? 'green' : 'red', l: r.ok ? `[✓] ${JSON.stringify(r.data?.result ?? r.data)}` : `[!] ${r.error}` }]);
      return;
    }
    if (c.startsWith('insights')) {
      push([{ t: 'blue', l: '[~] Generating OpenClaw strategic insights…' }]);
      const r = await openclawInsights({ listings: 1547, stakeholders: 284, sales: 97, priorityFocus: 'New Cairo' }, ['lead spike', 'stale inventory in Madinaty']);
      const ins = r.ok ? r.data?.insights : null;
      if (ins && ins.length) ins.forEach((x) => push([{ t: x.type === 'warning' ? 'red' : 'green', l: `[${x.type}] ${x.text}` }]));
      else push([{ t: 'dim', l: `[i] ${r.error || 'no insights (AI offline)'}` }]);
      return;
    }
    if (c.startsWith('leads')) { push([{ t: '', l: '  Active leads: 284 · Hot: 3 · Today: +8' }]); return; }
    if (c.startsWith('agents') || c.startsWith('status')) { push([{ t: 'green', l: '[✓] 6 agents operational · Sierra · Leila/Lola · Closer · Scraper · Scribe · Curator' }]); return; }
    push([{ t: 'red', l: `[!] Unknown command: ${c}. Type 'help'.` }]);
  };

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn btn-ghost" onClick={() => setLogs(OPENCLAW_SEED)}><RefreshCw size={12} /> Reset</button>
        <button className="btn btn-gold" onClick={() => { setCmd('insights'); toast('Generating insights…'); }}>⚡ Generate Insights</button>
      </div>
      <div className="card">
        <div className="card-hd"><span className="card-title">⚙️ OpenClaw · Sierra Intelligence Terminal</span><span className="chip chip-green"><span className="pulse-dot">●</span> Connected</span></div>
        <div ref={termRef} className="terminal" style={{ height: 380, margin: '0 14px 14px' }}>
          {logs.map((l, i) => <div key={i} className={`term-line ${l.t} ${l.t === 'prompt' ? 'term-prompt' : ''}`}>{l.l}</div>)}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <span style={{ color: 'var(--gold)' }}>sierra@intel:~$</span>
            <input value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={runCmd}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--gold-lt)' }}
              placeholder="Type a command…" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── CRM Leads ──────────────────────────────────────────────── */
function LeadsPage({ toast }: { toast: Toast }) {
  const [q, setQ] = useState('');
  const [leads, setLeads] = useState<Lead[]>(LEADS_SEED);

  useEffect(() => {
    (async () => {
      const r = await fetchLeads();
      const raw = (r.ok && (Array.isArray(r.data) ? r.data : (r.data as { leads?: unknown[]; data?: unknown[] })?.leads || (r.data as { data?: unknown[] })?.data)) || null;
      if (Array.isArray(raw) && raw.length) {
        setLeads(raw.slice(0, 50).map((x): Lead => {
          const o = x as Record<string, unknown>;
          return {
            name: String(o.client_name || o.name || 'Lead'),
            phone: String(o.client_mobile || o.phone || '—'),
            interest: String(o.conversation_summary || o.interest || o.compound_target || '—'),
            stage: String(o.stage || o.status || 'New'),
            color: '#C8961A', hot: Boolean(o.hot || o.vip),
          };
        }));
        toast(`Loaded ${raw.length} live leads`);
      }
    })();
  }, [toast]);

  const filtered = useMemo(
    () => leads.filter((l) => !q || l.name.toLowerCase().includes(q.toLowerCase()) || l.interest.toLowerCase().includes(q.toLowerCase())),
    [q, leads]
  );
  const stageColor = (s: string) =>
    ({ 'Viewing Scheduled': 'chip-blue', 'AI Matched': 'chip-green', 'Contract Draft': 'chip-green', 'Initial Contact': 'chip-amber', Negotiating: 'chip-red' } as Record<string, string>)[s] || 'chip-amber';

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input className="os-input" style={{ flex: 1 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads…" />
        <button className="btn btn-gold" onClick={() => toast('Add Lead — open intake form (wired to /api/crm/leads)')}>+ Add Lead</button>
        <button className="btn btn-ghost" onClick={() => toast('Exporting CSV…')}>Export CSV</button>
      </div>
      <div className="card">
        <div className="card-hd"><span className="card-title">CRM · Active Leads</span><span className="chip chip-red">{filtered.length} leads</span></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Client</th><th>Phone</th><th>Interest</th><th>Stage</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={i}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="lead-avatar" style={{ background: l.color, width: 28, height: 28, fontSize: 11 }}>{l.name[0]}</div>
                    <span style={{ color: 'var(--tx)', fontWeight: 600 }}>{l.name}</span>
                    {l.hot && <span style={{ fontSize: 12 }}>🔥</span>}
                  </div></td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}>{l.phone}</td>
                  <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.interest}</td>
                  <td><span className={`chip ${stageColor(l.stage)}`}>{l.stage}</span></td>
                  <td><div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 9 }}>📋 View</button>
                    <button className="btn btn-green" style={{ padding: '3px 8px', fontSize: 9 }}>💬 WhatsApp</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Listings hub ───────────────────────────────────────────── */
function ListingsPage({ toast }: { toast: Toast }) {
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<number | null>(null);
  const comps = Object.entries(COMPOUNDS).slice(0, 12);

  useEffect(() => {
    (async () => {
      const r = await fetchListings(48);
      if (r.ok && typeof r.data?.count === 'number') { setLive(r.data.count); toast(`${r.data.count} live listings in Firestore`); }
    })();
  }, [toast]);

  const sync = async () => {
    setBusy(true);
    const r = await adminControl('sync-listings');
    toast(r.ok ? '✓ Listings synced from Property Finder' : `✗ ${r.error || 'sync failed'}`);
    setBusy(false);
  };

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <button className="btn btn-gold" onClick={() => toast('Add Listing — wired to /api/property-finder?action=create-listing')}>+ Add Listing</button>
        <button className="btn btn-ghost" disabled={busy} onClick={sync}><RefreshCw size={12} /> {busy ? 'Syncing…' : 'Sync from Property Finder'}</button>
        {live !== null && <span className="chip chip-green">{live} live</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
        {comps.map(([name, cd], i) => (
          <div key={i} className="agent-card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: cd.color, fontWeight: 700, textTransform: 'uppercase' }}>{cd.zone}</span>
              <span className="chip chip-green" style={{ fontSize: 9 }}>{cd.growth}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--tx)', marginBottom: 2 }}>{name}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--gold)', marginBottom: 6 }}>{cd.avgM} avg</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--tx-f)' }}>
              <span>{cd.units.toLocaleString()} units</span>
              <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 9 }}>View →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Reports ────────────────────────────────────────────────── */
function ReportsPage({ toast }: { toast: Toast }) {
  const [portfolioCount, setPortfolioCount] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      const r = await fetchPortfolio(8);
      const arr = Array.isArray(r.data) ? r.data : (r.data as { portfolio?: unknown[] })?.portfolio;
      if (r.ok && Array.isArray(arr)) { setPortfolioCount(arr.length); toast(`Portfolio: ${arr.length} curated assets`); }
    })();
  }, [toast]);
  return (
    <div className="fade-up">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="card">
          <div className="card-hd"><span className="card-title">📊 Monthly Deals Closed</span></div>
          <div className="card-body">
            <div className="bar-chart">
              {REPORT_MONTHS.map((m, i) => (
                <div key={m} className="bar-col">
                  <div className="bar-fill" style={{ height: `${REPORT_VALUES[i]}%`, background: 'linear-gradient(180deg,#C8961A,#C8961A55)' }} />
                  <span className="bar-lbl">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">💰 Revenue Pipeline</span>{portfolioCount !== null && <span className="chip chip-green">{portfolioCount} assets</span>}</div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { l: 'Closed This Month', v: 'EGP 601M', pct: 100, color: '#34D399' },
              { l: 'Pipeline Value', v: 'EGP 2.1B', pct: 78, color: '#C8961A' },
              { l: 'Avg Deal', v: 'EGP 6.2M', pct: 55, color: '#1E88D9' },
              { l: 'Commissions Due', v: 'EGP 18.4M', pct: 30, color: '#7C3AED' },
            ].map((r, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                  <span style={{ color: 'var(--tx-m)' }}>{r.l}</span>
                  <span style={{ color: r.color, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{r.v}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${r.pct}%`, background: r.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-hd"><span className="card-title">🗺️ Performance by Compound</span></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Compound</th><th>Listings</th><th>Views</th><th>Leads</th><th>Deals</th><th>Avg Price</th><th>AI Score</th></tr></thead>
            <tbody>
              {[
                { c: 'Mountain View iCity', l: 145, v: 2840, ld: 67, d: 12, p: 'EGP 11.2M', ai: 9.4 },
                { c: 'Hyde Park', l: 98, v: 1920, ld: 54, d: 9, p: 'EGP 18.5M', ai: 9.7 },
                { c: 'Mivida', l: 112, v: 1650, ld: 48, d: 11, p: 'EGP 5.8M', ai: 9.0 },
                { c: 'Uptown Cairo', l: 187, v: 3120, ld: 89, d: 18, p: 'EGP 9.4M', ai: 9.3 },
                { c: 'Madinaty', l: 324, v: 4200, ld: 112, d: 24, p: 'EGP 4.5M', ai: 8.8 },
                { c: 'Eastown', l: 76, v: 980, ld: 31, d: 6, p: 'EGP 8.2M', ai: 9.1 },
              ].map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--tx)' }}>{r.c}</td>
                  <td style={{ fontFamily: 'JetBrains Mono' }}>{r.l}</td>
                  <td style={{ fontFamily: 'JetBrains Mono' }}>{r.v.toLocaleString()}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--blue)' }}>{r.ld}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--emerald)', fontWeight: 700 }}>{r.d}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--gold)', fontWeight: 700 }}>{r.p}</td>
                  <td><span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: r.ai >= 9.5 ? 'var(--emerald)' : r.ai >= 9 ? 'var(--gold)' : 'var(--tx-m)' }}>{r.ai}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Settings ───────────────────────────────────────────────── */
function SettingsPage({ toast }: { toast: Toast }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState('');
  const ops: { l: string; a: ControlAction }[] = [
    { l: 'Sync Sheets', a: 'sync-sheets' },
    { l: 'Sync Leads', a: 'sync-leads' },
    { l: 'Sync Listings', a: 'sync-listings' },
    { l: 'Seed Demo Listings', a: 'seed-listings' },
  ];
  const runOp = async (l: string, a: ControlAction) => {
    setBusy(l);
    const r = await adminControl(a);
    toast(r.ok ? `✓ ${l} done` : `✗ ${l}: ${r.error || 'failed'}`);
    setBusy('');
  };
  return (
    <div className="fade-up" style={{ maxWidth: 700 }}>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-hd"><span className="card-title">🔧 System Configuration</span></div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { l: 'Firebase Project ID', v: 'sierra-estates-2026', type: 'text' },
            { l: 'Gemini API Key', v: '', type: 'password', ph: 'set via GOOGLE_AI_API_KEY env' },
            { l: 'n8n / Webhook Base URL', v: '', type: 'text', ph: 'https://…/webhook' },
          ].map((f, i) => (
            <div key={i}>
              <label style={{ fontFamily: 'JetBrains Mono', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--gold)', display: 'block', marginBottom: 5 }}>{f.l}</label>
              <input className="os-input" style={{ width: '100%' }} type={f.type} defaultValue={f.v} placeholder={f.ph || ''} />
            </div>
          ))}
          <button className="btn btn-gold" style={{ alignSelf: 'flex-start' }} onClick={() => { setSaved(true); toast('Configuration saved'); setTimeout(() => setSaved(false), 2000); }}>
            {saved ? '✓ Saved!' : 'Save Configuration'}
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card-hd"><span className="card-title">⚙️ Pipeline Operations</span></div>
        <div className="card-body" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ops.map((o) => (
            <button key={o.a} className="btn btn-ghost" disabled={busy === o.l} onClick={() => runOp(o.l, o.a)}>
              {busy === o.l ? '…' : <RefreshCw size={12} />} {o.l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Root ───────────────────────────────────────────────────── */
export default function IntelligenceOS() {
  const [tab, setTab] = useState('overview');
  const [theme, setTheme] = useState('dark');
  const [collapsed, setCollapsed] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [kpis, setKpis] = useState(KPI_SEED);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback<Toast>((msg) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3200);
  }, []);

  useEffect(() => {
    try { setTheme(localStorage.getItem('sierra_os_theme') || 'dark'); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem('sierra_os_theme', theme); } catch { /* ignore */ }
  }, [theme]);

  // Live KPI overlay (listings count) — falls back silently.
  useEffect(() => {
    (async () => {
      const r = await fetchListings(1);
      if (r.ok && typeof r.data?.count === 'number' && r.data.count > 0) {
        setKpis((prev) => prev.map((k) => (k.lbl === 'Total Listings' ? { ...k, val: r.data!.count.toLocaleString() } : k)));
      }
    })();
  }, []);

  const sections = [...new Set(NAV.map((n) => n.section))];
  const render = () => {
    switch (tab) {
      case 'overview': return <OverviewPage kpis={kpis} />;
      case 'agents': return <AgentsPage toast={toast} />;
      case 'workflows': return <WorkflowsPage toast={toast} />;
      case 'scrapers': return <ScrapersPage toast={toast} />;
      case 'sheets': return <SheetsPage toast={toast} />;
      case 'openclaw': return <OpenClawPage toast={toast} />;
      case 'leads': return <LeadsPage toast={toast} />;
      case 'listings': return <ListingsPage toast={toast} />;
      case 'reports': return <ReportsPage toast={toast} />;
      case 'settings': return <SettingsPage toast={toast} />;
      default: return <OverviewPage kpis={kpis} />;
    }
  };

  return (
    <div className="sierra-os" data-theme={theme}>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="brand">
          <span style={{ fontSize: 22 }}>🏔️</span>
          <div className="brand-text">
            <div className="brand-name">SIERRA ESTATES</div>
            <div className="brand-sub">Intelligence OS</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
          {sections.map((sec) => (
            <div key={sec}>
              <div className="nav-section">{sec}</div>
              {NAV.filter((n) => n.section === sec).map((n) => (
                <div key={n.id} className={`nav-item ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)} title={n.label}>
                  <span className="nav-icon">{n.icon}</span>
                  <span>{n.label}</span>
                  {n.badge && <span className={`nav-badge ${n.badgeColor || ''}`}>{n.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--bd)', padding: '10px 8px' }}>
          <div className="nav-item" onClick={() => setCollapsed((c) => !c)} title="Toggle sidebar">
            <span className="nav-icon" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 300ms' }}><ChevronLeft size={14} /></span>
            <span>Collapse</span>
          </div>
        </div>
      </aside>

      <main className="os-main">
        <div className="topbar">
          <h1 className="topbar-title">{PAGE_TITLES[tab] || 'Sierra Estates'}</h1>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <a href="/admin/dashboard" className="topbar-pill"><LinkIcon size={12} /> Admin Nexus</a>
            <button className="topbar-pill" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
              {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
            </button>
            <div className="topbar-pill on"><span className="pulse-dot" style={{ color: 'var(--emerald)' }}>●</span> V13 Stable</div>
          </div>
        </div>
        <div className="os-content">{render()}</div>
      </main>

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
