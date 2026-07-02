'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Activity, ShieldAlert, Cpu, Network, Users, Database } from 'lucide-react';

// Dynamically import the 3D background so it only renders on the client
const ObsidianNetworkBg = dynamic(() => import('@/components/UI/ObsidianNetworkBg'), {
  ssr: false,
});

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('telemetry');

  return (
    <div className="relative min-h-screen bg-[#02050A] text-[#EFF8F7] font-sans selection:bg-[#C9A84C] selection:text-[#02050A]">
      {/* 3D Background */}
      <ObsidianNetworkBg />

      {/* Glassmorphic Overlay Layer */}
      <div className="absolute inset-0 z-10 p-4 md:p-8 flex flex-col pointer-events-none">
        
        {/* Top Header */}
        <header className="flex justify-between items-end mb-8 pointer-events-auto">
          <div>
            <h1 className="font-playfair text-3xl md:text-4xl font-light text-white tracking-widest uppercase mb-1">
              Obsidian Core
            </h1>
            <p className="font-mono text-xs text-[#C9A84C] tracking-[0.3em] uppercase">
              Sierra Estates • Command Center
            </p>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="px-4 py-2 bg-[#0A1520]/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">Network Online</span>
            </div>
            <div className="px-4 py-2 bg-[#0A1520]/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-3">
              <ShieldAlert size={14} className="text-[#C9A84C]" />
              <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">Auth Level: Alpha</span>
            </div>
          </div>
        </header>

        {/* Main Dashboard Layout */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pointer-events-auto">
          
          {/* Sidebar Navigation */}
          <nav className="lg:col-span-3 flex flex-col gap-2">
            {[
              { id: 'telemetry', label: 'Spatial Telemetry', icon: <Cpu size={16} /> },
              { id: 'inventory', label: 'Inventory Index', icon: <Database size={16} /> },
              { id: 'signals', label: 'Live Signals', icon: <Activity size={16} /> },
              { id: 'advisory', label: 'Advisory Network', icon: <Network size={16} /> },
              { id: 'clients', label: 'Sovereign Clients', icon: <Users size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl border backdrop-blur-md transition-all text-left group ${
                  activeTab === tab.id
                    ? 'bg-[#C9A84C]/10 border-[#C9A84C]/30 text-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.1)]'
                    : 'bg-[#0A1520]/40 border-white/5 text-white/50 hover:bg-[#0A1520]/60 hover:text-white'
                }`}
              >
                <div className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {tab.icon}
                </div>
                <span className="font-mono text-[11px] uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
            
            {/* System Specs Box */}
            <div className="mt-auto p-5 rounded-xl bg-[#0A1520]/40 backdrop-blur-md border border-white/5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-white/50">
                <span className="font-mono text-[9px] uppercase tracking-widest">CPU Load</span>
                <span className="font-mono text-[9px] text-[#C9A84C]">14.2%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[14%] bg-[#C9A84C] rounded-full" />
              </div>
              <div className="flex justify-between items-center text-white/50 pt-2">
                <span className="font-mono text-[9px] uppercase tracking-widest">Memory</span>
                <span className="font-mono text-[9px] text-[#C9A84C]">4.8 GB</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[38%] bg-[#C9A84C] rounded-full" />
              </div>
            </div>
          </nav>

          {/* Data Panels Area */}
          <section className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[500px]">
            
            {/* Panel 1 */}
            <div className="rounded-2xl bg-[#0A1520]/40 backdrop-blur-xl border border-white/10 p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={120} />
              </div>
              <h3 className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em] mb-8">
                Network Activity Stream
              </h3>
              
              <div className="space-y-4 flex-1">
                {[
                  { time: '14:23:09', msg: 'Incoming inquiry: Uptown Cairo Villa', level: 'high' },
                  { time: '14:21:44', msg: 'System node rebalancing completed', level: 'low' },
                  { time: '14:18:12', msg: 'AI matching engine generated 12 leads', level: 'medium' },
                  { time: '14:15:00', msg: 'Database sync with CRM verified', level: 'low' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0">
                    <span className="font-mono text-[9px] text-white/30 pt-0.5">{log.time}</span>
                    <p className={`font-mono text-[10px] ${log.level === 'high' ? 'text-[#C9A84C]' : 'text-white/70'}`}>
                      {log.msg}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2 */}
            <div className="rounded-2xl bg-[#0A1520]/40 backdrop-blur-xl border border-white/10 p-6 flex flex-col">
              <h3 className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em] mb-8">
                Inventory Status Map
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-playfair text-6xl text-white mb-2 font-light">412</div>
                  <div className="font-mono text-[10px] text-[#C9A84C] uppercase tracking-widest">Active Listings Online</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/10 pt-6">
                <div>
                  <div className="font-mono text-xs text-white mb-1">18%</div>
                  <div className="font-mono text-[8px] text-white/40 uppercase tracking-widest">Velocity Increase</div>
                </div>
                <div>
                  <div className="font-mono text-xs text-white mb-1">$2.8B</div>
                  <div className="font-mono text-[8px] text-white/40 uppercase tracking-widest">Total Valuation</div>
                </div>
              </div>
            </div>
            
          </section>
        </main>
      </div>
    </div>
  );
}
