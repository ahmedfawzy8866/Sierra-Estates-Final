'use client';
/**
 * SIERRA ESTATES 1.0 — TIER 1 CLIENT HUB
 * Deployed to Vercel (sierrablu.vercel.app)
 * Read-only Firestore listener (zero-latency updates)
 */
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy, DocumentData } from 'firebase/firestore';
import { clientDb } from '@/lib/firebase/client';

const COMPOUNDS_21 = [
  'Mountain View iCity','Hyde Park','Mivida','Uptown Cairo','Madinaty',
  'Eastown','El Shorouk','Palm Hills NC','Villette','Al Rehab','Taj City',
  'Sarai','Swan Lake','Katameya Heights','Golden Square','Beit Al Watan',
  'Mostakbal City','Al Andalous','Cairo Festival City','Sodic East','MNHD',
];
const QUICK_12 = COMPOUNDS_21.slice(0, 12);

interface Property extends DocumentData {
  id: string;
  title: string;
  compound: string;
  priceLabel: string;
  img: string;
  beds: number;
  baths: number;
  area: string;
  aiScore: number;
  netCapitalRoi?: number;
  annualAppreciationPct?: number;
}

export default function ClientHub() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeCompound, setActiveCompound] = useState<string>('all');
  const [showAllCompounds, setShowAllCompounds] = useState(false);
  const [showTour, setShowTour] = useState<Property | null>(null);

  useEffect(() => {
    const q = query(
      collection(clientDb, 'properties'),
      where('status', '==', 'active'),
      orderBy('aiScore', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setProperties(snap.docs.map(d => ({ id: d.id, ...d.data() } as Property)));
    }, err => {
      console.error("Firestore Error:", err);
    });
    return () => unsub();
  }, []);

  const filtered = activeCompound === 'all'
    ? properties
    : properties.filter(p => p.compound === activeCompound);

  const displayedCompounds = showAllCompounds ? COMPOUNDS_21 : QUICK_12;

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)] font-sans pb-24 transition-colors duration-500">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h4 className="text-xs font-mono text-[var(--secondary)] tracking-[0.2em] mb-4">
          EGYPT'S PREMIER PROPERTY INTELLIGENCE
        </h4>
        <h1 className="text-5xl md:text-7xl font-serif text-[var(--primary)] mb-6">
          Find Your Place in <br/>
          <span className="gold-text">
            New Cairo.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-[var(--on-surface-variant)] text-lg">
          Live inventory. AI-driven matching. Zero-latency updates.
        </p>
      </section>

      {/* Filter Matrix */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setActiveCompound('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
              activeCompound === 'all' 
                ? 'bg-[var(--secondary)] text-[var(--on-secondary)] shadow-ambient' 
                : 'glass text-[var(--on-surface)] hover:border-[var(--secondary)]'
            }`}
          >
            All Areas
          </button>
          
          {displayedCompounds.map(c => (
            <button
              key={c}
              onClick={() => setActiveCompound(c)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                activeCompound === c 
                  ? 'bg-[var(--secondary)] text-[var(--on-secondary)] shadow-ambient' 
                  : 'glass text-[var(--on-surface)] hover:border-[var(--secondary)]'
              }`}
            >
              {c}
            </button>
          ))}

          <button
            onClick={() => setShowAllCompounds(!showAllCompounds)}
            className="px-5 py-2.5 rounded-full text-xs font-mono tracking-widest uppercase transition-all duration-300 bg-[var(--outline-variant)] text-[var(--on-surface)] hover:bg-[var(--outline-variant)]"
          >
            {showAllCompounds ? '− Show Less' : '+ More Areas'}
          </button>
        </div>
      </section>

      {/* 4-Column High-Density Grid */}
      <section className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center justify-between mb-8 border-b border-[var(--outline-variant)] pb-4">
          <div className="text-sm font-mono tracking-widest text-[var(--on-surface-variant)]">
            {filtered.length} ACTIVE LISTINGS {activeCompound !== 'all' && `IN ${activeCompound.toUpperCase()}`}
          </div>
          <div className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE SYNC
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(p => (
            <div key={p.id} className="group glass rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-ambient transition-all duration-300">
              
              {/* Image & Badges */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-[var(--primary)]/20 z-10"></div>
                <img 
                  src={p.img || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'} 
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* AI Investment Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[var(--primary)]/90 backdrop-blur-md border border-[var(--secondary)] rounded-lg p-2 shadow-lg">
                  <div className={`text-xl font-bold leading-none ${p.aiScore >= 8 ? 'text-emerald-400' : p.aiScore >= 6 ? 'text-amber-400' : 'text-red-400'}`}>
                    {p.aiScore?.toFixed(1) || '8.5'}
                  </div>
                  <div className="text-[8px] font-mono tracking-widest text-[var(--secondary)] uppercase leading-tight">
                    AI<br/>Score
                  </div>
                </div>

                {/* Virtual Tour FAB */}
                <button 
                  onClick={() => setShowTour(p)}
                  className="absolute bottom-4 right-4 z-20 w-12 h-12 glass rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)]">
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"></path>
                    <rect x="3" y="6" width="12" height="12" rx="2" ry="2"></rect>
                  </svg>
                </button>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="text-[10px] font-mono tracking-widest text-[var(--secondary)] mb-2 uppercase">
                  {p.compound}
                </div>
                <h3 className="text-xl font-serif text-[var(--primary)] mb-4 truncate">
                  {p.title}
                </h3>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-[var(--on-surface-variant)] mb-6 pb-6 border-b border-[var(--outline-variant)]">
                  <span className="flex items-center gap-1">🛏 {p.beds} bd</span>
                  <span className="flex items-center gap-1">🚿 {p.baths} ba</span>
                  <span className="flex items-center gap-1">📐 {p.area}</span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[9px] font-mono tracking-widest text-[var(--on-surface-variant)] mb-1 uppercase">
                      Asking Price
                    </div>
                    <div className="text-lg font-bold text-[var(--primary)]">
                      {p.priceLabel}
                    </div>
                  </div>
                  
                  {p.netCapitalRoi && (
                    <div className="text-right">
                      <div className="text-[9px] font-mono tracking-widest text-emerald-400 mb-1 uppercase">
                        Net ROI
                      </div>
                      <div className="text-sm font-bold text-emerald-400">
                        +{p.netCapitalRoi}%/yr
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-32 text-[var(--on-surface-variant)]">
            <div className="text-4xl mb-4">🏜️</div>
            <div className="text-sm font-mono tracking-widest uppercase">No listings found in this area</div>
          </div>
        )}
      </section>

      {/* Virtual Tour Modal */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[var(--primary)]/80 backdrop-blur-md">
          <div className="bg-[var(--surface)] w-full max-w-6xl h-[80vh] rounded-2xl overflow-hidden shadow-2xl border border-[var(--outline-variant)] flex flex-col animate-[fadeUp_0.4s_ease-out]">
            
            <div className="flex items-center justify-between p-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono tracking-widest text-[var(--secondary)] uppercase">
                  3D Virtual Tour
                </span>
                <span className="text-sm font-serif text-[var(--primary)] hidden md:inline">
                  {showTour.title}
                </span>
              </div>
              <button 
                onClick={() => setShowTour(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full glass hover:bg-[var(--outline-variant)] text-[var(--primary)] transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 relative flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-[var(--outline-variant)] border-t-[var(--secondary)] rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-xs font-mono tracking-widest text-[var(--secondary)]/50">
                  LOADING PANORAMIC ENGINE...
                </div>
              </div>
              <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm" style={{ backgroundImage: `url(${showTour.img})` }}></div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
