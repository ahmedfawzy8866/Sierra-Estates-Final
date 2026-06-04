'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { PieChart, TrendingUp, Wallet, Activity } from 'lucide-react';
import { COLLECTIONS } from '@/lib/models/schema';

interface PortfolioAsset {
  id: string;
  title: string;
  price: number;
  propertyType: string;
  status: string;
  expectedROI?: number;
}

interface PortfolioSummary {
  totalValue: number;
  assetCount: number;
  avgROI: number;
  activeDeals: number;
}

export default function WealthPortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    assetCount: 0,
    avgROI: 0,
    activeDeals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const assetsSnap = await getDocs(collection(db, COLLECTIONS.portfolioAssets));
        const assets = assetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioAsset));

        const totalValue = assets.reduce((sum, a) => sum + (a.price || 0), 0);
        const avgROI = assets.length > 0
          ? assets.reduce((sum, a) => sum + (a.expectedROI || 0), 0) / assets.length
          : 0;

        const activeCount = assets.filter(a => a.status !== 'sold' && a.status !== 'off-market').length;

        setSummary({
          totalValue,
          assetCount: assets.length,
          avgROI,
          activeDeals: activeCount,
        });

        setPortfolio(assets.sort((a, b) => (b.price || 0) - (a.price || 0)));
      } catch (err) {
        console.error('Portfolio load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  const typeDistribution = portfolio.reduce((acc, asset) => {
    acc[asset.propertyType] = (acc[asset.propertyType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
        <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2">Wealth Portfolio</h1>
        <p className="text-[#3a5570]/60">Strategic asset allocation and performance tracking</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-2 border-[#C9A24A]">
            <Wallet size={24} className="text-[#C9A24A] mb-3" />
            <div className="text-3xl font-bold text-[#071422]">
              EGP {(summary.totalValue / 1_000_000).toFixed(1)}M
            </div>
            <div className="text-sm text-[#3a5570]/60 mt-2">Total Portfolio Value</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-2 border-blue-500">
            <PieChart size={24} className="text-blue-500 mb-3" />
            <div className="text-3xl font-bold text-[#071422]">{summary.assetCount}</div>
            <div className="text-sm text-[#3a5570]/60 mt-2">Total Assets</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-2 border-green-500">
            <TrendingUp size={24} className="text-green-500 mb-3" />
            <div className="text-3xl font-bold text-[#071422]">{summary.avgROI.toFixed(1)}%</div>
            <div className="text-sm text-[#3a5570]/60 mt-2">Average ROI</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-2 border-purple-500">
            <Activity size={24} className="text-purple-500 mb-3" />
            <div className="text-3xl font-bold text-[#071422]">{summary.activeDeals}</div>
            <div className="text-sm text-[#3a5570]/60 mt-2">Active Assets</div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-xl font-bold text-[#071422] mb-6">Top Holdings</h2>
          {loading ? (
            <div className="text-center text-slate-400 py-8">Loading portfolio...</div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {portfolio.slice(0, 8).map((asset, idx) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-[#071422]">{asset.title}</div>
                    <div className="text-xs text-[#3a5570]/60 mt-1">{asset.propertyType}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#071422]">
                      EGP {(asset.price / 1_000_000).toFixed(1)}M
                    </div>
                    {asset.expectedROI && (
                      <div className="text-xs text-green-600 font-bold">{asset.expectedROI.toFixed(1)}% ROI</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-xl font-bold text-[#071422] mb-6">Asset Distribution</h2>
          <div className="space-y-3">
            {Object.entries(typeDistribution).map(([type, count]) => {
              const percentage = (count / portfolio.length) * 100;
              return (
                <motion.div key={type} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#071422] capitalize">{type}</span>
                    <span className="text-sm font-bold text-[#C9A24A]">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#C9A24A] to-[#E5B76F]"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.2, duration: 1 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
