'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BarChart3, Users, Home, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  totalListings: number;
  activeListings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    totalListings: 0,
    activeListings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to leads
    const leadsUnsub = onSnapshot(collection(db, 'leads'), (snap) => {
      const newLeads = snap.docs.filter(d => d.data().status === 'new').length;
      setStats(prev => ({
        ...prev,
        totalLeads: snap.size,
        newLeads,
      }));
    });

    // Subscribe to listings
    const listingsUnsub = onSnapshot(collection(db, 'properties'), (snap) => {
      const activeListings = snap.docs.filter(d => d.data().status === 'active').length;
      setStats(prev => ({
        ...prev,
        totalListings: snap.size,
        activeListings,
      }));
    });

    setLoading(false);

    return () => {
      leadsUnsub();
      listingsUnsub();
    };
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-6 hover:border-[#C9A84C]/50 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#C9A84C]/60 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <Icon className={`w-12 h-12 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-[#C9A84C]/60">Welcome to the Sierra Estates admin console</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Leads"
          value={stats.totalLeads}
          color="text-blue-400"
        />
        <StatCard
          icon={TrendingUp}
          label="New Leads"
          value={stats.newLeads}
          color="text-green-400"
        />
        <StatCard
          icon={Home}
          label="Total Listings"
          value={stats.totalListings}
          color="text-amber-400"
        />
        <StatCard
          icon={BarChart3}
          label="Active Listings"
          value={stats.activeListings}
          color="text-purple-400"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#071422] font-semibold rounded-lg transition">
            View All Leads
          </button>
          <button className="px-4 py-3 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#071422] font-semibold rounded-lg transition">
            Manage Listings
          </button>
          <button className="px-4 py-3 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#071422] font-semibold rounded-lg transition">
            Launch Intelligence OS
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
        <div className="space-y-2 text-[#C9A84C]/80">
          <p>✓ Firebase Integration: Connected</p>
          <p>✓ Leads Database: Syncing</p>
          <p>✓ Listings Database: Syncing</p>
          <p>✓ Admin Console: Ready</p>
        </div>
      </div>
    </div>
  );
}
