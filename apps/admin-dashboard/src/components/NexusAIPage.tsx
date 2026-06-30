import React, { useState, useEffect, useCallback } from 'react';
import {
  subscribeAllExchange,
  sendAdminSignal,
  type ExchangeRecord,
} from '@sierra-estates/exchange';
import { createSierraNotification } from '../firebase';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    running:   'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse',
    done:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
    error:     'bg-red-500/10 text-red-400 border-red-500/10',
    cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase tracking-wider ${colors[status] ?? colors.pending}`}>
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
    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
      {icons[type] ?? '📌'} {type.replace('_', ' ')}
    </span>
  );
}

export default function NexusAIPage() {
  const [records, setRecords] = useState<ExchangeRecord[]>([]);
  const [filter, setFilter] = useState('All');
  const [agentId, setAgentId] = useState('');
  const [signalPayload, setSignalPayload] = useState('');
  const [sending, setSending] = useState(false);
  const [lastSignalId, setLastSignalId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAllExchange((data) => {
      setRecords(data);
    });
    return () => unsub();
  }, []);

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
      
      createSierraNotification(
        'system',
        'Admin Signal Dispatched',
        `Dispatched signal: "${signalPayload.trim()}" to exchange hub.`,
        'إرسال إشارة التحكم',
        `تم إرسال إشارة التحكم: "${signalPayload.trim()}" إلى لوحة التبادل.`
      );
    } catch (err) {
      console.error('[Nexus] Failed to send signal:', err);
    } finally {
      setSending(false);
    }
  }, [signalPayload, agentId]);

  const filteredRecords = filter === 'All' ? records : records.filter((r) => r.type === filter);

  // Compute stats from real database exchange
  const stats = {
    total: records.length,
    running: records.filter((r) => r.status === 'running').length,
    done: records.filter((r) => r.status === 'done').length,
    error: records.filter((r) => r.status === 'error').length,
  };

  const KPIS = [
    { label: 'Total Tasks', value: stats.total, color: '#06b6d4' },
    { label: 'Active Running', value: stats.running, color: '#1E88D9' },
    { label: 'Completed', value: stats.done, color: '#34D399' },
    { label: 'Failures / Errors', value: stats.error, color: '#E63946' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Dynamic Scraper Activity Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPIS.map((k, i) => (
          <div
            key={i}
            className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
            style={{ borderTop: `2px solid ${k.color}` }}
          >
            <div className="text-xl font-mono font-bold text-white select-all">{k.value}</div>
            <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider select-none mt-2">
              {k.label}
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel: Send Admin Signal */}
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
          🎛️ Disconnect &amp; Control Plane (Admin Signals)
        </h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="Target Agent ID (optional)"
            className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 w-full md:w-48 font-mono"
          />
          <input
            type="text"
            value={signalPayload}
            onChange={(e) => setSignalPayload(e.target.value)}
            placeholder="Action (e.g. start_closer, sync_listings, ingest_property_finder)"
            className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleSendSignal()}
          />
          <button
            onClick={handleSendSignal}
            disabled={sending || !signalPayload.trim()}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg disabled:opacity-40 transition cursor-pointer active:scale-95 duration-100"
          >
            {sending ? 'Sending…' : 'Dispatch'}
          </button>
        </div>
        {lastSignalId && (
          <p className="text-emerald-400 text-[10px] font-mono select-all">✓ Signal sent successfully — ID: {lastSignalId}</p>
        )}
      </div>

      {/* Filter Chips Toolbar */}
      <div className="flex gap-2.5 items-center flex-wrap">
        <span className="font-mono text-[9px] uppercase tracking-wide text-slate-500 select-none">
          Filter telemetry feed:
        </span>
        {['All', 'agent_task', 'workflow_run', 'admin_signal', 'crm_event'].map((c) => {
          const isSelected = filter === c;
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 text-[10px] font-medium font-mono rounded-lg transition duration-150 border cursor-pointer select-none ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-[#0a0f1d] hover:bg-white/5 border-slate-800 text-slate-400'
              }`}
            >
              {c.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Feeds scroll */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
              📥 Active Exchange Telemetry
            </span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold animate-pulse">
              ● REAL-TIME MONITOR ACTIVE
            </span>
          </div>
          <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-800/40">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-mono select-none">
                No active exchange records found in telemetry store.
              </div>
            ) : (
              filteredRecords.map((record) => {
                const isExpanded = expandedId === record.id;
                const ts = record.createdAt?.toDate?.()?.toLocaleTimeString() ?? '—';
                return (
                  <div
                    key={record.id}
                    className="p-4 hover:bg-white/2 transition duration-200 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  >
                    <div className="flex justify-between font-mono text-[9px] text-slate-400 mb-2 leading-none select-none">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">#{record.id.slice(0, 8)}</span>
                        <TypeBadge type={record.type} />
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={record.status} />
                        <span>{ts}</span>
                      </div>
                    </div>
                    
                    {record.stepName && (
                      <p className="text-xs text-slate-200 leading-relaxed font-sans font-semibold mb-1">
                        {record.stepName}
                      </p>
                    )}

                    {record.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                          <span>Task Progress</span>
                          <span>{record.progress}%</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                          <div
                            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                            style={{ width: `${record.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="mt-3 p-3 bg-slate-950/60 border border-slate-850 rounded text-[11px] font-mono text-slate-400 overflow-auto max-h-48 selection:bg-cyan-500/20">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(
                            {
                              payload: record.payload,
                              result: record.result,
                              error: record.error,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live parse analysis */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
              📊 Task Ingestion Ratios
            </span>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'Completed Tasks', val: stats.total ? Math.round((stats.done / stats.total) * 100) : 0, color: '#34D399' },
              { label: 'Failed / Terminated', val: stats.total ? Math.round((stats.error / stats.total) * 100) : 0, color: '#E63946' },
              { label: 'Active Telemetry Runs', val: stats.total ? Math.round((stats.running / stats.total) * 100) : 0, color: '#1E88D9' },
            ].map((col, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono select-none">
                  <span className="text-slate-400 hover:text-white transition duration-150">{col.label}</span>
                  <span className="font-bold text-white">{col.val}%</span>
                </div>
                <div className="bg-white/5 rounded-full h-[3px] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${col.val}%`, backgroundColor: col.color }}
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
