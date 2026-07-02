'use client';

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, CheckCircle, Clock } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  source: string;
  createdAt: any;
  locale: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'leads'), (snap) => {
      const leadsData = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as Lead[];
      setLeads(leadsData.sort((a, b) => b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.() || 0));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: newStatus,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteDoc(doc(db, 'leads', leadId));
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const filteredLeads = filter === 'all'
    ? leads
    : leads.filter(l => l.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Leads Management</h1>
        <p className="text-[#C9A84C]/60">Manage and track all incoming leads</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4">
        {(['all', 'new', 'contacted'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === tab
                ? 'bg-[#C9A84C] text-[#071422]'
                : 'bg-[#0a1829] text-[#C9A84C] border border-[#C9A84C]/20 hover:border-[#C9A84C]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Leads Table */}
      <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#C9A84C]/60">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-[#C9A84C]/60">No leads found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f1f2e] border-b border-[#C9A84C]/20">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#C9A84C]">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#C9A84C]">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#C9A84C]">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#C9A84C]">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#C9A84C]">Source</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#C9A84C]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9A84C]/10">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-[#0f1f2e] transition">
                    <td className="px-6 py-4 text-white">{lead.name}</td>
                    <td className="px-6 py-4 text-[#C9A84C]/80">{lead.email}</td>
                    <td className="px-6 py-4 text-[#C9A84C]/80">{lead.phone}</td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="bg-[#071422] text-[#C9A84C] border border-[#C9A84C]/20 rounded px-3 py-1 text-sm"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-[#C9A84C]/60 text-sm">{lead.source}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-4">
          <p className="text-[#C9A84C]/60 text-sm">Total Leads</p>
          <p className="text-2xl font-bold text-white">{leads.length}</p>
        </div>
        <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-4">
          <p className="text-[#C9A84C]/60 text-sm">New</p>
          <p className="text-2xl font-bold text-white">{leads.filter(l => l.status === 'new').length}</p>
        </div>
        <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-4">
          <p className="text-[#C9A84C]/60 text-sm">Converted</p>
          <p className="text-2xl font-bold text-white">{leads.filter(l => l.status === 'converted').length}</p>
        </div>
      </div>
    </div>
  );
}
