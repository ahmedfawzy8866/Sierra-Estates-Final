'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, MapPin, DollarSign } from 'lucide-react';
import { COLLECTIONS } from '@/lib/models/schema';

interface MarketMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
}

interface LocationMetric {
  location: string;
  count: number;
  avgPrice: number;
  demand: 'high' | 'medium' | 'low';
}

export default function MarketAnalyticsPage() {
  const [metrics, setMetrics] = useState<MarketMetric[]>([]);
  const [locations, setLocations] = useState<LocationMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const unitsSnap = await getDocs(collection(db, COLLECTIONS.portfolioAssets));
        type UnitDoc = { price?: number; category?: string; location?: string };
        const units = unitsSnap.docs.map(d => d.data() as UnitDoc);

        const avgPrice = units.length > 0
          ? units.reduce((sum, u) => sum + (u.price || 0), 0) / units.length
          : 0;

        const residentialCount = units.filter(u => u.category === 'residential').length;
        const commercialCount = units.filter(u => u.category === 'commercial').length;

        const locationMap = new Map<string, { count: number; prices: number[] }>();
        units.forEach((u) => {
          if (u.location) {
            const loc = locationMap.get(u.location) || { count: 0, prices: [] };
            loc.count += 1;
            if (u.price) loc.prices.push(u.price);
            locationMap.set(u.location, loc);
          }
        });

        const locationMetrics: LocationMetric[] = Array.from(locationMap.entries()).map(
          ([location, data]) => ({
            location,
            count: data.count,
            avgPrice: data.prices.length > 0 ? data.prices.reduce((a, b) => a + b, 0) / data.prices.length : 0,
            demand: (data.count > 10 ? 'high' : data.count > 5 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
          })
        ).sort((a, b) => b.count - a.count);

        setMetrics([
          {
            label: 'Market Inventory',
            value: units.length.toString(),
            change: '+12%',
            trend: 'up',
            icon: Building2,
          },
          {
            label: 'Avg Asset Price',
            value: `EGP ${(avgPrice / 1_000_000).toFixed(1)}M`,
            change: '+8%',
            trend: 'up',
            icon: DollarSign,
          },
          {
            label: 'Residential Mix',
            value: `${residentialCount}`,
            change: `${((residentialCount / units.length) * 100).toFixed(0)}%`,
            trend: 'stable',
            icon: MapPin,
          },
          {
            label: 'Commercial Mix',
            value: `${commercialCount}`,
            change: `${((commercialCount / units.length) * 100).toFixed(0)}%`,
            trend: 'stable',
            icon: BarChart3,
          },
        ]);

        setLocations(locationMetrics.slice(0, 8));
      } catch (err) {
        console.error('Market analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMarketData();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2">Market Analytics</h1>
        <p className="text-[#3a5570]/60">Real-time market intelligence and location demand analysis</p>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C9A24A]/10 flex items-center justify-center">
                    <Icon size={24} className="text-[#C9A24A]" />
                  </div>
                  <span className={`text-xs font-bold ${metric.trend === 'up' ? 'text-green-600' : 'text-slate-400'}`}>
                    {metric.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-[#071422] mb-1">{metric.value}</div>
                <div className="text-sm text-[#3a5570] font-medium">{metric.label}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-transparent">
          <h2 className="text-xl font-bold text-[#071422]">Location Demand Heat Map</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading location data...</div>
        ) : locations.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No location data available</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {locations.map((loc, idx) => (
              <motion.div
                key={loc.location}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-[#071422]">{loc.location}</div>
                  <div className="text-sm text-[#3a5570]/60 mt-1">{loc.count} properties</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-semibold text-[#071422]">
                      EGP {(loc.avgPrice / 1_000_000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-[#3a5570]/60">avg price</div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      loc.demand === 'high'
                        ? 'bg-green-100 text-green-700'
                        : loc.demand === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {loc.demand} demand
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Building2(props: any) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M6 3h12v18H6z" />
      <path d="M9 9h6M9 14h6M9 19h6" />
    </svg>
  );
}
