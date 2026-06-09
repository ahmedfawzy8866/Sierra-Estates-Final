'use client';

import { useEffect, useState } from 'react';
import KPICard from '../ui/KPICard';
import PipelineChart from '../ui/PipelineChart';
import LeadsList from '../ui/LeadsList';
import AgentStatusList from '../ui/AgentStatusList';

interface KPI {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  color: string;
  spark: number[];
}

interface Lead {
  name: string;
  phone: string;
  interest: string;
  stage: string;
  color: string;
  hot: boolean;
}

const KPI_DATA: KPI[] = [
  {
    label: 'Total Listings',
    value: '1,547',
    delta: '+12% this week',
    up: true,
    color: '#C8961A',
    spark: [42, 55, 48, 70, 62, 85, 95],
  },
  {
    label: 'Active Leads',
    value: '284',
    delta: '+8 today',
    up: true,
    color: '#1E88D9',
    spark: [30, 45, 38, 55, 48, 70, 80],
  },
  {
    label: 'Avg Deal Value',
    value: 'EGP 6.2M',
    delta: '+5% MoM',
    up: true,
    color: '#34D399',
    spark: [55, 60, 52, 68, 65, 78, 88],
  },
  {
    label: 'Deals Closed',
    value: '97',
    delta: 'This month',
    up: true,
    color: '#7C3AED',
    spark: [20, 35, 28, 48, 42, 65, 75],
  },
  {
    label: 'Avg Response',
    value: '4.1s',
    delta: '-0.3s improved',
    up: true,
    color: '#C8961A',
    spark: [70, 65, 60, 55, 50, 45, 40],
  },
  {
    label: 'AI Match Rate',
    value: '98.2%',
    delta: '+0.4%',
    up: true,
    color: '#34D399',
    spark: [90, 92, 91, 95, 93, 97, 98],
  },
  {
    label: 'Pending Reviews',
    value: '23',
    delta: '3 urgent',
    up: false,
    color: '#E63946',
    spark: [10, 18, 12, 22, 17, 25, 23],
  },
  {
    label: 'Elite Brokers',
    value: '1,503',
    delta: '+45 this month',
    up: true,
    color: '#E9C176',
    spark: [60, 70, 68, 80, 75, 90, 95],
  },
];

const LEADS_DATA: Lead[] = [
  {
    name: 'Ahmed Al-Rashid',
    phone: '+20 100 111 2233',
    interest: 'Villa · Hyde Park · EGP 20M+',
    stage: 'Viewing Scheduled',
    color: '#C8961A',
    hot: true,
  },
  {
    name: 'Sara Mohamed',
    phone: '+20 101 222 3344',
    interest: '3-Bed · Mivida · Rent',
    stage: 'AI Matched',
    color: '#1E88D9',
    hot: false,
  },
  {
    name: 'Khalid Mansour',
    phone: '+971 50 333 4455',
    interest: 'Penthouse · Uptown · EGP 15M',
    stage: 'Contract Draft',
    color: '#34D399',
    hot: true,
  },
];

export default function OverviewPage() {
  const [kpis, setKpis] = useState<KPI[]>(KPI_DATA);
  const [leads, setLeads] = useState<Lead[]>(LEADS_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load real data from Firestore if available
        // For now, using mock data
        setLoading(false);
      } catch (err) {
        console.error('Failed to load overview data:', err);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <KPICard key={kpi.label} kpi={kpi} loading={loading} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline Chart */}
        <div className="lg:col-span-1 bg-[#0F2035] border border-white/8 rounded-xl p-4">
          <div className="text-xs font-bold tracking-widest uppercase text-[#C9A84C] mb-4">
            Pipeline · S1→S10
          </div>
          <PipelineChart />
        </div>

        {/* Hot Leads */}
        <div className="lg:col-span-1 bg-[#0F2035] border border-white/8 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <div className="text-xs font-bold tracking-widest uppercase text-[#C9A84C]">
              🔥 Hot Leads
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-[#E63946]/20 text-[#E63946] font-bold inline-block mt-2">
              3 urgent
            </span>
          </div>
          <LeadsList leads={leads.filter(l => l.hot)} />
        </div>

        {/* Agent Status */}
        <div className="lg:col-span-1 bg-[#0F2035] border border-white/8 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <div className="text-xs font-bold tracking-widest uppercase text-[#C9A84C]">
              Agent Status
            </div>
          </div>
          <div className="p-4">
            <AgentStatusList />
          </div>
        </div>
      </div>
    </div>
  );
}
