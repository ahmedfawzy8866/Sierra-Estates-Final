import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, getDocs, limit, startAfter } from 'firebase/firestore';
import { api } from '../lib/apiClient';
import {
  Phone, MessageSquare, Search, Plus, Eye, Pause, CheckCircle,
  Clock, Send, X, RefreshCw, Loader2
} from 'lucide-react';

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

type NegotiationStatus = 'active' | 'paused' | 'completed';

interface Negotiation {
  id: string;
  ownerName: string;
  phone: string;
  propertyReference: string;
  status: NegotiationStatus;
  lastMessagePreview: string;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  direction: 'sent' | 'received';
  body: string;
  timestamp: string;
}

/* ──────────────────────────────────────────────
   Status helpers
   ────────────────────────────────────────────── */

const STATUS_CFG: Record<NegotiationStatus, { label: string; color: string; bg: string; border: string }> = {
  active:    { label: 'Active',    color: 'text-emerald-400', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20' },
  paused:    { label: 'Paused',    color: 'text-amber-400',   bg: 'bg-amber-500/10',    border: 'border-amber-500/20' },
  completed: { label: 'Completed', color: 'text-cyan-400',    bg: 'bg-cyan-500/10',     border: 'border-cyan-500/20' },
};

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

export default function OwnerNegotiationsPage() {
  /* ── Negotiation list state ── */
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<NegotiationStatus | 'all'>('all');

  /* ── New negotiation modal ── */
  const [showNewModal, setShowNewModal] = useState(false);
  const [formPhone, setFormPhone] = useState('');
  const [formOwnerName, setFormOwnerName] = useState('');
  const [formPropertyRef, setFormPropertyRef] = useState('');
  const [formInitialMsg, setFormInitialMsg] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /* ── Thread view ── */
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ── Action loading states ── */
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* ──────────────────────────────────────────
     Fetch negotiations (real-time via onSnapshot)
     ────────────────────────────────────────── */

  useEffect(() => {
    setLoading(true);
    setError(null);

    const negotiationsRef = collection(db, 'owner_negotiations');
    const q = query(negotiationsRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Negotiation[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ownerName: data.ownerName || '',
            phone: data.phone || '',
            propertyReference: data.propertyReference || '',
            status: data.status || 'active',
            lastMessagePreview: data.lastMessagePreview || '',
            lastActivityAt: data.lastActivityAt || data.updatedAt || null,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
        });
        setNegotiations(items);
        setLoading(false);
      },
      (err) => {
        console.error('Owner negotiations snapshot error:', err);
        setError('Failed to load negotiations. Check Firestore permissions.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* ──────────────────────────────────────────
     Load messages for selected negotiation
     ────────────────────────────────────────── */

  useEffect(() => {
    if (!selectedNegotiation) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    const messagesRef = collection(db, 'owner_negotiations', selectedNegotiation.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            direction: data.direction || 'received',
            body: data.body || '',
            timestamp: data.timestamp?.toDate?.()?.toISOString?.() || data.timestamp || new Date().toISOString(),
          };
        });
        setMessages(msgs);
        setMessagesLoading(false);
      },
      (err) => {
        console.error('Messages snapshot error:', err);
        setMessagesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedNegotiation]);

  /* ── Auto-scroll to bottom on new messages ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ──────────────────────────────────────────
     Filtered negotiations
     ────────────────────────────────────────── */

  const filteredNegotiations = negotiations.filter((n) => {
    if (statusFilter !== 'all' && n.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.ownerName.toLowerCase().includes(q) ||
      n.phone.toLowerCase().includes(q) ||
      n.propertyReference.toLowerCase().includes(q)
    );
  });

  /* ──────────────────────────────────────────
     Create new negotiation
     ────────────────────────────────────────── */

  const handleCreateNegotiation = async () => {
    if (!formPhone.trim()) {
      setFormError('Phone number is required.');
      return;
    }
    setFormSubmitting(true);
    setFormError(null);

    try {
      await api.post('/api/admin/owner-negotiations', {
        ownerName: formOwnerName.trim(),
        phone: formPhone.trim(),
        propertyReference: formPropertyRef.trim(),
        initialMessage: formInitialMsg.trim(),
      });
      setShowNewModal(false);
      setFormPhone('');
      setFormOwnerName('');
      setFormPropertyRef('');
      setFormInitialMsg('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create negotiation.');
    } finally {
      setFormSubmitting(false);
    }
  };

  /* ──────────────────────────────────────────
     Send message in thread
     ────────────────────────────────────────── */

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedNegotiation) return;
    setSendingMessage(true);

    try {
      const messagesRef = collection(db, 'owner_negotiations', selectedNegotiation.id, 'messages');
      await addDoc(messagesRef, {
        direction: 'sent',
        body: newMessage.trim(),
        timestamp: new Date(),
      });

      // Update last message preview and activity on the parent doc
      const negotiationRef = doc(db, 'owner_negotiations', selectedNegotiation.id);
      await updateDoc(negotiationRef, {
        lastMessagePreview: newMessage.trim().slice(0, 80),
        lastActivityAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  /* ──────────────────────────────────────────
     Status change actions
     ────────────────────────────────────────── */

  const handleStatusChange = async (negotiation: Negotiation, newStatus: NegotiationStatus) => {
    setActionLoading(negotiation.id);
    try {
      const ref = doc(db, 'owner_negotiations', negotiation.id);
      await updateDoc(ref, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  /* ──────────────────────────────────────────
     Helpers
     ────────────────────────────────────────── */

  const formatTimestamp = (ts: string | null): string => {
    if (!ts) return '—';
    try {
      const date = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  };

  const formatMessageTime = (ts: string): string => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  /* ──────────────────────────────────────────
     Render
     ────────────────────────────────────────── */

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ═══════════════════════════════════════
          HEADER
          ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" strokeWidth={1.75} />
            Owner Negotiations
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-1">
            WhatsApp negotiation threads with property owners
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              // onSnapshot auto-refreshes; this just triggers loading state briefly
              setTimeout(() => setLoading(false), 800);
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 h-8 bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-md text-[12px] font-mono transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            Refresh
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 h-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-md text-[12px] font-bold transition shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            New Negotiation
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          STATS ROW
          ═══════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-4">
        {(['active', 'paused', 'completed'] as NegotiationStatus[]).map((s) => {
          const cfg = STATUS_CFG[s];
          const count = negotiations.filter((n) => n.status === s).length;
          return (
            <div
              key={s}
              className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
              style={{ borderTop: `2px solid ${s === 'active' ? '#34d399' : s === 'paused' ? '#fbbf24' : '#22d3ee'}` }}
            >
              <div className="text-xl font-mono font-bold text-white">{count}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-2">{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════
          SEARCH + FILTER BAR
          ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={1.75} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or property ref…"
            className="w-full bg-[#0a0f1d] border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap items-center">
          {(['all', 'active', 'paused', 'completed'] as const).map((s) => {
            const isSelected = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-[11px] font-mono rounded border transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : 'bg-[#0a0f1d] text-slate-400 border-slate-800 hover:bg-white/5'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_CFG[s].label}
                <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full text-white/40">
                  {s === 'all' ? negotiations.length : negotiations.filter((n) => n.status === s).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          ERROR BANNER
          ═══════════════════════════════════════ */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-[13px] text-red-400">{error}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MAIN CONTENT: LIST + THREAD SIDE-BY-SIDE
          ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[500px]">
        {/* ─── Negotiations List (left 3 cols) ─── */}
        <div className="lg:col-span-3 bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.75} />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Negotiation Threads
            </span>
            <span className="ml-auto font-mono text-[10px] text-slate-600">
              {filteredNegotiations.length} result{filteredNegotiations.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="p-16 text-center">
                <Loader2 className="animate-spin mx-auto mb-3 text-cyan-400" size={24} strokeWidth={1.75} />
                <p className="text-[13px] text-slate-500">Loading negotiations…</p>
              </div>
            ) : filteredNegotiations.length === 0 ? (
              <div className="p-16 text-center">
                <MessageSquare className="mx-auto mb-3 text-slate-700" size={36} strokeWidth={1.25} />
                <p className="text-[13px] text-slate-500">
                  {searchQuery ? 'No negotiations match your search.' : 'No negotiation threads yet.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {filteredNegotiations.map((n) => {
                  const cfg = STATUS_CFG[n.status];
                  const isSelected = selectedNegotiation?.id === n.id;
                  return (
                    <div
                      key={n.id}
                      onClick={() => setSelectedNegotiation(n)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500'
                          : 'hover:bg-slate-800/30 border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                            {n.ownerName ? n.ownerName[0].toUpperCase() : n.phone.slice(-2)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-white truncate">
                              {n.ownerName || 'Unknown Owner'}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate flex items-center gap-1.5">
                              <Phone className="w-2.5 h-2.5" strokeWidth={2} />
                              {n.phone}
                            </div>
                          </div>
                        </div>

                        <span className={`shrink-0 text-[9px] font-mono px-2 py-0.5 rounded-full uppercase ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Property reference */}
                      <div className="mt-2 text-[11px] text-slate-400 font-mono truncate pl-12">
                        {n.propertyReference || '—'}
                      </div>

                      {/* Last message preview + timestamp */}
                      <div className="mt-1.5 flex items-start gap-2 pl-12">
                        <p className="text-[12px] text-slate-500 truncate flex-1">
                          {n.lastMessagePreview || 'No messages yet'}
                        </p>
                        <span className="shrink-0 text-[10px] text-slate-600 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" strokeWidth={2} />
                          {formatTimestamp(n.lastActivityAt)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-2.5 flex items-center gap-1.5 pl-12">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNegotiation(n);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded border border-slate-800 bg-slate-950/80 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition"
                          title="View thread"
                        >
                          <Eye className="w-3 h-3" strokeWidth={1.75} />
                          View
                        </button>
                        {n.status === 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(n, 'paused');
                            }}
                            disabled={actionLoading === n.id}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded border border-slate-800 bg-slate-950/80 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition disabled:opacity-50"
                            title="Pause negotiation"
                          >
                            {actionLoading === n.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
                            ) : (
                              <Pause className="w-3 h-3" strokeWidth={1.75} />
                            )}
                            Pause
                          </button>
                        )}
                        {n.status !== 'completed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(n, 'completed');
                            }}
                            disabled={actionLoading === n.id}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded border border-slate-800 bg-slate-950/80 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition disabled:opacity-50"
                            title="Complete negotiation"
                          >
                            {actionLoading === n.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
                            ) : (
                              <CheckCircle className="w-3 h-3" strokeWidth={1.75} />
                            )}
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Thread View (right 2 cols) ─── */}
        <div className="lg:col-span-2 bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          {selectedNegotiation ? (
            <>
              {/* Thread header */}
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${STATUS_CFG[selectedNegotiation.status].bg} ${STATUS_CFG[selectedNegotiation.status].color} ${STATUS_CFG[selectedNegotiation.status].border} border`}>
                  {selectedNegotiation.ownerName ? selectedNegotiation.ownerName[0].toUpperCase() : selectedNegotiation.phone.slice(-2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-white truncate">
                    {selectedNegotiation.ownerName || 'Unknown Owner'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" strokeWidth={2} />
                      {selectedNegotiation.phone}
                    </span>
                    <span className="text-slate-700">·</span>
                    <span>{selectedNegotiation.propertyReference || '—'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNegotiation(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 hover:text-white transition"
                >
                  <X className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[440px] min-h-[300px]">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="animate-spin text-cyan-400" size={20} strokeWidth={1.75} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600">
                    <MessageSquare className="mb-2" size={28} strokeWidth={1.25} />
                    <p className="text-[12px]">No messages in this thread yet.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSent = msg.direction === 'sent';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-3.5 py-2.5 ${
                            isSent
                              ? 'bg-cyan-500/15 border border-cyan-500/20 rounded-br-sm'
                              : 'bg-slate-800/60 border border-slate-700/40 rounded-bl-sm'
                          }`}
                        >
                          <p className={`text-[13px] leading-relaxed ${isSent ? 'text-cyan-50' : 'text-slate-300'}`}>
                            {msg.body}
                          </p>
                          <p className={`text-[9px] font-mono mt-1 ${isSent ? 'text-cyan-400/50 text-right' : 'text-slate-500'}`}>
                            {formatMessageTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-3 border-t border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message…"
                    disabled={sendingMessage || selectedNegotiation.status === 'completed'}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim() || selectedNegotiation.status === 'completed'}
                    className="flex items-center justify-center w-9 h-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    ) : (
                      <Send className="w-4 h-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
                {selectedNegotiation.status === 'completed' && (
                  <p className="text-[10px] text-slate-600 mt-1.5 font-mono">
                    This negotiation is completed. Messages are read-only.
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-slate-600 p-8">
              <MessageSquare className="mb-3" size={40} strokeWidth={1.0} />
              <p className="text-[13px] text-slate-500 text-center">
                Select a negotiation thread to view messages
              </p>
              <p className="text-[11px] text-slate-600 mt-1 text-center font-mono">
                Click on any thread from the list to open the conversation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          NEW NEGOTIATION MODAL
          ═══════════════════════════════════════ */}
      {showNewModal && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="bg-[#0a0f1d] border border-slate-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" strokeWidth={1.75} />
                Initiate New Negotiation
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-[12px] text-red-400">{formError}</p>
                </div>
              )}

              {/* Phone (required) */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+20 100 123 4567"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-md pl-10 pr-3 py-2.5 text-[13px] text-white font-mono placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition"
                  />
                </div>
              </div>

              {/* Owner name */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={formOwnerName}
                  onChange={(e) => setFormOwnerName(e.target.value)}
                  placeholder="e.g. Ahmed Al-Rashid"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-3 py-2.5 text-[13px] text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition"
                />
              </div>

              {/* Property reference */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                  Property Reference
                </label>
                <input
                  type="text"
                  value={formPropertyRef}
                  onChange={(e) => setFormPropertyRef(e.target.value)}
                  placeholder="e.g. SE-MVD-APT-0041-2026"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-3 py-2.5 text-[13px] text-white font-mono placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition"
                />
              </div>

              {/* Initial message */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                  Initial Message
                </label>
                <textarea
                  value={formInitialMsg}
                  onChange={(e) => setFormInitialMsg(e.target.value)}
                  rows={3}
                  placeholder="Dear owner, we would like to discuss…"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-md px-3 py-2.5 text-[13px] text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-slate-800 bg-slate-950/50">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 h-8 text-slate-400 hover:text-white text-[12px] font-mono transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNegotiation}
                disabled={formSubmitting || !formPhone.trim()}
                className="flex items-center gap-1.5 px-4 h-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-md text-[12px] font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {formSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                ) : (
                  <Send className="w-3.5 h-3.5" strokeWidth={2} />
                )}
                Start Negotiation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
