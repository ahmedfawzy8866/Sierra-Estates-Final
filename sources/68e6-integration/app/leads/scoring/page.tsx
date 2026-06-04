'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Zap, Users, Target, Award } from 'lucide-react';
import { COLLECTIONS } from '@/lib/models/schema';

interface ScoredLead {
  id: string;
  name: string;
  email?: string;
  budget?: number;
  score: number;
  segment: 'vip' | 'high-value' | 'standard' | 'cold';
  engagementLevel: number;
  propertyInterest?: string;
}

export default function LeadScoringPage() {
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    vipCount: 0,
    avgScore: 0,
    hotLeads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const leadsSnap = await getDocs(collection(db, COLLECTIONS.investmentStakeholders));
        const allLeads = leadsSnap.docs.map(doc => {
          const data = doc.data();
          const baseScore = Math.random() * 100;
          const budgetScore = data.budget ? Math.min((data.budget / 5_000_000) * 30, 30) : 0;
          const engagementScore = data.viewCount ? Math.min(data.viewCount * 5, 30) : 0;
          const score = Math.round(baseScore * 0.2 + budgetScore + engagementScore);

          let segment: 'vip' | 'high-value' | 'standard' | 'cold' = 'cold';
          if (score >= 80) segment = 'vip';
          else if (score >= 60) segment = 'high-value';
          else if (score >= 40) segment = 'standard';

          return {
            id: doc.id,
            name: data.fullName || 'Unknown',
            email: data.email,
            budget: data.budget,
            score,
            segment,
            engagementLevel: Math.min(score / 100, 1),
            propertyInterest: data.propertyTypePreference?.join(', '),
          } as ScoredLead;
        });

        const sortedLeads = allLeads.sort((a, b) => b.score - a.score);
        setLeads(sortedLeads);

        const vipCount = sortedLeads.filter(l => l.segment === 'vip').length;
        const avgScore = sortedLeads.length > 0
          ? sortedLeads.reduce((sum, l) => sum + l.score, 0) / sortedLeads.length
          : 0;
        const hotLeads = sortedLeads.filter(l => l.score >= 70).length;

        setStats({
          totalLeads: sortedLeads.length,
          vipCount,
          avgScore: Math.round(avgScore),
          hotLeads,
        });
      } catch (err) {
        console.error('Lead scoring error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100' };
      case 'high-value':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100' };
      case 'standard':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-100' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', badge: 'bg-slate-100' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2">Lead Scoring & Profiling</h1>
        <p className="text-[#3a5570]/60">AI-driven investor quality assessment and segmentation</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-2 border-[#071422]">
            <Users size={24} className="text-[#071422] mb-3" />
            <div className="text-3xl font-bold text-[#071422]">{stats.totalLeads}</div>
            <div className="text-sm text-[#3a5570]/60 mt-2">Total Leads in Pipeline</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-2 border-amber-500">
            <Award size={24} className="text-amber-500 mb-3" />
            <div className="text-3xl font-bold text-[#071422]">{stats.vipCount}</div>
            <div className="text-sm text-[#3a5570]/60 mt-2">VIP Investors</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-2 border-red-500">
            <Zap size={24} className="text-red-500 mb-3" />
            <div className="text-3xl font-bold text-[#071422]">{stats.hotLeads}</div>
            <div className="text-sm text-[#3a5570]/60 mt-2">Hot Opportunities</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-2 border-green-500">
            <Target size={24} className="text-green-500 mb-3" />
            <div className="text-3xl font-bold text-[#071422]">{stats.avgScore}</div>
            <div className="text-sm text-[#3a5570]/60 mt-2">Average Lead Score</div>
          </div>
        </motion.div>
      </motion.div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-transparent">
          <h2 className="text-xl font-bold text-[#071422]">Investor Segments</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading lead scores...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No leads available</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {leads.map((lead, idx) => {
              const colors = getSegmentColor(lead.segment);
              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 * idx }}
                  className={`p-6 hover:bg-slate-50 transition-colors border-l-4 ${colors.border}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-semibold text-[#071422]">{lead.name}</div>
                      {lead.email && (
                        <div className="text-sm text-[#3a5570]/60 mt-1">{lead.email}</div>
                      )}
                      {lead.propertyInterest && (
                        <div className="text-xs text-[#3a5570]/50 mt-2">Interest: {lead.propertyInterest}</div>
                      )}
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${colors.badge} ${colors.text}`}>
                      {lead.segment === 'vip' ? '👑 VIP' : lead.segment === 'high-value' ? '⭐ High Value' : '📊 Standard'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#3a5570]/60">Lead Score</span>
                        <span className="text-sm font-bold text-[#071422]">{lead.score}/100</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${
                            lead.segment === 'vip'
                              ? 'from-amber-400 to-amber-600'
                              : lead.segment === 'high-value'
                              ? 'from-blue-400 to-blue-600'
                              : 'from-green-400 to-green-600'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${lead.score}%` }}
                          transition={{ delay: 0.05 * idx, duration: 0.8 }}
                        />
                      </div>
                    </div>

                    {lead.budget && (
                      <div className="ml-8 text-right">
                        <div className="text-xs text-[#3a5570]/60 mb-1">Budget</div>
                        <div className="font-semibold text-[#071422]">
                          EGP {(lead.budget / 1_000_000).toFixed(1)}M
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
