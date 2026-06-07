'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, Timestamp, orderBy } from 'firebase/firestore';
import { Ticket, Gift, Crown, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { cinematicEntrance } from '@/lib/animations';

interface Voucher {
  id: string;
  code: string;
  type: string;
  value: number;
  currency: string;
  leadId?: string;
  leadName?: string;
  status: 'active' | 'redeemed' | 'expired';
  expiresAt: Timestamp;
  createdAt: Timestamp;
  conditions?: string;
}

const STATUS_CONFIG = {
  active:   { label: 'Active',    icon: Clock,        cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  redeemed: { label: 'Redeemed',  icon: CheckCircle,  cls: 'text-blue-600 bg-blue-50 border-blue-200' },
  expired:  { label: 'Expired',   icon: XCircle,      cls: 'text-red-500 bg-red-50 border-red-200' },
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'vouchers'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setVouchers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Voucher)));
      setLoading(false);
    });
  }, []);

  const generateVoucher = async () => {
    setGenerating(true);
    try {
      const code = 'SB-VIP-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      await addDoc(collection(db, 'vouchers'), {
        code,
        type: 'viewing-reward',
        value: 5000,
        currency: 'EGP',
        status: 'active',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditions: 'Valid for site inspection bookings within 7 days of issue.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const markRedeemed = async (id: string) => {
    await updateDoc(doc(db, 'vouchers', id), { status: 'redeemed' });
  };

  const active   = vouchers.filter(v => v.status === 'active').length;
  const redeemed = vouchers.filter(v => v.status === 'redeemed').length;
  const totalValue = vouchers.filter(v => v.status === 'active').reduce((s, v) => s + (v.value || 0), 0);

  return (
    <div>
      {/* Header */}
      <motion.div
        variants={cinematicEntrance}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between mb-10"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#031632] flex items-center justify-center">
              <Ticket size={18} className="text-[#C9A84C]" />
            </div>
            <h1 className="text-2xl font-bold text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
              Sales Incentive Engine
            </h1>
          </div>
          <p className="text-sm text-[#3a5570]/60 ml-[52px]">
            Deploy high-velocity loyalty rewards. Automate stakeholder engagement.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={generateVoucher}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#031632] text-white text-xs font-bold rounded-xl hover:bg-[#041f3d] transition-colors disabled:opacity-50 uppercase tracking-wide"
        >
          <Gift size={15} />
          {generating ? 'Generating...' : 'Generate Reward'}
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Vouchers',  value: active,                    icon: Ticket,       color: '#C9A84C' },
          { label: 'Redeemed',         value: redeemed,                  icon: CheckCircle,  color: '#10b981' },
          { label: 'Total Active EGP', value: `${(totalValue/1000).toFixed(0)}K`, icon: Crown, color: '#3b82f6' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={cinematicEntrance}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] border border-black/[0.03]"
          >
            <stat.icon size={18} style={{ color: stat.color }} className="mb-3" />
            <div className="text-2xl font-bold text-[#071422] font-mono">{stat.value}</div>
            <div className="text-[10px] text-[#3a5570]/50 uppercase tracking-widest mt-1 font-semibold">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Voucher Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-[#C9A84C] text-xs tracking-widest uppercase animate-pulse font-mono">
            Loading vouchers...
          </div>
        </div>
      ) : vouchers.length === 0 ? (
        <motion.div
          variants={cinematicEntrance}
          initial="hidden"
          animate="visible"
          className="text-center py-24 bg-white rounded-2xl border border-dashed border-[#C9A84C]/30"
        >
          <Ticket size={32} className="text-[#C9A84C]/30 mx-auto mb-3" />
          <p className="text-sm text-[#3a5570]/40">No vouchers yet. Generate the first reward above.</p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {vouchers.map((v, i) => {
              const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.active;
              const expiresDate = v.expiresAt?.toDate?.()?.toLocaleDateString?.() ?? '—';
              const daysLeft = v.expiresAt
                ? Math.max(0, Math.ceil((v.expiresAt.toMillis() - Date.now()) / 86400000))
                : 0;

              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] border border-black/[0.03] relative"
                >
                  {/* Ticket notches */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f8f9fa] -ml-2 border-r border-black/[0.04]" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f8f9fa] -mr-2 border-l border-black/[0.04]" />

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-9 h-9 rounded-xl bg-[#031632]/5 flex items-center justify-center">
                        <Crown size={18} className="text-[#C9A84C]" />
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${cfg.cls}`}>
                        <cfg.icon size={10} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Code */}
                    <div className="mb-4">
                      <p className="text-[9px] text-[#3a5570]/40 uppercase tracking-widest font-semibold mb-1">
                        Incentive Code
                      </p>
                      <p className="text-xl font-mono font-bold text-[#071422] tracking-wider">{v.code}</p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-black/[0.06] my-4" />

                    {/* Value & Expiry */}
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-[9px] text-[#3a5570]/40 uppercase tracking-widest">Reward Value</p>
                        <p className="text-2xl font-bold text-emerald-600 font-mono">
                          {(v.value || 0).toLocaleString()} <span className="text-xs font-normal opacity-60">EGP</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-[#3a5570]/40 uppercase tracking-widest">Expires</p>
                        <p className="text-xs font-mono text-[#3a5570]">{expiresDate}</p>
                        {v.status === 'active' && (
                          <p className="text-[9px] text-amber-500 font-bold">{daysLeft}d left</p>
                        )}
                      </div>
                    </div>

                    {/* Lead */}
                    {v.leadName && (
                      <div className="mb-4 px-3 py-2 bg-[#031632]/5 rounded-lg">
                        <p className="text-[9px] text-[#3a5570]/40 uppercase tracking-widest">Assigned To</p>
                        <p className="text-xs font-semibold text-[#071422]">{v.leadName}</p>
                      </div>
                    )}

                    {/* Action */}
                    {v.status === 'active' && (
                      <button
                        onClick={() => markRedeemed(v.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#031632] text-white text-[10px] font-bold rounded-xl hover:bg-[#041f3d] transition-colors uppercase tracking-widest"
                      >
                        <Send size={11} />
                        Mark Redeemed
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
