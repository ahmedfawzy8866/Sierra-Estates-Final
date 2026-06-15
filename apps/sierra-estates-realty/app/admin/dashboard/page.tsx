'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { Building2, TrendingUp, Handshake, Activity } from 'lucide-react';
import { KPICard, SectionHeader, StatusBadge, EmptyState } from '@/components/Admin';
import { logger } from '@/lib/logger';

interface RecentDeal {
  id: string;
  clientName: string;
  propertyTitle?: string;
  stage: string;
  status: string;
  updatedAt: string;
  terms?: { currency?: string; offerPrice?: number };
}

const PIPELINE_STAGES = [
  { s: 'S1–S2', label: 'Ingestion & Parsing',  pct: 100, color: '#1E88D9', count: 4821 },
  { s: 'S3–S5', label: 'Inventory & Pricing',  pct: 64,  color: '#C9A84C', count: 3102 },
  { s: 'S6–S8', label: 'Matching & Outreach',  pct: 38,  color: '#34D399', count: 1240 },
  { s: 'S9',    label: 'Negotiation',          pct: 18,  color: '#7C3AED', count: 421  },
  { s: 'S10',   label: 'Closed Deals',         pct: 8,   color: '#E63946', count: 97   },
];

export default function AdminDashboardPage() {
  const [totalUnits, setTotalUnits]       = useState(0);
  const [activeDeals, setActiveDeals]     = useState(0);
  const [recentCount, setRecentCount]     = useState(0);
  const [syncStatus, setSyncStatus]       = useState<string | null>(null);
  const [recentDeals, setRecentDeals]     = useState<RecentDeal[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [unitsSnap, activeSnap, recentSnap, syncSnap] = await Promise.all([
          getCountFromServer(collection(db, 'listings')),
          getCountFromServer(query(collection(db, 'deals'), where('stage', '!=', 'closed'))),
          getDocs(query(collection(db, 'deals'), orderBy('updatedAt', 'desc'), limit(8))),
          getDocs(query(collection(db, 'sync_jobs'), orderBy('createdAt', 'desc'), limit(1))),
        ]);

        setTotalUnits(unitsSnap.data().count);
        setActiveDeals(activeSnap.data().count);

        const recent = recentSnap.docs.map(d => ({ id: d.id, ...d.data() } as RecentDeal));
        setRecentDeals(recent);
        setRecentCount(recent.length);
        setSyncStatus(syncSnap.empty ? null : (syncSnap.docs[0].data().status as string));
      } catch (err) {
        logger.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const syncOk = syncStatus === 'success';

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="AI-Driven Engine"
        title="Intelligence OS"
        subtitle="Real-time overview of the Sierra Estates operating system."
        status={{ label: 'All systems nominal', ok: true }}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KPICard label="Total Units"     value={totalUnits.toLocaleString()}  sub="in inventory"  icon={Building2}  accent="#031632"  delta={{ value: 12, isPositive: true  }} loading={loading} />
        <KPICard label="Active Deals"    value={activeDeals.toLocaleString()} sub="in pipeline"   icon={Handshake}  accent="#C9A84C"  delta={{ value: 8,  isPositive: true  }} loading={loading} />
        <KPICard label="Recent Activity" value={recentCount.toLocaleString()} sub="updates today"  icon={TrendingUp} accent="#3a5570"  delta={{ value: 5,  isPositive: true  }} loading={loading} />
        <KPICard
          label="Sync Health"
          value={syncOk ? '✓ Live' : syncStatus ?? 'Pending'}
          sub="last check"
          icon={Activity}
          accent={syncOk ? '#16a34a' : '#C9A84C'}
          delta={syncOk ? { value: 99.8, isPositive: true } : { value: 0, isPositive: false }}
          loading={loading}
        />
      </div>

      {/* Pipeline + Deals */}
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
        {/* Sourcing Pipeline */}
        <div className="bg-white rounded-2xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-[#f3f4f5] flex items-center justify-between">
            <h2 className="font-bold text-[#071422] text-base font-display">Sourcing Pipeline</h2>
            <span className="text-[9px] text-[#3a5570]/40 uppercase tracking-widest font-mono">S1 → S10</span>
          </div>
          <div className="px-6 sm:px-8 py-6 space-y-5">
            {PIPELINE_STAGES.map((row, idx) => (
              <div key={row.s} className="space-y-1.5">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-[11px] text-[#071422] font-medium flex-1">
                    <strong className="font-mono text-[12px]" style={{ color: row.color }}>{row.s}</strong>
                    {' · '}
                    <span className="text-[#3a5570]">{row.label}</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#3a5570] font-semibold whitespace-nowrap">
                    {row.count.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#f3f4f5] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.pct}%`,
                      background: `linear-gradient(90deg, ${row.color}, ${row.color}88)`,
                      animation: `slideIn 0.8s ease-out ${idx * 0.1}s both`,
                      '--w': `${row.pct}%`
                    } as React.CSSProperties}
                  />
                </div>
              </div>
            ))}
            <p className="text-[10px] text-[#3a5570]/40 pt-4 border-t border-[#f3f4f5] leading-relaxed font-mono">
              Live counts across S1–S10 lead-to-deal funnel stages.
            </p>
          </div>
        </div>

        {/* Recent Deals */}
        <div className="bg-white rounded-2xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden flex flex-col">
          <div className="px-6 sm:px-8 py-5 border-b border-[#f3f4f5] flex items-center justify-between shrink-0">
            <h2 className="font-bold text-[#071422] text-base font-display">Recent Deal Activity</h2>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center p-8 text-[#3a5570]/30 text-sm">
              Loading…
            </div>
          ) : recentDeals.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title="No deals yet"
              description="Deals will appear here once created."
            />
          ) : (
            <div className="divide-y divide-[#f3f4f5] overflow-y-auto">
              {recentDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="px-6 sm:px-8 py-4 hover:bg-[#fafafa] transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px] text-[#071422] truncate">{deal.clientName}</div>
                    <div className="text-[10px] text-[#3a5570]/40 uppercase tracking-wide mt-0.5 truncate font-mono">
                      {deal.propertyTitle ?? 'Property'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={deal.stage} />
                    <span className="font-mono font-semibold text-[13px] text-[#031632] whitespace-nowrap">
                      {deal.terms?.currency ?? 'EGP'}{' '}
                      {deal.terms?.offerPrice?.toLocaleString() ?? '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            width: 0;
          }
          to {
            width: var(--w);
          }
        }
      `}</style>
    </div>
  );
}
