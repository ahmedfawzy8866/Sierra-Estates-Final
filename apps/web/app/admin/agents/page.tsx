'use client';

import React from 'react';
import { Shield, BrainCircuit, Users, Activity, Settings2, RefreshCw } from 'lucide-react';

export default function AgentControlCenter() {
  const agents = [
    {
      id: 'core-orchestrator',
      name: 'Orchestrator Agent (The Conductor)',
      role: 'Central Nervous System & Dispatcher',
      status: 'online',
      tasksHandled: 1542,
      lastActive: 'Just now',
      icon: <BrainCircuit className="h-6 w-6 text-purple-500" />
    },
    {
      id: 'memory-obedian',
      name: 'Obedian (Memory & Data Architect)',
      role: 'Persistent Knowledge & Context Keeper',
      status: 'online',
      tasksHandled: 8903,
      lastActive: '2 mins ago',
      icon: <Activity className="h-6 w-6 text-blue-500" />
    },
    {
      id: 'leila-concierge',
      name: 'Leila (Lead Concierge)',
      role: 'Front-line User Interaction & Lead Qualifying',
      status: 'active',
      tasksHandled: 230,
      lastActive: 'Active in 3 conversations',
      icon: <Users className="h-6 w-6 text-pink-500" />
    },
    {
      id: 'system-sentinel',
      name: 'System Sentinel',
      role: 'Infrastructure & Reliability Watcher',
      status: 'monitoring',
      tasksHandled: 42,
      lastActive: 'Watching logs',
      icon: <Shield className="h-6 w-6 text-emerald-500" />
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
            Agent Control Center
          </h1>
          <p className="text-[#3a5570] mt-2 text-sm">
            Monitor and manually intervene with autonomous agents across the Sierra Estates network.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm">
          <RefreshCw className="h-4 w-4" />
          Sync Agents
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(3,22,50,0.1)] transition-all border border-[#f3f4f5] flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-2 mb-4 border-b border-[#f3f4f5] pb-4">
                <h3 className="text-xs font-bold text-[#071422] uppercase tracking-widest max-w-[170px] truncate">
                  {agent.name}
                </h3>
                {agent.icon}
              </div>
              <div>
                <div className="text-3xl font-bold text-[#031632] mb-1 font-display">{agent.tasksHandled}</div>
                <p className="text-xs text-[#3a5570]/60 mb-4 uppercase tracking-wider font-semibold">Operations handled</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#3a5570]/60">Role:</span>
                    <span className="font-semibold text-[#071422] text-right max-w-[150px] truncate">{agent.role}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-[#3a5570]/60">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      agent.status === 'online' || agent.status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#3a5570]/60">Last Ping:</span>
                    <span className="font-semibold text-[#071422]">{agent.lastActive}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f3f4f5] flex justify-end">
              <button className="text-xs flex items-center gap-1 text-[#3a5570] hover:text-[#031632] transition font-medium">
                <Settings2 className="h-3 w-3" />
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] border border-[#f3f4f5]">
          <div className="pb-4 border-b border-[#f3f4f5] mb-6">
            <h2 className="font-bold text-[#071422] text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Memory Explorer (Obedian)
            </h2>
          </div>
          <div>
            <div className="rounded-xl border border-[#f3f4f5] bg-[#f8f9fa] p-5 font-mono text-xs leading-relaxed">
              <div className="flex justify-between items-center mb-4 border-b border-[#f3f4f5] pb-2">
                <span className="text-[#3a5570]/60 font-semibold uppercase tracking-wider">Global Knowledge Graph</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700">
                  Connected
                </span>
              </div>
              <p className="text-green-600 font-semibold mb-1">✓ System state synchronized</p>
              <p className="text-green-600 font-semibold mb-1">✓ 1,245 user preferences indexed</p>
              <p className="text-green-600 font-semibold">✓ Vector cache warmed up</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] border border-[#f3f4f5]">
          <div className="pb-4 border-b border-[#f3f4f5] mb-6">
            <h2 className="font-bold text-[#071422] text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Manual Intervention Queue
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-12 w-12 text-[#3a5570]/40 mb-4" />
            <h3 className="text-base font-bold text-[#071422] mb-1">No alerts requiring human override.</h3>
            <p className="text-xs text-[#3a5570]/70 max-w-sm leading-relaxed">
              The Orchestrator will escalate items here if an agent reaches its confidence threshold or requests permission for a destructive action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
