'use client';

/**
 * SIERRA ESTATES — ADMIN EXCHANGE HUB (NEXUS)
 * Central control plane: wires Admin UI ↔ Agents ↔ Workflows
 * via the shared Firestore Exchange Sheet (/exchange collection)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  subscribeAllExchange,
  subscribeAgentTasks,
  subscribeWorkflowRuns,
  sendAdminSignal,
  type ExchangeRecord,
} from '@/lib/exchange/exchange-client';

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending:   'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    running:   'bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse',
    done:      'bg-green-500/20 text-green-300 border-green-500/30',
    error:     'bg-red-500/20 text-red-300 border-red-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${colors[status] ?? colors.pending}`}>
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const icons: Record<string, string> = {
    agent_task:     '🤖',
    workflow_run:   '⚡',
    admin_signal:   '🎛️',
    crm_event:      '👥',
    lead_update:    '📋',
    property_match: '🏠',
    proposal_ready: '📄',
  };
  return (
    <span className="text-xs text-white/60 font-mono">
      {icons[type] ?? '📌'} {type.replace('_', ' ')}
    </span>
  );
}

function ProgressBar({ progress, stepName }: { progress?: number; stepName?: string }) {
  if (progress === undefined) return null;
  return (
    <div className="mt-1">
      <div className="flex justify-between text-[10px] text-white/40 mb-0.5">
        <span>{stepName ?? 'Processing…'}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E5C66A] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ExchangeRow({ record }: { record: ExchangeRecord }) {
  const [expanded, setExpanded] = useState(false);
  const ts = record.createdAt?.toDate?.()?.toLocaleTimeString() ?? '—';
  return (
    <div
      className="border border-white/10 rounded-lg p-3 hover:border-[#C9A84C]/30 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <TypeBadge type={record.type} />
          <span className="text-white/40 text-xs font-mono truncate">#{record.id.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={record.status} />
          <span className="text-white/30 text-xs">{ts}</span>
        </div>
      </div>
      <ProgressBar progress={record.progress} stepName={record.stepName} />
      {expanded && (
        <div className="mt-3 p-2 bg-black/30 rounded text-xs font-mono text-white/60 overflow-auto max-h-32">
          <pre>{JSON.stringify({ payload: record.payload, result: record.result, error: record.error }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

type Tab = 'all' | 'agents' | 'workflows' | 'signals';

export default function AdminNexusPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [allRecords, setAllRecords] = useState<ExchangeRecord[]>([]);
  const [agentRecords, setAgentRecords] = useState<ExchangeRecord[]>([]);
  const [workflowRecords, setWorkflowRecords] = useState<ExchangeRecord[]>([]);
  const [signalPayload, setSignalPayload] = useState('');
  const [agentId, setAgentId] = useState('');
  const [sending, setSending] = useState(false);
  const [lastSignalId, setLastSignalId] = useState<string | null>(null);

  useEffect(() => {
    const unsub1 = subscribeAllExchange(setAllRecords);
    const unsub2 = subscribeAgentTasks(setAgentRecords);
    const unsub3 = subscribeWorkflowRuns(setWorkflowRecords);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const visibleRecords =
    tab === 'agents'    ? agentRecords :
    tab === 'workflows' ? workflowRecords :
    tab === 'signals'   ? allRecords.filter(r => r.type === 'admin_signal') :
    allRecords;

  const stats = {
    total:   allRecords.length,
    running: allRecords.filter(r => r.status === 'running').length,
    done:    allRecords.filter(r => r.status === 'done').length,
    error:   allRecords.filter(r => r.status === 'error').length,
  };

  const handleSendSignal = useCallback(async () => {
    if (!signalPayload.trim()) return;
    setSending(true);
    try {
      const id = await sendAdminSignal({
        action: signalPayload.trim(),
        targetAgentId: agentId.trim() || undefined,
      });
      setLastSignalId(id);
      setSignalPayload('');
      setAgentId('');
    } catch (err) {
      console.error('[Nexus] Failed to send signal:', err);
    } finally {
      setSending(false);
    }
  }, [signalPayload, agentId]);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          🎛️ Exchange Hub — <span className="text-[#C9A84C]">Nexus</span>
        </h1>
        <p className="text-white/50 text-sm">Live data contract between Admin, Agents &amp; Workflows</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',   value: stats.total,   color: 'text-white' },
          { label: 'Running', value: stats.running,  color: 'text-blue-400' },
          { label: 'Done',    value: stats.done,     color: 'text-green-400' },
          { label: 'Errors',  value: stats.error,    color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-white/40 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-[#C9A84C]/20 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-widest mb-3">
          ⚡ Send Admin Signal
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={agentId}
            onChange={e => setAgentId(e.target.value)}
            placeholder="Agent ID (optional)"
            className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-48 focus:outline-none focus:border-[#C9A84C]/50"
          />
          <input
            type="text"
            value={signalPayload}
            onChange={e => setSignalPayload(e.target.value)}
            placeholder="Action (e.g. start_closer, refresh_leads)"
            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A84C]/50"
            onKeyDown={e => e.key === 'Enter' && handleSendSignal()}
          />
          <button
            onClick={handleSendSignal}
            disabled={sending || !signalPayload.trim()}
            className="px-5 py-2 bg-[#C9A84C] text-[#0A1628] font-bold text-sm rounded-lg hover:bg-[#B8973B] disabled:opacity-40 transition-colors"
          >
            {sending ? '…' : 'Send'}
          </button>
        </div>
        {lastSignalId && (
          <p className="text-green-400 text-xs mt-2 font-mono">✅ Signal sent — ID: {lastSignalId}</p>
        )}
      </div>

      <div className="flex gap-1 mb-4 bg-white/5 p-1 rounded-lg w-fit">
        {([
          { id: 'all',       label: 'All Records' },
          { id: 'agents',    label: '🤖 Agents' },
          { id: 'workflows', label: '⚡ Workflows' },
          { id: 'signals',   label: '🎛️ Signals' },
        ] as { id: Tab; label: string }[]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === id ? 'bg-[#C9A84C] text-[#0A1628]' : 'text-white/60 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visibleRecords.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-sm">No exchange records yet.</div>
            <div className="text-xs mt-1">Send an admin signal to get started.</div>
          </div>
        ) : (
          visibleRecords.map(record => (
            <ExchangeRow key={record.id} record={record} />
          ))
        )}
      </div>
    </div>
  );
}
