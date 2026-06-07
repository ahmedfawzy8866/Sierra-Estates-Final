'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Vault, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { COLLECTIONS } from '@/lib/models/schema';

interface EscrowRecord {
  id: string;
  dealId: string;
  investorName: string;
  propertyTitle: string;
  escrowAmount: number;
  holdDate: string;
  releaseDate?: string;
  status: 'held' | 'released' | 'disputed' | 'refunded';
  escrowAgent?: string;
}

export default function SettlementEscrowPage() {
  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [totals, setTotals] = useState({
    totalHeld: 0,
    totalReleased: 0,
    activeCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEscrows = async () => {
      try {
        const dealsSnap = await getDocs(collection(db, COLLECTIONS.strategicPipeline));
        const escrowRecords: EscrowRecord[] = [];

        dealsSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.escrowAmount && data.escrowAmount > 0) {
            escrowRecords.push({
              id: `escrow-${doc.id}`,
              dealId: doc.id,
              investorName: data.clientName || 'Unknown',
              propertyTitle: data.propertyTitle || 'Untitled',
              escrowAmount: data.escrowAmount,
              holdDate: data.createdAt || new Date().toISOString(),
              releaseDate: data.closingDate,
              status: data.stage === 'closed' ? 'released' : 'held',
              escrowAgent: 'Sierra Blu Legal',
            });
          }
        });

        const heldAmount = escrowRecords
          .filter(e => e.status === 'held')
          .reduce((sum, e) => sum + e.escrowAmount, 0);
        const releasedAmount = escrowRecords
          .filter(e => e.status === 'released')
          .reduce((sum, e) => sum + e.escrowAmount, 0);

        setTotals({
          totalHeld: heldAmount,
          totalReleased: releasedAmount,
          activeCount: escrowRecords.filter(e => e.status === 'held').length,
        });

        setEscrows(escrowRecords.sort((a, b) => new Date(b.holdDate).getTime() - new Date(a.holdDate).getTime()));
      } catch (err) {
        console.error('Escrow load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEscrows();
  }, []);

  const statusIcons: Record<string, React.ReactNode> = {
    held: <AlertCircle size={20} className="text-yellow-600" />,
    released: <CheckCircle size={20} className="text-green-600" />,
    disputed: <AlertCircle size={20} className="text-red-600" />,
    refunded: <CheckCircle size={20} className="text-blue-600" />,
  };

  const statusColors: Record<string, string> = {
    held: 'bg-yellow-100 text-yellow-700',
    released: 'bg-green-100 text-green-700',
    disputed: 'bg-red-100 text-red-700',
    refunded: 'bg-blue-100 text-blue-700',
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
        <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2">Settlement & Escrow Management</h1>
        <p className="text-[#3a5570]/60">Track held funds and settlement status for all transactions</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-yellow-500">
            <div className="flex items-center gap-3 mb-4">
              <Vault size={24} className="text-yellow-600" />
              <h3 className="text-sm font-semibold text-[#3a5570] uppercase tracking-widest">
                Currently Held
              </h3>
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-4xl font-bold text-[#071422] mb-2">
                EGP {(totals.totalHeld / 1_000_000).toFixed(1)}M
              </div>
              <div className="text-sm text-[#3a5570]/60">
                {totals.activeCount} active escrow{totals.activeCount !== 1 ? 's' : ''}
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-green-500">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle size={24} className="text-green-600" />
              <h3 className="text-sm font-semibold text-[#3a5570] uppercase tracking-widest">
                Released
              </h3>
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-4xl font-bold text-[#071422] mb-2">
                EGP {(totals.totalReleased / 1_000_000).toFixed(1)}M
              </div>
              <div className="text-sm text-[#3a5570]/60">
                {escrows.filter(e => e.status === 'released').length} completed transactions
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-[#C9A24A]">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign size={24} className="text-[#C9A24A]" />
              <h3 className="text-sm font-semibold text-[#3a5570] uppercase tracking-widest">
                Total Managed
              </h3>
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-4xl font-bold text-[#071422] mb-2">
                EGP {((totals.totalHeld + totals.totalReleased) / 1_000_000).toFixed(1)}M
              </div>
              <div className="text-sm text-[#3a5570]/60">
                All escrow accounts combined
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-transparent">
          <h2 className="text-xl font-bold text-[#071422]">Escrow Records</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading escrow records...</div>
        ) : escrows.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No escrow records available</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {escrows.map((escrow, idx) => (
              <motion.div
                key={escrow.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * idx }}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[#071422]">{escrow.propertyTitle}</h3>
                    <p className="text-sm text-[#3a5570]/60 mt-1">Investor: {escrow.investorName}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${statusColors[escrow.status]}`}>
                    {escrow.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-100">
                  <div>
                    <div className="text-xs text-[#3a5570]/60 font-semibold mb-1">AMOUNT HELD</div>
                    <div className="font-bold text-lg text-[#071422]">
                      EGP {(escrow.escrowAmount / 1_000_000).toFixed(1)}M
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#3a5570]/60 font-semibold mb-1">HOLD DATE</div>
                    <div className="text-sm font-semibold text-[#071422]">
                      {new Date(escrow.holdDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#3a5570]/60 font-semibold mb-1">ESCROW AGENT</div>
                    <div className="text-sm font-semibold text-[#071422]">{escrow.escrowAgent}</div>
                  </div>

                  {escrow.releaseDate && (
                    <div>
                      <div className="text-xs text-[#3a5570]/60 font-semibold mb-1">RELEASE DATE</div>
                      <div className="text-sm font-semibold text-[#071422]">
                        {new Date(escrow.releaseDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
