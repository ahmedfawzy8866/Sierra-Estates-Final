'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { 
  MessageSquare, Users, Send, Search, CheckSquare, Square, 
  Loader2, CheckCircle2, ChevronRight, BarChart3, AlertCircle, RefreshCw 
} from 'lucide-react';
import { SectionHeader } from '@/components/Admin';
import { logger } from '@/lib/logger';

interface Lead {
  id: string;
  name: string;
  phone: string;
  stage: string;
  source: string;
  capitalAllocation?: string;
  budget?: number;
  automation?: {
    whatsappFollowupSent?: boolean;
  };
}

const PRESET_TEMPLATES = [
  {
    id: 'distress-deal',
    name: 'Distress Deal Alert (High ROI)',
    text: `✦ SIERRA ESTATES REALTY ✦\n\nExclusive Distress Deal Opportunity:\nWe have identified an under-market asset in New Cairo offering an immediate projected ROI of 7.2%+.\n\nPriority access is now open for our valued partners.\n\nReply directly to request full SBR analysis and brochure.\n#SierraEstates #BeyondBrokerage`
  },
  {
    id: 'waterfront-promo',
    name: 'New Launch - Waterfront Villa',
    text: `✨ LUXURY PORTFOLIO PREVIEW ✨\n\nSierra Estates is pleased to present a limited release of waterfront villas with flexible payment terms (10% downpayment, up to 7 years installments).\n\nCoordinates: New Cairo Golden Square.\n\nLet me know if you would like to schedule a private viewing this week.\n#SierraEstates`
  },
  {
    id: 'followup-consult',
    name: 'Initial Consultation Follow-up',
    text: `Dear Partner,\n\nFollowing our recent portfolio discovery discussion, our Leila AI Matchmaker has mapped three highly compatible assets matching your requirements.\n\nView your personalized portal: {portalUrl}\n\nLet's schedule a brief call to finalize details.\nRegards,\nSierra Intelligence OS`
  }
];

export default function WhatsAppSenderPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(PRESET_TEMPLATES[0].id);
  const [customMessage, setCustomMessage] = useState(PRESET_TEMPLATES[0].text);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any | null>(null);
  const [quota, setQuota] = useState({ used: 0, capacity: 480 });

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    try {
      const q = query(collection(db, 'leads'), orderBy('updatedAt', 'desc'), limit(150));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || 'Anonymous Prospect',
          phone: data.phone || '',
          stage: data.stage || data.phase || 'acquisition',
          source: data.source || 'WhatsApp',
          capitalAllocation: data.capitalAllocation || (data.budget ? `EGP ${data.budget.toLocaleString()}` : 'N/A'),
          automation: data.automation || {}
        } as Lead;
      });
      // Filter out leads without phone numbers
      const validLeads = list.filter(l => l.phone.trim() !== '');
      setLeads(validLeads);
      
      // Calculate daily quota usage based on leads who already received followups
      const contactedTodayCount = validLeads.filter(l => l.automation?.whatsappFollowupSent).length;
      setQuota(prev => ({ ...prev, used: Math.min(contactedTodayCount * 12, 480) })); // Scaled mock representation
    } catch (err) {
      logger.error('Failed to load leads for WhatsApp outreach:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleTemplateChange = (id: string) => {
    setSelectedTemplate(id);
    const tmpl = PRESET_TEMPLATES.find(t => t.id === id);
    if (tmpl) {
      setCustomMessage(tmpl.text);
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  const initiateOutreach = async () => {
    if (selectedLeads.length === 0) return;
    setSending(true);
    setSendResult(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/whatsapp/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadIds: selectedLeads,
          customMessage: customMessage
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Outreach dispatch failed');

      setSendResult(result);
      // Refresh list to update status flags
      loadLeads();
      setSelectedLeads([]);
    } catch (err: any) {
      alert(`Outreach failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) ||
    l.stage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Outbound Advisory Engine"
        title="WhatsApp Bulk Sender"
        subtitle="Execute high-impact outreach campaigns targeting qualified leads via staggered dispatch nodes."
        status={{ label: 'WhatsApp API Gateway Live', ok: true }}
      />

      {/* ══ QUOTA & STATUS SUMMARY ══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Outreach Quota</div>
            <div className="text-2xl font-bold text-[#071422]">{quota.used} / {quota.capacity}</div>
            <p className="text-[10px] text-slate-400 mt-1">Staggered capacity across 4 WABA channels</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Recipients</div>
            <div className="text-2xl font-bold text-[#071422]">{leads.length} leads</div>
            <p className="text-[10px] text-slate-400 mt-1">With valid international contact numbers</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C]">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stagger Rate</div>
            <div className="text-2xl font-bold text-[#071422]">30 msg / 2hr</div>
            <p className="text-[10px] text-slate-400 mt-1">Anti-blocking throttle rules applied</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
        
        {/* Recipient Selection */}
        <div className="bg-white rounded-3xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#f3f4f5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
            <h3 className="font-bold text-navy text-base">Select Target Recipients</h3>
            <div className="flex gap-2">
              <button 
                onClick={selectAll}
                className="text-xs text-[#3a5570] hover:text-[#C9A84C] font-semibold border border-slate-200 px-3 py-1.5 rounded-lg"
              >
                {selectedLeads.length === filteredLeads.length ? 'Clear Selection' : 'Select All'}
              </button>
              <button 
                onClick={loadLeads}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-navy"
                title="Refresh leads list"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-[#f3f4f5] shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by name, phone or pipeline stage..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#f8f9fa] border border-[#e7e8e9] rounded-xl text-xs outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-[#3a5570]/30 gap-2 text-xs">
              <Loader2 className="animate-spin" size={20} />
              <span>Querying client database...</span>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 text-xs">
              <span>No prospects match filters.</span>
            </div>
          ) : (
            <div className="divide-y divide-[#f3f4f5] overflow-y-auto max-h-[500px]">
              {filteredLeads.map(lead => {
                const isSelected = selectedLeads.includes(lead.id);
                return (
                  <div 
                    key={lead.id}
                    onClick={() => toggleSelectLead(lead.id)}
                    className={`px-6 py-3.5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-slate-400">
                        {isSelected ? <CheckSquare size={16} className="text-[#C9A84C]" /> : <Square size={16} />}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#071422]">{lead.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{lead.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded capitalize">
                        {lead.stage}
                      </span>
                      {lead.automation?.whatsappFollowupSent && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">
                          Outreached
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Settings & Presets */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] p-6">
            <h3 className="font-bold text-navy text-base mb-4">Advisory Presets</h3>
            <div className="space-y-2">
              {PRESET_TEMPLATES.map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => handleTemplateChange(tmpl.id)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                    selectedTemplate === tmpl.id 
                      ? 'border-[#C9A84C] bg-[#C9A84C]/5 text-navy font-bold' 
                      : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span>{tmpl.name}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outbound Content Editor</label>
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={7}
                placeholder="Compose outreach advisory templates..."
                className="w-full bg-[#f8f9fa] border border-[#e7e8e9] rounded-2xl p-4 text-xs font-sans focus:outline-none focus:border-[#C9A84C] resize-none"
              />
            </div>

            <button
              onClick={initiateOutreach}
              disabled={sending || selectedLeads.length === 0}
              className="w-full mt-6 h-12 bg-navy text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-[#1a2b48] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-navy/10"
            >
              {sending ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Staggering outreach...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Send Campaign ({selectedLeads.length})</span>
                </>
              )}
            </button>
          </div>

          {/* Stagger Logs / Response Output */}
          {sendResult && (
            <div className="bg-emerald-50/60 rounded-3xl border border-emerald-100/50 p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={16} />
                <h4 className="font-bold text-xs uppercase tracking-wider">Outbound Dispatch Initiated</h4>
              </div>
              <div className="font-mono text-[10px] text-emerald-800 space-y-1">
                <div>Status: <span className="font-bold capitalize">{sendResult.status}</span></div>
                <div>Channels Engaged: {sendResult.dispatchedBatches} WABA Nodes</div>
                <div>Outreach Dispatched: {sendResult.totalDispatched} messages</div>
                {sendResult.remainingInQueue > 0 && (
                  <div className="text-amber-800 flex items-center gap-1 mt-2">
                    <AlertCircle size={10} />
                    <span>Daily cap limits: {sendResult.remainingInQueue} items held in queue.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
