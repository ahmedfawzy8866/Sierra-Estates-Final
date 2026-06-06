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
    <div className="p-8 max-w-7xl mx-auto space-y-8" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
            Lead Handoff Queue
          </h1>
          <p className="text-[#3a5570] mt-2 text-sm">
            Review units matched by Leila AI and approve them for client viewing.
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-[#3a5570]">
          <RefreshCw className="h-8 w-8 animate-spin mr-2" /> Loading queue...
        </div>
      ) : (
        <div className="grid gap-6">
          {leads.map(lead => (
            <div key={lead.id} className="bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] border border-[#f3f4f5] overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#f3f4f5] px-6 py-5 gap-4">
                <div>
                  <div className="text-lg font-bold text-[#071422] flex items-center gap-2 font-display">
                    {lead.name}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
                      Stage {lead.stage}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#3a5570]/70 mt-1">
                    Budget: EGP {lead.budget.toLocaleString()} • {lead.location} • {lead.propertyType} {lead.roiTarget ? `• ROI target: ${lead.roiTarget}%+` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    lead.status.includes('Scheduled')
                      ? 'bg-green-50 text-green-700'
                      : 'bg-[#C9A84C]/10 text-[#C9A84C]'
                  }`}>
                    <Bot className="h-3.5 w-3.5" />
                    {lead.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-xs text-[#3a5570]/60 uppercase tracking-widest mb-4">Leila's Curated Suggestions</h3>
                
                {lead.matchedUnits.length === 0 ? (
                  <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-4 rounded-xl text-sm font-semibold">
                    <AlertCircle className="h-5 w-5" /> No property matches generated yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lead.matchedUnits.map(unit => (
                      <div key={unit.id} className="flex items-center justify-between p-4 border border-[#f3f4f5] rounded-xl hover:bg-[#f8f9fa] transition">
                        <div>
                          <div className="font-bold text-sm text-[#071422]">{unit.title}</div>
                          <div className="text-xs font-semibold text-[#3a5570]/60 mt-0.5">
                            EGP {unit.price.toLocaleString()} {unit.projectedRoi ? `• Expected ROI: ${unit.projectedRoi}%` : ''} • AI Match Match: {unit.matchScore}%
                          </div>
                        </div>
                        {lead.stage === 2 && (
                          <button 
                            onClick={() => toggleApproval(lead.id, unit.id)}
                            className={`p-2 rounded-full border transition flex items-center justify-center ${
                              unit.approved 
                                ? 'bg-green-50 border-green-500 text-green-600' 
                                : 'bg-white border-gray-200 text-gray-400 hover:text-[#031632] hover:border-gray-300'
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {lead.stage === 2 && (
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={() => scheduleViewing(lead.id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm"
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
