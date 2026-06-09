'use client';

/**
 * Sierra Estates — PROPERTY PORTAL (client marketplace)
 * Ported from the uploaded Sierra Estates luxury portal design.
 * Wired to live Firestore inventory via the useSierraEstates hook.
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, MapPin, BedDouble, Bath, Video, Maximize2, X } from 'lucide-react';
import { useSierraEstates } from '@/hooks/useSierraEstates';

// ── Normalize a loose Firestore unit into the shape the portal renders ──
interface PortalUnit {
  id: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  area: string;
  type: string;
  compound: string;
  image: string | null;
  status: string;
  roi: number;
  live: boolean;
}

function normalize(u: Record<string, any>, i: number): PortalUnit {
  const image =
    u.imageUrl ||
    (Array.isArray(u.images) ? (typeof u.images[0] === 'string' ? u.images[0] : u.images[0]?.url) : null) ||
    null;
  const status = String(u.status ?? 'available');
  return {
    id: String(u.id ?? i),
    title: u.title || u.name || 'Untitled Residence',
    price: Number(u.price) || 0,
    beds: Number(u.bedrooms ?? u.rooms ?? u.beds ?? 0),
    baths: Number(u.bathrooms ?? u.baths ?? 0),
    area: String(u.area ?? u.size ?? '—'),
    type: String(u.propertyType || u.type || 'property').toLowerCase(),
    compound: u.compound || u.location || 'New Cairo',
    image,
    status,
    roi: Number(u.intelligence?.roi ?? u.roi ?? 0),
    live: status.toLowerCase() === 'available' && !!(u.ownerDirect ?? u.fromOwner),
  };
}

const fmtM = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`);

// ── Filter dropdown (collapsible) ───────────────────────────────────────
function FilterGroup({ label, children, defaultOpen = false }: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
          open
            ? 'border-[#C8961A]/50 bg-[#C8961A]/8'
            : 'border-[#071422]/10 bg-[#071422]/[0.04] hover:border-[#C8961A]/30'
        }`}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#071422] dark:text-[#F4F0E8]">{label}</span>
        <ChevronDown size={15} className={`text-[#C8961A] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[420px] mt-2' : 'max-h-0'}`}>
        <div className="p-3 space-y-2 bg-white dark:bg-[#0d2035] border border-[#071422]/10 dark:border-white/10 rounded-xl">{children}</div>
      </div>
    </div>
  );
}

// ── Live map panel with price pins ──────────────────────────────────────
function LiveMap({ units }: { units: PortalUnit[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div className="relative w-full h-[480px] rounded-2xl border border-[#071422]/10 dark:border-white/10 overflow-hidden bg-gradient-to-br from-[#f9f7f3] to-[#f0ede5] dark:from-[#0b1a2e] dark:to-[#0f2035]">
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #C8961A12 0%, transparent 50%), radial-gradient(circle at 70% 60%, #E6394612 0%, transparent 50%)' }}
      />
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(rgba(200,150,26,0.6) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
      {units.map((p, i) => {
        const left = 12 + ((i * 37) % 76);
        const top = 14 + ((i * 53) % 66);
        const active = hovered === p.id;
        return (
          <button
            key={p.id}
            style={{ left: `${left}%`, top: `${top}%` }}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
          >
            <div
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                active
                  ? 'bg-[#071422] text-white scale-110 shadow-lg'
                  : 'bg-white border border-[#071422]/20 text-[#071422] hover:bg-[#C8961A] hover:text-white'
              }`}
            >
              <MapPin size={11} />
              <span>EGP {fmtM(p.price)}</span>
            </div>
            {active && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 w-48 bg-white dark:bg-[#0d2035] border border-[#071422]/15 dark:border-white/10 rounded-xl p-3 shadow-xl">
                <p className="text-xs font-semibold text-[#071422] dark:text-[#F4F0E8] mb-1 truncate">{p.title}</p>
                <p className="text-[10px] text-[#071422]/60 dark:text-white/50">
                  {p.beds} bd · {p.baths} ba · {p.area} m²
                </p>
              </div>
            )}
          </button>
        );
      })}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 dark:bg-[#071422]/80 backdrop-blur-md rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-wider">Live · {units.length}</span>
      </div>
    </div>
  );
}

// ── Property card ───────────────────────────────────────────────────────
function PropertyCard({ p, i, onTour }: { p: PortalUnit; i: number; onTour: (p: PortalUnit) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (i % 6) * 0.07 }}
      className="group bg-white dark:bg-[#0d2035] border border-[#071422]/8 dark:border-white/10 hover:border-[#C8961A]/40 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl"
    >
      <div className="relative h-56 overflow-hidden bg-[#f0ede5] dark:bg-[#0b1a2e]">
        {p.image ? (
          <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#071422]/20 to-[#C8961A]/10">
            <span className="text-[#071422]/30 dark:text-white/30 text-xs uppercase tracking-widest">No Image</span>
          </div>
        )}

        <button
          onClick={() => onTour(p)}
          className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#071422]/85 backdrop-blur-md border border-[#C8961A]/30 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C8961A] hover:bg-[#C8961A] hover:text-[#071422] transition-all"
        >
          <Video size={12} /> Tour
        </button>

        {p.roi > 0 && (
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-[#C8961A] text-[#071422] rounded-full text-[10px] font-bold">{p.roi}% ROI</div>
        )}

        {p.live && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase">Live</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2 gap-3">
          <h3 className="font-serif text-lg font-light text-[#071422] dark:text-[#F4F0E8] leading-snug">{p.title}</h3>
          <span className="text-[10px] font-mono text-[#C8961A] font-bold uppercase shrink-0">{p.status}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#071422]/60 dark:text-white/50 mb-3">
          <MapPin size={13} /> <span>{p.compound}</span>
        </div>
        <p className="text-lg font-bold text-[#071422] dark:text-[#F4F0E8] mb-4">EGP {(p.price / 1_000_000).toFixed(2)}M</p>
        <div className="flex gap-4 text-[10px] text-[#071422]/60 dark:text-white/50 font-mono">
          <span className="flex items-center gap-1"><BedDouble size={14} /> {p.beds} beds</span>
          <span className="flex items-center gap-1"><Bath size={14} /> {p.baths} baths</span>
          <span className="flex items-center gap-1"><Maximize2 size={13} /> {p.area} m²</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Portal ──────────────────────────────────────────────────────────────
export default function PropertyPortal() {
  const { units, loading, error } = useSierraEstates();
  const [type, setType] = useState('all');
  const [beds, setBeds] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50_000_000);
  const [search, setSearch] = useState('');
  const [tour, setTour] = useState<PortalUnit | null>(null);

  const all = useMemo(() => (units || []).map(normalize), [units]);

  const filtered = useMemo(
    () =>
      all.filter((p) => {
        if (type !== 'all' && p.type !== type) return false;
        if (beds && p.beds < beds) return false;
        if (p.price > maxPrice) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (!p.title.toLowerCase().includes(q) && !p.compound.toLowerCase().includes(q) && !p.type.includes(q)) return false;
        }
        return true;
      }),
    [all, type, beds, maxPrice, search],
  );

  const reset = () => {
    setType('all');
    setBeds(0);
    setMaxPrice(50_000_000);
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-[#F4F0E8] dark:bg-[#071422] text-[#071422] dark:text-[#F4F0E8] transition-colors duration-700">
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(circle at center 30%, rgba(200,150,26,0.10) 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#071422]/[0.06] dark:bg-white/10 border border-[#C8961A]/30 px-5 py-2 rounded-full">
            <span className="text-[#C8961A] tracking-[0.2em] uppercase text-[10px] font-mono font-semibold">Egypt’s first New Cairo luxury portal</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-light leading-[1.08]">
            The First Exclusive Destination for{' '}
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#C8961A] via-[#E9C176] to-[#C8961A]">New Cairo Properties.</span>
          </h1>
          <p className="font-serif text-xl text-[#071422]/70 dark:text-white/60">Rent &amp; Resale.</p>

          {/* Search */}
          <div className="pt-2 w-full max-w-xl mx-auto">
            <div className="bg-white/95 dark:bg-[#0d2035]/95 border border-[#071422]/15 dark:border-white/10 p-2.5 rounded-2xl flex items-center shadow-[0_20px_60px_rgba(0,0,0,0.1)] group hover:border-[#C8961A]/50 transition-all">
              <div className="p-2 bg-[#C8961A]/10 rounded-xl mx-2">
                <Search size={16} className="text-[#C8961A]" />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search by property, compound or type…"
                className="w-full bg-transparent outline-none text-sm placeholder-[#071422]/40 dark:placeholder-white/40"
              />
              <button className="bg-gradient-to-r from-[#C8961A] to-[#E9C176] text-[#071422] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-1.5">
                <SlidersHorizontal size={14} /> Filter
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="pt-6 flex justify-center gap-8">
            {[
              { v: `${all.length || '—'}`, l: 'Listings' },
              { v: '1,500+', l: 'Brokers' },
              { v: '98%', l: 'Match Rate' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-2xl font-bold text-[#C8961A]">{s.v}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#071422]/50 dark:text-white/40">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTER + MAP ── */}
      <section className="px-6 md:px-12 max-w-[1500px] mx-auto pb-16">
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          <aside className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-[#C8961A]" /> Smart Filter
            </h3>
            <FilterGroup label="Property Type" defaultOpen>
              {['all', 'villa', 'apartment', 'penthouse', 'duplex', 'townhouse'].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="type" checked={type === t} onChange={() => setType(t)} className="w-4 h-4 accent-[#C8961A]" />
                  <span className="text-xs capitalize text-[#071422]/70 dark:text-white/60">{t}</span>
                </label>
              ))}
            </FilterGroup>
            <FilterGroup label="Bedrooms">
              {[0, 1, 2, 3, 4, 5].map((b) => (
                <label key={b} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="beds" checked={beds === b} onChange={() => setBeds(b)} className="w-4 h-4 accent-[#C8961A]" />
                  <span className="text-xs text-[#071422]/70 dark:text-white/60">{b === 0 ? 'Any' : b + (b === 5 ? '+' : '')}</span>
                </label>
              ))}
            </FilterGroup>
            <FilterGroup label="Max Price" defaultOpen>
              <input type="range" min={1_000_000} max={50_000_000} step={500_000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[#C8961A]" />
              <p className="text-xs font-mono text-[#071422]/60 dark:text-white/50">EGP {fmtM(maxPrice)}</p>
            </FilterGroup>
            <button onClick={reset} className="mt-2 px-4 py-2 bg-[#071422] text-white rounded-lg text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#C8961A] hover:text-[#071422] transition-all">
              Reset
            </button>
          </aside>

          <div>
            <h2 className="font-serif text-3xl mb-6">Live Property Map</h2>
            <LiveMap units={filtered} />
            <p className="text-[10px] text-[#071422]/50 dark:text-white/40 mt-3 text-center">
              {error ? `Error: ${error}` : `${filtered.length} matching ${filtered.length === 1 ? 'property' : 'properties'} · hover a pin to preview`}
            </p>
          </div>
        </div>
      </section>

      {/* ── LISTINGS GRID ── */}
      <section className="px-6 md:px-12 max-w-[1500px] mx-auto pb-24">
        <h2 className="font-serif text-3xl mb-8">Featured Properties</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-56 bg-[#071422]/10 dark:bg-white/10 rounded-2xl mb-4" />
                <div className="h-4 bg-[#071422]/10 dark:bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#071422]/10 dark:bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => (
              <PropertyCard key={p.id} p={p} i={i} onTour={setTour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[#071422]/50 dark:text-white/40">No properties match your filters. Try widening your search.</div>
        )}
      </section>

      {/* ── VIRTUAL TOUR MODAL ── */}
      {tour && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setTour(null)}>
          <div className="bg-white dark:bg-[#0d2035] rounded-2xl max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-serif text-2xl text-[#071422] dark:text-[#F4F0E8]">Virtual Tour · {tour.title}</h3>
              <button onClick={() => setTour(null)} className="text-[#071422]/50 dark:text-white/50 hover:text-[#C8961A]"><X size={20} /></button>
            </div>
            <div className="w-full h-80 bg-gradient-to-br from-[#C8961A]/10 to-[#E63946]/10 rounded-xl flex items-center justify-center mb-6">
              <div className="text-center">
                <Video size={56} className="text-[#C8961A]/40 mx-auto mb-2" />
                <p className="text-sm text-[#071422]/50 dark:text-white/40">Interactive 360° tour loading…</p>
              </div>
            </div>
            <button onClick={() => setTour(null)} className="w-full py-3 bg-[#071422] text-white rounded-lg font-semibold hover:bg-[#C8961A] hover:text-[#071422] transition-all">
              Close Tour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
