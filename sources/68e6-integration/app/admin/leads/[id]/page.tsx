'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import { COLLECTIONS } from '@/lib/models/schema';

interface LeadDetail {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  budget?: number;
  propertyTypePreference?: string[];
  stage?: string;
  createdAt?: string;
  notes?: string;
}

export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLead = async () => {
      try {
        const docRef = doc(db, COLLECTIONS.investmentStakeholders, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setLead({ id: docSnap.id, ...docSnap.data() } as LeadDetail);
        }
      } catch (err) {
        console.error('Lead load error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadLead();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#C9A24A] text-2xl animate-spin mb-4">⟳</div>
          <p className="text-[#3a5570]">Loading lead profile...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#3a5570] text-lg mb-4">Lead not found</p>
          <Link href="/admin" className="text-[#C9A24A] font-semibold hover:underline">
            ← Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/admin"
          className="flex items-center gap-2 text-[#C9A24A] font-semibold mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft size={20} />
          Back to Strategic Pipeline
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2">{lead.fullName || 'Unknown'}</h1>
          <p className="text-[#3a5570]/60">Investment Stakeholder Profile</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h2 className="text-lg font-bold text-[#071422] mb-6">Contact Information</h2>
              <div className="space-y-4">
                {lead.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-[#C9A24A]" />
                    <div>
                      <p className="text-xs text-[#3a5570]/60 font-semibold">EMAIL</p>
                      <p className="text-[#071422] font-semibold">{lead.email}</p>
                    </div>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-[#C9A24A]" />
                    <div>
                      <p className="text-xs text-[#3a5570]/60 font-semibold">PHONE</p>
                      <p className="text-[#071422] font-semibold">{lead.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#071422] mb-6">Investment Profile</h2>
              <div className="space-y-4">
                {lead.budget && (
                  <div className="flex items-center gap-3">
                    <DollarSign size={20} className="text-green-600" />
                    <div>
                      <p className="text-xs text-[#3a5570]/60 font-semibold">BUDGET</p>
                      <p className="text-[#071422] font-semibold">EGP {(lead.budget / 1_000_000).toFixed(1)}M</p>
                    </div>
                  </div>
                )}
                {lead.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-blue-600" />
                    <div>
                      <p className="text-xs text-[#3a5570]/60 font-semibold">JOINED</p>
                      <p className="text-[#071422] font-semibold">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {lead.propertyTypePreference && lead.propertyTypePreference.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h2 className="text-lg font-bold text-[#071422] mb-4">Property Preferences</h2>
              <div className="flex flex-wrap gap-2">
                {lead.propertyTypePreference.map((type) => (
                  <span
                    key={type}
                    className="px-4 py-2 bg-[#C9A24A]/10 text-[#C9A24A] rounded-lg font-semibold text-sm uppercase tracking-widest"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {lead.notes && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h2 className="text-lg font-bold text-[#071422] mb-4">Notes</h2>
              <p className="text-[#3a5570] leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
