'use client';

import React, { useEffect, useState } from 'react';
import { Bot, Calendar, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface Unit {
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
  matchedUnits: Unit[];
  email?: string;
  phone?: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeads = async () => {
    try {
      // Query leads in stage 2 or requires approval
      const q = query(
        collection(db, 'leads'),
        where('stage', '==', 2)
      );
      const snap = await getDocs(q);
      const fetched: Lead[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || 'Anonymous Client',
          budget: data.budget || 0,
          location: data.location || 'Anywhere',
          propertyType: data.propertyType || 'Any',
          roiTarget: data.roiTarget,
          status: data.status || 'Requires Agent Approval',
          stage: data.stage || 2,
          matchedUnits: (data.matchedUnits || []).map((u: any) => ({ ...u, approved: false })),
          email: data.email,
          phone: data.phone
        };
      });

      // Fallback lead for demonstration / testing if Firestore is empty
      if (fetched.length === 0) {
        fetched.push({
          id: 'mock-lead-id',
          name: 'Michael Chen',
          budget: 8500000,
          location: 'Downtown Hubtown',
          propertyType: 'Penthouse',
          roiTarget: 6.5,
          status: 'Requires Agent Approval (Demo Mode)',
          stage: 2,
          matchedUnits: [
            { id: 'U-01', title: 'Skyline Penthouse A', price: 8200000, projectedRoi: 6.8, matchScore: 95, approved: false },
            { id: 'U-02', title: 'Luxury Loft B', price: 7900000, projectedRoi: 7.1, matchScore: 88, approved: false }
          ],
          email: 'michael.chen@example.com',
          phone: '+201092048333'
        });
      }

      setLeads(fetched);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const toggleApproval = (leadId: string, unitId: string) => {
    setLeads(leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          matchedUnits: l.matchedUnits.map(u => 
            u.id === unitId ? { ...u, approved: !u.approved } : u
          )
        };
      }
      return l;
    }));
  };

  const scheduleViewing = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const approvedUnits = lead.matchedUnits.filter(u => u.approved);
    if (approvedUnits.length === 0) {
      alert("Please approve at least one unit before scheduling.");
      return;
    }

    try {
      const res = await fetch('/api/admin/schedule-viewing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, units: approvedUnits })
      });
      const data = await res.json();
      
      if (data.success) {
        // If not a mock lead, update Firestore
        if (leadId !== 'mock-lead-id') {
          await updateDoc(doc(db, 'leads', leadId), {
            stage: 3, // Stage 3: Viewing Scheduled / Active
            status: 'Scheduled',
            updatedAt: serverTimestamp()
          });
        }
        alert("Viewing scheduled successfully! Telegram and Google Calendar notifications sent.");
        setLeads(leads.map(l => l.id === leadId ? { ...l, stage: 3, status: 'Scheduled' } : l));
      } else {
        alert("Failed to schedule: " + data.error);
      }
    } catch (e: any) {
      alert("Error scheduling viewing: " + e.message);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'var(--font-body)' }}>
      {/* ══ Page Header ══ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-2">
            Leila AI Engine
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#071422]"
            style={{ fontFamily: 'var(--font-display)' }}>
            Lead Handoff Queue
          </h1>
          <p className="text-[#3a5570] text-sm mt-1">
            Review units matched by Leila AI and approve them for client viewing.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm disabled:opacity-50 w-fit"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-[#3a5570]">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="text-sm font-medium">Loading queue...</span>
          </div>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] p-12 text-center">
          <p className="text-[#3a5570]/50 text-sm">No leads in approval queue</p>
          <p className="text-[9px] text-[#3a5570]/30 mt-1 uppercase tracking-widest">Leads will appear here once matched by Leila.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {leads.map(lead => (
            <div key={lead.id} className="bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden hover:shadow-[0_8px_32px_-4px_rgba(3,22,50,0.1)] transition-shadow">
              {/* Header */}
              <div className="px-6 sm:px-8 py-6 border-b border-[#f3f4f5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
                      {lead.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        Stage {lead.stage}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        lead.status.includes('Scheduled')
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-[#C9A84C]/10 text-[#C9A84C]'
                      }`}>
                        <Bot className="h-3.5 w-3.5" />
                        {lead.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 text-xs font-semibold text-[#3a5570]/70">
                    <div>Budget: <span className="text-[#031632] font-bold">EGP {lead.budget.toLocaleString()}</span></div>
                    <div>Type: <span className="text-[#031632] font-bold">{lead.propertyType}</span></div>
                    <div>Location: <span className="text-[#031632] font-bold">{lead.location}</span></div>
                    {lead.roiTarget && <div>ROI Target: <span className="text-[#031632] font-bold">{lead.roiTarget}%+</span></div>}
                    {lead.email && <div className="col-span-2 sm:col-span-1">Email: <a href={`mailto:${lead.email}`} className="text-blue-600 font-bold underline">{lead.email}</a></div>}
                  </div>
                </div>
              </div>

              {/* Matched Units */}
              <div className="px-6 sm:px-8 py-6">
                <h4 className="font-bold text-xs text-[#3a5570]/60 uppercase tracking-widest mb-4">Leila's Matched Properties</h4>

                {lead.matchedUnits.length === 0 ? (
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-4 rounded-xl text-sm font-semibold">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>No property matches generated yet</span>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {lead.matchedUnits.map(unit => (
                      <div key={unit.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-[#f3f4f5] rounded-xl hover:bg-[#f8f9fa] transition">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-[#071422] mb-2">{unit.title}</div>
                          <div className="grid grid-cols-2 gap-3 text-xs text-[#3a5570]/70 font-semibold">
                            <div>Price: <span className="text-[#031632] font-bold font-mono">EGP {unit.price.toLocaleString()}</span></div>
                            {unit.projectedRoi && <div>Expected ROI: <span className="text-emerald-600 font-bold">{unit.projectedRoi}%</span></div>}
                          </div>
                          {/* Match Score Progress */}
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#3a5570]">AI Match</span>
                                <span className="text-[11px] font-bold text-[#C9A84C]">{unit.matchScore}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-[#f3f4f5] overflow-hidden">
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
                            className={`flex-shrink-0 p-3 rounded-full border transition flex items-center justify-center h-12 w-12 ${
                              unit.approved
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                : 'bg-white border-[#f3f4f5] text-[#3a5570]/40 hover:text-[#031632] hover:border-[#C9A84C]'
                            }`}
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {lead.stage === 2 && lead.matchedUnits.some(u => u.approved) && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => scheduleViewing(lead.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm"
                    >
                      <Calendar className="h-4 w-4" />
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
