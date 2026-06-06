'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { TrendingUp, DollarSign, Clock, CheckCircle, BarChart3, Shield } from 'lucide-react';
import { cinematicEntrance } from '@/lib/animations';
import { formatCompactEGP } from '@/lib/financial-engine';

interface SaleRecord {
  id: string;
  leadId: string;
  unitId: string;
  agentId: string;
  salePrice: number;
  commissionPercent: number;
  commissionAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  closingDate?: { toDate: () => Date };
  createdAt?: { toDate: () => Date };
}

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Authorized', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border-red-200' },
};

export default function CommissionPage() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() } as SaleRecord)));
      setLoading(false);
    });
  }, []);

  const totalGCI     = sales.reduce((s, r) => s + (r.commissionAmount || 0), 0);
  const pending      = sales.filter(r => r.status === 'pending').reduce((s, r) => s + (r.commissionAmount || 0), 0);
  const authorized   = sales.filter(r => r.status === 'completed').reduce((s, r) => s + (r.commissionAmount || 0), 0);
  const efficiency   = sales.length > 0
    ? Math.round((sales.filter(r => r.status === 'completed').length / sales.length) * 100)
    : 0;

  const kpis = [
    { label: 'Aggregate GCI',    value: formatCompactEGP(totalGCI),   icon: TrendingUp,   color: '#C9A84C' },
    { label: 'Pending Payouts',  value: formatCompactEGP(pending),    icon: Clock,        color: '#f59e0b' },
    { label: 'Authorized Flow',  value: formatCompactEGP(authorized), icon: CheckCircle,  color: '#10b981' },
    { label: 'Yield Efficiency', value: `${efficiency}%`,              icon: BarChart3,    color: '#3b82f6' },
  ];

  const handleAuthorize = async (id: string) => {
    await updateDoc(doc(db, 'sales', id), { status: 'completed' });
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        variants={cinematicEntrance}
        initial="hidden"
        animate="visible"
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#031632] flex items-center justify-center">
            <DollarSign size={18} className="text-[#C9A84C]" />
          </div>
          <h1 className="text-2xl font-bold text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
            Commission Ledger
          </h1>
        </div>
        <p className="text-sm text-[#3a5570]/60 ml-[52px]">
          Executive financial reconciliation and advisor payout orchestration.
        </p>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            variants={cinematicEntrance}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] border border-black/[0.03]"
          >
            <div className="flex items-center justify-between mb-3">
              <kpi.icon size={18} style={{ color: kpi.color }} />
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: kpi.color }} />
            </div>
            <div className="text-xl font-bold text-[#071422] font-mono tabular-nums">{kpi.value}</div>
            <div className="text-[10px] text-[#3a5570]/50 uppercase tracking-widest mt-1 font-semibold">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        variants={cinematicEntrance}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] border border-black/[0.03] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.04]">
          <h2 className="text-base font-bold text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
            Transaction Reconciliation
          </h2>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[#C9A84C]" />
            <span className="text-[9px] font-mono text-[#3a5570]/40 uppercase tracking-widest">
              {sales.length} records
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-[#C9A84C] text-xs tracking-widest uppercase animate-pulse font-mono">
              Loading transactions...
            </div>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16 text-[#3a5570]/30 text-sm">
            No commission records yet. Sales will appear here once closings are initiated.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8f9fa] text-[9px] uppercase tracking-widest text-[#3a5570]/50 font-bold">
                  <th className="px-6 py-3 text-left">Transaction ID</th>
                  <th className="px-6 py-3 text-left">Agent</th>
                  <th className="px-6 py-3 text-right">Asset Value</th>
                  <th className="px-6 py-3 text-right">Commission %</th>
                  <th className="px-6 py-3 text-right">Commission</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Date</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {sales.map((sale, i) => {
                  const style = STATUS_STYLES[sale.status] ?? STATUS_STYLES.pending;
                  return (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.04 }}
                      className="hover:bg-[#f8f9fa]/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-[11px] text-[#C9A84C] font-bold">
                        {sale.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#071422] font-medium">
                        {sale.agentId?.slice(0, 12) || '—'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-[#071422] font-mono">
                        {formatCompactEGP(sale.salePrice || 0)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-[#3a5570]">
                        {sale.commissionPercent}%
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-[#071422] font-mono">
                        {formatCompactEGP(sale.commissionAmount || 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${style.cls}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-[#3a5570]/50 font-mono">
                        {sale.createdAt?.toDate?.().toLocaleDateString?.() ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {sale.status === 'pending' && (
                          <button
                            onClick={() => handleAuthorize(sale.id)}
                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wide transition-colors"
                          >
                            Authorize
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Commission Protocols */}
      <motion.div
        variants={cinematicEntrance}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        className="mt-6 grid lg:grid-cols-2 gap-6"
      >
        <div className="bg-[#031632] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[#C9A84C] uppercase tracking-widest mb-5">
            Commission Protocols
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Base Remuneration', value: 'EGP 2,000', note: 'Standard remote operational stipend' },
              { label: 'Achievement Bonus', value: 'EGP 4,000', note: 'Unlocked upon 1 closure (Net GCI ≥ 25K)' },
              { label: 'Private Effort Split', value: '20%–25%', note: 'Advisor self-sourced deals' },
              { label: 'Company Inventory', value: '10%–15%', note: 'Listed portfolio assets' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                <div>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{item.label}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{item.note}</p>
                </div>
                <span className="text-sm font-bold text-[#C9A84C] font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] border border-black/[0.03]">
          <h3 className="text-sm font-bold text-[#071422] uppercase tracking-widest mb-5">
            Advisor Performance
          </h3>
          <div className="flex items-end gap-2 h-[120px]">
            {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.6 + i * 0.07, type: 'spring', damping: 20 }}
                className="flex-1 rounded-t bg-gradient-to-t from-[#C9A84C]/60 to-[#C9A84C]"
              />
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[9px] uppercase tracking-widest text-[#3a5570]/40 font-bold">
            {['Nov','Dec','Jan','Feb','Mar','Apr','May'].map(m => <span key={m}>{m}</span>)}
          </div>
          <div className="mt-4 p-3 bg-[#f8f9fa] rounded-xl text-center">
            <span className="text-[9px] text-[#3a5570]/40 uppercase tracking-widest font-mono">
              Ad Source Amplifiers: Facebook +15% · PF Gateway +5%
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
