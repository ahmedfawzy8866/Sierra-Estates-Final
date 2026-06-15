'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Bot, Calendar, Check, AlertCircle, RefreshCw, Handshake } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { SectionHeader, StatusBadge, EmptyState } from '@/components/Admin';
import { logger } from '@/lib/logger';

interface MatchedUnit {
  id: string;
  title: string;
  price: number;
  projectedRoi?: number;
  matchScore: number;
  approved: boolean;
}

interface Lead {
  id: string;
  name: string;
  budget: number;
  location: string;
  propertyType: string;
  roiTarget?: number;
  status: string;
  stage: number;
  matchedUnits: MatchedUnit[];
  email?: string;
  phone?: string;
}

const DEMO_LEAD: Lead = {
  id: 'mock-lead-id',
  name: 'Michael Chen',
  budget: 8_500_000,
  location: 'New Cairo — Fifth Settlement',
  propertyType: 'Penthouse',
  roiTarget: 6.5,
  status: 'Requires Agent Approval',
  stage: 2,
  matchedUnits: [
    { id: 'U-01', title: 'Skyline Penthouse A', price: 8_200_000, projectedRoi: 6.8, matchScore: 95, approved: false },
    { id: 'U-02', title: 'Luxury Loft B',       price: 7_900_000, projectedRoi: 7.1, matchScore: 88, approved: false },
  ],
  email: 'michael.chen@example.com',
  phone: '+201092048333',
};

export default function AdminLeadsPage() {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const snap = await getDocs(
        query(collection(db, 'leads'), where('stage', '==', 2))
      );
      const fetched = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name:         data.name         ?? 'Anonymous Client',
          budget:       data.budget       ?? 0,
          location:     data.location     ?? 'Unspecified',
          propertyType: data.propertyType ?? 'Any',
          roiTarget:    data.roiTarget,
          status:       data.status       ?? 'Requires Agent Approval',
          stage:        data.stage        ?? 2,
          matchedUnits: ((data.matchedUnits ?? []) as MatchedUnit[]).map((u) => ({
            ...u,
            approved: false,
          })),
          email: data.email,
          phone: data.phone,
        } satisfies Lead;
      });

      setLeads(fetched.length > 0 ? fetched : [DEMO_LEAD]);
    } catch (err) {
      logger.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const toggleApproval = (leadId: string, unitId: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id !== leadId ? l : {
          ...l,
          matchedUnits: l.matchedUnits.map((u) =>
            u.id === unitId ? { ...u, approved: !u.approved } : u
          ),
        }
      )
    );
  };

  const scheduleViewing = async (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const approved = lead.matchedUnits.filter((u) => u.approved);
    if (approved.length === 0) {
      alert('Please approve at least one unit before scheduling.');
      return;
    }

    try {
      const res  = await fetch('/api/admin/schedule-viewing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, units: approved }),
      });
      const data = await res.json() as { success: boolean; error?: string };

      if (data.success) {
        if (leadId !== 'mock-lead-id') {
          await updateDoc(doc(db, 'leads', leadId), {
            stage: 3,
            status: 'Scheduled',
            updatedAt: serverTimestamp(),
          });
        }
        setLeads((prev) =>
          prev.map((l) => l.id === leadId ? { ...l, stage: 3, status: 'Scheduled' } : l)
        );
      } else {
        alert(`Failed to schedule: ${data.error ?? 'Unknown error'}`);
      }
    } catch (e) {
      alert(`Error scheduling viewing: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleRefresh = () => { setRefreshing(true); fetchLeads(); };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Leila AI Engine"
        title="Lead Handoff Queue"
        subtitle="Review units matched by Leila AI and approve them for client viewing."
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#3a5570]">
          <RefreshCw className="h-7 w-7 animate-spin" />
          <span className="text-sm">Loading queue…</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)]">
          <EmptyState
            icon={Handshake}
            title="No leads in approval queue"
            description="Leads will appear here once matched by Leila."
          />
        </div>
      ) : (
        <div className="grid gap-5">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-2xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden"
            >
              {/* Lead header */}
              <div className="px-6 sm:px-8 py-6 border-b border-[#f3f4f5] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-[#071422] font-display">{lead.name}</h3>
                    <StatusBadge status={lead.stage === 3 ? 'active' : 'pending'} label={`Stage ${lead.stage}`} />
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest border bg-[#C9A84C]/8 text-[#8a6a20] border-[#C9A84C]/25">
                      <Bot size={11} />
                      {lead.status}
                    </span>
                  </div>
                  <dl className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-[#3a5570]/60">
                    <div><span className="font-semibold text-[#071422]">EGP {lead.budget.toLocaleString()}</span> budget</div>
                    <div><span className="font-semibold text-[#071422]">{lead.propertyType}</span> · {lead.location}</div>
                    {lead.roiTarget && <div>ROI target <span className="font-semibold text-emerald-600">{lead.roiTarget}%+</span></div>}
                    {lead.email && (
                      <div>
                        <a href={`mailto:${lead.email}`} className="font-semibold text-[#1E88D9] hover:underline">{lead.email}</a>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Matched units */}
              <div className="px-6 sm:px-8 py-6 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#3a5570]/40 font-mono">
                  Leila's Matched Properties
                </p>

                {lead.matchedUnits.length === 0 ? (
                  <div className="flex items-center gap-2.5 text-amber-700 bg-amber-50 border border-amber-100 px-4 py-3 rounded-xl text-sm font-semibold">
                    <AlertCircle size={16} className="shrink-0" />
                    No property matches generated yet.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {lead.matchedUnits.map((unit) => (
                      <div
                        key={unit.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border border-[#f3f4f5] rounded-xl hover:border-[#e7e8e9] transition-colors"
                      >
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="font-bold text-[13px] text-[#071422]">{unit.title}</div>
                          <div className="flex flex-wrap gap-4 text-[12px] text-[#3a5570]/60">
                            <span>Price <strong className="text-[#031632] font-mono">EGP {unit.price.toLocaleString()}</strong></span>
                            {unit.projectedRoi && (
                              <span>ROI <strong className="text-emerald-600">{unit.projectedRoi}%</strong></span>
                            )}
                          </div>
                          {/* Match score bar */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#3a5570]/40 font-mono">AI Match</span>
                                <span className="text-[11px] font-bold font-mono text-[#C9A84C]">{unit.matchScore}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-[#f3f4f5] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E9C176]"
                                  style={{ width: `${unit.matchScore}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {lead.stage === 2 && (
                          <button
                            onClick={() => toggleApproval(lead.id, unit.id)}
                            className={`w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              unit.approved
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-white border-[#e7e8e9] text-[#3a5570]/30 hover:border-[#C9A84C] hover:text-[#C9A84C]'
                            }`}
                            aria-label={unit.approved ? 'Revoke approval' : 'Approve unit'}
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {lead.stage === 2 && lead.matchedUnits.some((u) => u.approved) && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => scheduleViewing(lead.id)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm"
                    >
                      <Calendar size={15} />
                      Approve & Schedule Viewing
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
