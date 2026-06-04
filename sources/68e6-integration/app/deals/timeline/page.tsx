'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, AlertCircle, Home } from 'lucide-react';
import { COLLECTIONS } from '@/lib/models/schema';

interface DealTimeline {
  id: string;
  clientName: string;
  propertyTitle: string;
  stage: string;
  progress: number;
  milestones: { label: string; completed: boolean; date?: string }[];
  closingDate?: string;
}

export default function ClosingTimelinePage() {
  const [deals, setDeals] = useState<DealTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const dealsSnap = await getDocs(collection(db, COLLECTIONS.strategicPipeline));
        const dealsData = dealsSnap.docs.map((doc) => {
          const data = doc.data();
          const stage = data.stage || 'draft';
          const stageProgress = {
            draft: 10,
            offered: 25,
            negotiation: 50,
            signing: 75,
            payment_pending: 85,
            closed: 100,
          };

          const milestones = [
            { label: 'Initial Offer', completed: ['offered', 'negotiation', 'signing', 'payment_pending', 'closed'].includes(stage) },
            { label: 'Negotiation', completed: ['negotiation', 'signing', 'payment_pending', 'closed'].includes(stage) },
            { label: 'Contract Signing', completed: ['signing', 'payment_pending', 'closed'].includes(stage) },
            { label: 'Payment Processing', completed: ['payment_pending', 'closed'].includes(stage) },
            { label: 'Closing', completed: stage === 'closed' },
          ];

          return {
            id: doc.id,
            clientName: data.clientName || 'Unknown',
            propertyTitle: data.propertyTitle || 'Untitled',
            stage,
            progress: stageProgress[stage as keyof typeof stageProgress] || 10,
            milestones,
            closingDate: data.closingDate,
          } as DealTimeline;
        });

        setDeals(dealsData.sort((a, b) => b.progress - a.progress));
      } catch (err) {
        console.error('Deals load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, []);

  const stageColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    offered: 'bg-blue-100 text-blue-700',
    negotiation: 'bg-yellow-100 text-yellow-700',
    signing: 'bg-purple-100 text-purple-700',
    payment_pending: 'bg-orange-100 text-orange-700',
    closed: 'bg-green-100 text-green-700',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2">Deal Closing Timeline</h1>
        <p className="text-[#3a5570]/60">Track progress through each stage of the transaction pipeline</p>
      </motion.div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading deals...</div>
      ) : deals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Home size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 text-lg">No active deals</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {deals.map((deal) => (
            <motion.div key={deal.id} variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#071422]">{deal.propertyTitle}</h3>
                      <p className="text-sm text-[#3a5570]/60 mt-1">Client: {deal.clientName}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest ${stageColors[deal.stage]}`}>
                      {deal.stage.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#3a5570]/60">PROGRESS</span>
                        <span className="text-sm font-bold text-[#071422]">{deal.progress}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#C9A24A] to-[#E5B76F]"
                          initial={{ width: 0 }}
                          animate={{ width: `${deal.progress}%` }}
                          transition={{ delay: 0.2, duration: 1 }}
                        />
                      </div>
                    </div>
                    {deal.closingDate && (
                      <div className="text-right">
                        <div className="text-xs text-[#3a5570]/60 font-semibold">CLOSING</div>
                        <div className="text-sm font-bold text-[#071422]">
                          {new Date(deal.closingDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {deal.milestones.map((milestone, idx) => (
                      <motion.div
                        key={milestone.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="flex flex-col items-center text-center"
                      >
                        <motion.div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
                            milestone.completed
                              ? 'bg-green-100'
                              : idx === deal.milestones.findIndex(m => !m.completed)
                              ? 'bg-blue-100 ring-2 ring-blue-300'
                              : 'bg-slate-200'
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {milestone.completed ? (
                            <CheckCircle2 size={24} className="text-green-600" />
                          ) : idx === deal.milestones.findIndex(m => !m.completed) ? (
                            <Clock size={24} className="text-blue-600" />
                          ) : (
                            <AlertCircle size={24} className="text-slate-400" />
                          )}
                        </motion.div>
                        <p className="text-xs font-semibold text-[#071422]">{milestone.label}</p>
                        {milestone.date && (
                          <p className="text-[10px] text-[#3a5570]/60 mt-1">
                            {new Date(milestone.date).toLocaleDateString()}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
