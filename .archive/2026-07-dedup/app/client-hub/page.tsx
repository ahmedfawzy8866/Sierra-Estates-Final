'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, Building2, TrendingUp, Sparkles, PhoneCall, ChevronRight } from 'lucide-react';

// Dynamic import for 3D/Map components to prevent SSR issues
const ObsidianNetworkBg = dynamic(() => import('@/components/UI/ObsidianNetworkBg'), { ssr: false });
const InteractiveCrmMap = dynamic(() => import('@/components/UI/InteractiveCrmMap'), { ssr: false });

export default function ClientHub() {
  const [activeView, setActiveView] = useState('map'); // 'map', 'grid'

  return (
    <div className="relative min-h-screen bg-[#FAF9F5] dark:bg-[#02050A] text-[#0A1A2B] dark:text-[#EFF8F7] font-sans selection:bg-[#C9A84C] selection:text-[#02050A]">
      
      {/* Dynamic Background depending on theme - Using the Obsidian background in dark mode */}
      <div className="hidden dark:block">
        <ObsidianNetworkBg />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 flex flex-col min-h-screen pb-20">
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#02050A]/80 backdrop-blur-md border-b border-[#C9A84C]/20 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="font-playfair text-2xl tracking-widest text-[#0A1A2B] dark:text-white uppercase">Sierra</h1>
            <div className="hidden md:block h-4 w-px bg-[#C9A84C]/30 mx-2" />
            <span className="hidden md:block font-mono text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase mt-1">Client Hub 3.1</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A84C]" />
              <input 
                type="text" 
                placeholder="Search properties, zones, or IDs..." 
                className="w-64 pl-10 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-[#C9A84C]/20 rounded-full text-xs outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>
            <button className="px-5 py-2 bg-[#C9A84C] text-[#02050A] rounded-full text-xs font-bold tracking-wider uppercase hover:scale-105 transition-transform shadow-[0_4px_14px_rgba(201,168,76,0.4)]">
              Leila Concierge
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-12 md:py-20 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-mono text-[10px] text-[#C9A84C] tracking-[0.3em] uppercase mb-6 animate-pulse">
              Intelligent Real Estate
            </p>
            <h2 className="font-playfair text-4xl md:text-6xl font-light mb-6 leading-tight">
              Curated living spaces,<br />
              <span className="text-[#C9A84C] italic">matched by AI.</span>
            </h2>
            <p className="text-sm opacity-60 leading-relaxed font-light">
              Explore New Cairo's most exclusive compounds. Our AI engine analyzes your preferences, market velocity, and lifestyle requirements to surface perfect matches instantly.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { label: 'Active Listings', value: '412', icon: <Building2 className="w-4 h-4 text-[#C9A84C]" /> },
              { label: 'Avg ROI', value: '18.4%', icon: <TrendingUp className="w-4 h-4 text-[#C9A84C]" /> },
              { label: 'AI Matches', value: '1,204', icon: <Sparkles className="w-4 h-4 text-[#C9A84C]" /> },
              { label: 'Advisors Online', value: '14', icon: <PhoneCall className="w-4 h-4 text-[#C9A84C]" /> },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-[#C9A84C]/10 flex flex-col items-center justify-center text-center hover:border-[#C9A84C]/30 transition-colors">
                <div className="mb-3 p-3 rounded-full bg-[#C9A84C]/10">{stat.icon}</div>
                <div className="font-mono text-2xl font-light mb-1">{stat.value}</div>
                <div className="font-mono text-[9px] uppercase tracking-widest opacity-50">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Map & Inventory Section */}
        <section className="px-6 pb-20 max-w-[1400px] mx-auto w-full flex-1 flex flex-col">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-playfair text-2xl mb-1">Explore Territory</h3>
              <p className="font-mono text-[10px] text-[#C9A84C] tracking-[0.2em] uppercase">Interactive Map View</p>
            </div>
            <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg border border-[#C9A84C]/20">
              <button 
                onClick={() => setActiveView('map')}
                className={`px-4 py-2 text-xs font-mono rounded-md transition-colors ${activeView === 'map' ? 'bg-[#C9A84C] text-black shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
              >
                Map
              </button>
              <button 
                onClick={() => setActiveView('grid')}
                className={`px-4 py-2 text-xs font-mono rounded-md transition-colors ${activeView === 'grid' ? 'bg-[#C9A84C] text-black shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
              >
                Grid
              </button>
            </div>
          </div>

          {/* Refined Map View */}
          <div className="flex-1 min-h-[600px] rounded-2xl overflow-hidden border border-[#C9A84C]/20 relative bg-black/5 dark:bg-[#02050A]/60 backdrop-blur-sm shadow-xl">
            {activeView === 'map' ? (
              <div className="absolute inset-0">
                <InteractiveCrmMap />
              </div>
            ) : (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full overflow-y-auto">
                {/* Mock Grid Items */}
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="group rounded-xl overflow-hidden bg-white/80 dark:bg-white/5 border border-[#C9A84C]/10 hover:border-[#C9A84C]/40 transition-colors cursor-pointer">
                    <div className="h-48 bg-black/10 dark:bg-black/40 relative overflow-hidden">
                      <div className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-[#C9A84C]/30 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-[9px] text-[#C9A84C] uppercase tracking-wider">AI Verified</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="font-mono text-[10px] text-[#C9A84C] uppercase tracking-widest mb-2">Mountain View iCity</div>
                      <h4 className="font-playfair text-xl mb-4">4-Bedroom Grand Villa</h4>
                      <div className="flex justify-between items-center pt-4 border-t border-black/5 dark:border-white/10">
                        <span className="font-mono text-sm font-bold">EGP 24.5M</span>
                        <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:text-[#C9A84C] transition-all group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Sidebar Overlay on Map */}
            {activeView === 'map' && (
              <div className="absolute top-6 left-6 bottom-6 w-80 bg-white/90 dark:bg-[#02050A]/90 backdrop-blur-xl border border-[#C9A84C]/20 rounded-xl flex flex-col overflow-hidden shadow-2xl pointer-events-auto z-[1000]">
                <div className="p-5 border-b border-[#C9A84C]/10">
                  <h4 className="font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#C9A84C]" /> 
                    Live Filters
                  </h4>
                  <select className="w-full bg-black/5 dark:bg-white/5 border border-[#C9A84C]/20 rounded-lg p-2 text-xs outline-none focus:border-[#C9A84C]">
                    <option>All Zones (New Cairo)</option>
                    <option>Golden Square</option>
                    <option>Mostakbal City</option>
                  </select>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {[
                    { name: 'Mountain View iCity', price: 'EGP 24.5M', ai: '9.8' },
                    { name: 'Hyde Park', price: 'EGP 18.2M', ai: '9.5' },
                    { name: 'Mivida', price: 'EGP 32.0M', ai: '9.4' },
                    { name: 'Eastown', price: 'EGP 15.5M', ai: '9.1' },
                  ].map((compound, i) => (
                    <div key={i} className="p-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-transparent hover:border-[#C9A84C]/30 transition-all cursor-pointer">
                      <div className="font-mono text-[9px] text-[#C9A84C] tracking-widest uppercase mb-1">Score: {compound.ai}</div>
                      <div className="font-medium text-sm mb-2">{compound.name}</div>
                      <div className="font-mono text-xs opacity-70">From {compound.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
