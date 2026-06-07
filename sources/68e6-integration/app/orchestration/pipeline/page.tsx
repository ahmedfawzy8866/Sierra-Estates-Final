'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Workflow, Users, Home, TrendingUp, Target } from 'lucide-react';
import { COLLECTIONS } from '@/lib/models/schema';

interface PipelineStage {
  stage: string;
  count: number;
  percentage: number;
  totalValue: number;
}

export default function OrchestrationPipelinePage() {
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalValue: 0,
    avgDealSize: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPipelineData = async () => {
      try {
        const dealsSnap = await getDocs(collection(db, COLLECTIONS.strategicPipeline));
        const deals = dealsSnap.docs.map(d => d.data());

        const stages = ['draft', 'offered', 'negotiation', 'signing', 'payment_pending', 'closed'];
        const stageCounts: Record<string, { count: number; value: number }> = {};

        stages.forEach(stage => {
          stageCounts[stage] = { count: 0, value: 0 };
        });

        deals.forEach(deal => {
          const stage = deal.stage || 'draft';
          if (stageCounts[stage]) {
            stageCounts[stage].count += 1;
            stageCounts[stage].value += deal.terms?.offerPrice || 0;
          }
        });

        const totalValue = Object.values(stageCounts).reduce((sum, s) => sum + s.value, 0);
        const totalLeads = deals.length;
        const closedDeals = stageCounts.closed.count;

        const pipelineData: PipelineStage[] = stages.map(stage => ({
          stage,
          count: stageCounts[stage].count,
          percentage: totalLeads > 0 ? (stageCounts[stage].count / totalLeads) * 100 : 0,
          totalValue: stageCounts[stage].value,
        }));

        setStats({
          totalLeads,
          totalValue,
          avgDealSize: totalLeads > 0 ? totalValue / totalLeads : 0,
          conversionRate: totalLeads > 0 ? (closedDeals / totalLeads) * 100 : 0,
        });

        setPipeline(pipelineData);
      } catch (err) {
        console.error('Pipeline load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPipelineData();
  }, []);

  const stageLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    draft: { label: 'Draft', icon: <Target size={20} />, color: 'bg-gray-100 text-gray-700' },
    offered: { label: 'Offered', icon: <Users size={20} />, color: 'bg-blue-100 text-blue-700' },
    negotiation: { label: 'Negotiation', icon: <Workflow size={20} />, color: 'bg-yellow-100 text-yellow-700' },
    signing: { label: 'Signing', icon: <Home size={20} />, color: 'bg-purple-100 text-purple-700' },
    payment_pending: { label: 'Payment', icon: <TrendingUp size={20} />, color: 'bg-orange-100 text-orange-700' },
    closed: { label: 'Closed', icon: <TrendingUp size={20} />, color: 'bg-green-100 text-green-700' },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2">Orchestration Pipeline</h1>
        <p className="text-[#3a5570]/60">Real-time visualization of deal flow and conversion funnel</p>
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
            <div className="text-sm text-[#3a5570]/60 mt-2">Total Deals in Pipeline</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-2 border-[#C9A24A]">
            <TrendingUp size={24} className="text-[#C9A24A] mb-3" />
            <div className="text-3xl font-bold text-[#071422]">
              {stats.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-[#3a5570]/60 mt-2">Conversion Rate</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-2 border-green-500">
            <Workflow size={24} className="text-green-500 mb-3" />
            <div className="text-3xl font-bold text-[#071422]">
              EGP {(stats.totalValue / 1_000_000).toFixed(0)}M
            </div>
            <div className="text-sm text-[#3a5570]/60 mt-2">Total Pipeline Value</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-2 border-blue-500">
            <Home size={24} className="text-blue-500 mb-3" />
            <div className="text-3xl font-bold text-[#071422]">
              EGP {(stats.avgDealSize / 1_000_000).toFixed(1)}M
            </div>
            <div className="text-sm text-[#3a5570]/60 mt-2">Average Deal Size</div>
          </div>
        </motion.div>
      </motion.div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-[#071422] mb-8 flex items-center gap-2">
          <Workflow size={28} className="text-[#C9A24A]" />
          Pipeline Flow
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading pipeline data...</div>
        ) : (
          <div className="space-y-8">
            {pipeline.map((stage, idx) => {
              const stageInfo = stageLabels[stage.stage];
              return (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stageInfo.color}`}>
                        {stageInfo.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#071422]">{stageInfo.label}</h3>
                        <p className="text-xs text-[#3a5570]/60">
                          {stage.count} deal{stage.count !== 1 ? 's' : ''} • EGP {(stage.totalValue / 1_000_000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#071422]">{stage.percentage.toFixed(0)}%</div>
                      <div className="text-xs text-[#3a5570]/60">{stage.count}/{stats.totalLeads}</div>
                    </div>
                  </div>

                  <div className="h-12 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl overflow-hidden border border-slate-200">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${
                        stage.stage === 'draft'
                          ? 'from-gray-400 to-gray-500'
                          : stage.stage === 'offered'
                          ? 'from-blue-400 to-blue-500'
                          : stage.stage === 'negotiation'
                          ? 'from-yellow-400 to-yellow-500'
                          : stage.stage === 'signing'
                          ? 'from-purple-400 to-purple-500'
                          : stage.stage === 'payment_pending'
                          ? 'from-orange-400 to-orange-500'
                          : 'from-green-400 to-green-500'
                      } flex items-center justify-end pr-4 text-white text-sm font-bold`}
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.percentage}%` }}
                      transition={{ delay: 0.1 * idx, duration: 1 }}
                    >
                      {stage.percentage > 5 && `${stage.percentage.toFixed(0)}%`}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {loading ? null : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-lg font-bold text-[#071422] mb-6">Stage Breakdown</h3>
            <div className="space-y-4">
              {pipeline.map((stage, idx) => (
                <div key={stage.stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      stage.stage === 'closed' ? 'bg-green-500' : 'bg-[#C9A24A]'
                    }`} />
                    <span className="text-sm text-[#3a5570]">{stageLabels[stage.stage].label}</span>
                  </div>
                  <span className="font-bold text-[#071422]">{stage.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-lg font-bold text-[#071422] mb-6">Value Distribution</h3>
            <div className="space-y-4">
              {pipeline.filter(s => s.totalValue > 0).map((stage) => {
                const valuePercentage = stats.totalValue > 0 ? (stage.totalValue / stats.totalValue) * 100 : 0;
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#3a5570]">{stageLabels[stage.stage].label}</span>
                      <span className="text-sm font-bold text-[#071422]">{valuePercentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#C9A24A]"
                        initial={{ width: 0 }}
                        animate={{ width: `${valuePercentage}%` }}
                        transition={{ delay: 0.3, duration: 1 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
