'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Home, Handshake, DollarSign, Download, Filter } from 'lucide-react';
import { COLLECTIONS } from '@/lib/models/schema';

interface ReportMetric {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: string;
}

interface ChartData {
  period: string;
  deals: number;
  revenue: number;
  conversions: number;
}

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    async function loadReports() {
      try {
        const dealsSnap = await getDocs(query(collection(db, COLLECTIONS.strategicPipeline), orderBy('createdAt', 'desc')));
        const deals = dealsSnap.docs.map(d => d.data());

        const closedCount = deals.filter(d => d.stage === 'closed').length;
        const totalValue = deals.reduce((sum, d) => sum + (d.terms?.offerPrice || 0), 0);
        const avgDealValue = deals.length > 0 ? totalValue / deals.length : 0;

        setMetrics([
          {
            label: 'Total Deals',
            value: deals.length,
            change: '+12%',
            icon: Handshake,
            color: '#C9A24A',
          },
          {
            label: 'Revenue',
            value: `EGP ${(totalValue / 1_000_000).toFixed(1)}M`,
            change: '+8%',
            icon: DollarSign,
            color: '#15803d',
          },
          {
            label: 'Closed Deals',
            value: closedCount,
            change: '+5%',
            icon: TrendingUp,
            color: '#2563eb',
          },
          {
            label: 'Avg Deal Size',
            value: `EGP ${(avgDealValue / 1_000_000).toFixed(1)}M`,
            change: '-2%',
            icon: Home,
            color: '#7c3aed',
          },
        ]);

        // Mock chart data
        const mockChartData: ChartData[] = [
          { period: 'Week 1', deals: 3, revenue: 450, conversions: 2 },
          { period: 'Week 2', deals: 5, revenue: 780, conversions: 3 },
          { period: 'Week 3', deals: 4, revenue: 620, conversions: 2 },
          { period: 'Week 4', deals: 7, revenue: 1100, conversions: 5 },
        ];
        setChartData(mockChartData);
      } catch (err) {
        console.error('Report load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [timeRange]);

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-[#071422] tracking-tight">Advanced Reports</h1>
            <p className="text-[#3a5570]/60 mt-2">Sales performance, revenue trends, and conversion analytics</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-6 py-3 bg-[#C9A24A] text-white rounded-lg font-semibold"
          >
            <Download size={18} />
            Export Report
          </motion.button>
        </div>

        <div className="flex gap-2 mt-4">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <motion.button
              key={range}
              whileHover={{ scale: 1.05 }}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-widest transition-all ${
                timeRange === range
                  ? 'bg-[#C9A24A] text-white'
                  : 'bg-white text-[#3a5570] border border-slate-200'
              }`}
            >
              {range}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <motion.div key={metric.label} variants={itemVariants}>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <Icon size={24} style={{ color: metric.color }} />
                  {metric.change && (
                    <span className="text-xs font-bold text-green-600">{metric.change}</span>
                  )}
                </div>
                <div className="text-3xl font-bold text-[#071422] mb-1">{metric.value}</div>
                <div className="text-sm text-[#3a5570] font-medium">{metric.label}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading reports...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-[#071422] mb-6">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" stroke="#3a5570" />
                <YAxis stroke="#3a5570" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                  formatter={(value) => `EGP ${value}M`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C9A24A"
                  strokeWidth={3}
                  dot={{ fill: '#C9A24A', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-[#071422] mb-6">Deal Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" stroke="#3a5570" />
                <YAxis stroke="#3a5570" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Bar dataKey="deals" fill="#2563eb" radius={[8, 8, 0, 0]} />
                <Bar dataKey="conversions" fill="#15803d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
