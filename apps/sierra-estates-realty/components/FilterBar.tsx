'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ── Filter State ─────────────────────────────────────────────────────────────
export interface FilterState {
  search:    string;
  purpose:   'all' | 'rent' | 'resale';
  type:      string;
  beds:      number;
  baths:     number;
  minPrice:  number;
  maxPrice:  number;
  furnish:   string[];
  amenities: string[];
}

export const DEFAULT_FILTERS: FilterState = {
  search:    '',
  purpose:   'all',
  type:      'all',
  beds:      0,
  baths:     0,
  minPrice:  200,
  maxPrice:  15000,
  furnish:   [],
  amenities: [],
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const ChevronDown = ({ open }: { open: boolean }) => (
  <svg
    className={`w-3.5 h-3.5 text-[var(--gold)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

// ── Dropdown Wrapper ──────────────────────────────────────────────────────────
function Dropdown({
  id, label, value, isOpen, onToggle, onClose, children,
}: {
  id: string; label: string; value: string; isOpen: boolean;
  onToggle: () => void; onClose: () => void; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener('click', handler), 0);
    return () => { clearTimeout(t); document.removeEventListener('click', handler); };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        id={`filter-${id}`}
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-[13px] font-medium text-[var(--navy)] transition-all duration-200 whitespace-nowrap ${
          isOpen
            ? 'border-[var(--gold)] shadow-[0_0_0_3px_rgba(200,150,26,0.15)]'
            : 'border-[var(--navy-15)] hover:border-[var(--gold)]/60'
        }`}
      >
        <span>{value || label}</span>
        <ChevronDown open={isOpen} />
      </button>
      {isOpen && (
        <div
          className="absolute top-[calc(100%+8px)] left-0 min-w-[240px] bg-white border border-[var(--navy-08)] rounded-xl shadow-xl p-4 z-[var(--z-dropdown)]"
          style={{ animation: 'slide-down 180ms var(--ease-silk) forwards' }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ── Main Filter Bar ───────────────────────────────────────────────────────────
interface FilterBarProps {
  compact?:    boolean;
  initialFilters?: Partial<FilterState>;
  onFilter?:   (filters: FilterState) => void;
}

export default function FilterBar({ compact = false, initialFilters, onFilter }: FilterBarProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, ...initialFilters });
  const [open, setOpen] = useState<string | null>(null);

  const toggle = useCallback((key: string) => setOpen((o) => (o === key ? null : key)), []);
  const close  = useCallback(() => setOpen(null), []);

  const update = useCallback(
    (patch: Partial<FilterState>) => setFilters((f) => ({ ...f, ...patch })),
    []
  );

  // Price range display
  const priceLabel = (v: number) => `$${v.toLocaleString()}`;
  const rentPct = ((filters.maxPrice - 200) / (15000 - 200)) * 100;

  const handleSearch = () => {
    close();
    if (onFilter) {
      onFilter(filters);
      return;
    }
    const p = new URLSearchParams();
    if (filters.search)                 p.set('q',       filters.search);
    if (filters.purpose !== 'all')      p.set('purpose', filters.purpose);
    if (filters.type    !== 'all')      p.set('type',    filters.type);
    if (filters.beds   > 0)            p.set('beds',    String(filters.beds));
    if (filters.maxPrice < 15000)      p.set('maxPrice', String(filters.maxPrice));
    router.push(`/listings?${p.toString()}`);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-md border border-[var(--navy-08)] max-w-3xl">
        <div className="flex-1 flex items-center gap-2 px-3 py-2">
          <SearchIcon />
          <input
            type="text"
            id="compact-search"
            placeholder="Search properties…"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-transparent outline-none text-sm text-[var(--navy)] placeholder-[var(--navy-40)]"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-5 py-2 bg-gradient-to-r from-[var(--red)] to-[var(--red-deep)] text-white rounded-lg text-[11px] font-bold uppercase tracking-[0.18em] transition-all hover:opacity-90"
        >
          Find
        </button>
      </div>
    );
  }

  return (
    <div
      id="main-filter-bar"
      className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl shadow-xl border border-[var(--navy-08)] max-w-5xl mx-auto"
    >
      {/* Search Input */}
      <div className="flex-1 min-w-[180px] flex items-center gap-3 px-4 py-2.5 bg-[var(--bg-subtle-30)] border border-[var(--navy-08)] rounded-xl">
        <span className="text-[var(--navy-40)]"><SearchIcon /></span>
        <input
          id="filter-search"
          type="text"
          placeholder="City, compound, or building…"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 bg-transparent outline-none text-[13px] text-[var(--navy)] placeholder-[var(--navy-40)]"
        />
      </div>

      {/* Purpose */}
      <Dropdown
        id="purpose" label="Purpose"
        value={filters.purpose === 'all' ? 'Any' : filters.purpose === 'rent' ? 'Rent' : 'Resale'}
        isOpen={open === 'purpose'} onToggle={() => toggle('purpose')} onClose={close}
      >
        <div className="space-y-1">
          {[{ k: 'all', l: 'Any' }, { k: 'rent', l: 'For Rent' }, { k: 'resale', l: 'For Resale' }].map((o) => (
            <button
              key={o.k}
              onClick={() => { update({ purpose: o.k as FilterState['purpose'] }); close(); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                filters.purpose === o.k
                  ? 'bg-[var(--gold)] text-white'
                  : 'text-[var(--navy)] hover:bg-[var(--bg-subtle-50)]'
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </Dropdown>

      {/* Type */}
      <Dropdown
        id="type" label="Type"
        value={filters.type === 'all' ? 'Any Type' : filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}
        isOpen={open === 'type'} onToggle={() => toggle('type')} onClose={close}
      >
        <div className="space-y-1">
          {['all', 'apartment', 'villa', 'penthouse', 'twin', 'townhouse', 'duplex', 'studio'].map((t) => (
            <button
              key={t}
              onClick={() => { update({ type: t }); close(); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] capitalize font-medium transition-all ${
                filters.type === t
                  ? 'bg-[var(--gold)] text-white'
                  : 'text-[var(--navy)] hover:bg-[var(--bg-subtle-50)]'
              }`}
            >
              {t === 'all' ? 'Any Type' : t}
            </button>
          ))}
        </div>
      </Dropdown>

      {/* Beds & Baths */}
      <Dropdown
        id="beds" label="Beds & Baths"
        value={filters.beds === 0 ? 'Beds' : `${filters.beds}+ Beds`}
        isOpen={open === 'beds'} onToggle={() => toggle('beds')} onClose={close}
      >
        <div className="min-w-[240px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--navy-60)] mb-2">Bedrooms</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5, 6].map((b) => (
              <button
                key={b}
                onClick={() => update({ beds: b })}
                className={`w-11 h-10 rounded-lg text-[12px] font-bold transition-all ${
                  filters.beds === b
                    ? 'bg-[var(--gold)] text-white shadow-[var(--shadow-gold)]'
                    : 'bg-[var(--bg-subtle-50)] text-[var(--navy)] hover:bg-[var(--gold)]/15'
                }`}
              >
                {b === 0 ? 'Any' : b === 6 ? '6+' : b}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--navy-60)] mb-2">Bathrooms</p>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map((b) => (
              <button
                key={b}
                onClick={() => update({ baths: b })}
                className={`w-11 h-10 rounded-lg text-[12px] font-bold transition-all ${
                  filters.baths === b
                    ? 'bg-[var(--gold)] text-white shadow-[var(--shadow-gold)]'
                    : 'bg-[var(--bg-subtle-50)] text-[var(--navy)] hover:bg-[var(--gold)]/15'
                }`}
              >
                {b === 0 ? 'Any' : b === 5 ? '5+' : b}
              </button>
            ))}
          </div>
        </div>
      </Dropdown>

      {/* Rent Price Range $200 – $15,000/month */}
      <Dropdown
        id="price" label="Price"
        value={filters.purpose === 'rent'
          ? (filters.maxPrice < 15000 ? `$${filters.maxPrice.toLocaleString()}/mo` : 'Any Price')
          : (filters.maxPrice < 15000 ? `Up to $${filters.maxPrice.toLocaleString()}` : 'Any Price')}
        isOpen={open === 'price'} onToggle={() => toggle('price')} onClose={close}
      >
        <div className="min-w-[280px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--navy-60)] mb-3">
            {filters.purpose === 'resale' ? 'Max Price (EGP)' : 'Max Rent / Month ($)'}
          </p>
          <input
            type="range"
            min={200}
            max={15000}
            step={filters.purpose === 'rent' ? 100 : 500}
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
            className="sb-range w-full"
            style={{ '--val': `${rentPct}%` } as React.CSSProperties}
          />
          <div className="flex justify-between mt-2 text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
            <span className="text-[var(--navy-40)]">$200</span>
            <span className="font-bold text-[var(--gold)]">
              {priceLabel(filters.maxPrice)}{filters.purpose === 'rent' ? '/mo' : ''}
            </span>
            <span className="text-[var(--navy-40)]">$15K</span>
          </div>
        </div>
      </Dropdown>

      {/* More Filters */}
      <Dropdown
        id="more" label="More"
        value="Filters"
        isOpen={open === 'more'} onToggle={() => toggle('more')} onClose={close}
      >
        <div className="min-w-[260px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--navy-60)] mb-2">Furnishing</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['Furnished', 'Semi-Furnished', 'Unfurnished'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  const arr = filters.furnish;
                  update({ furnish: arr.includes(f) ? arr.filter((x) => x !== f) : [...arr, f] });
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  filters.furnish.includes(f)
                    ? 'bg-[var(--gold)] text-white'
                    : 'bg-[var(--bg-subtle-50)] text-[var(--navy)] hover:bg-[var(--gold)]/15'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--navy-60)] mb-2">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {['Garden', 'Pool', 'Parking', 'Security', 'Gym', 'Concierge'].map((a) => (
              <button
                key={a}
                onClick={() => {
                  const arr = filters.amenities;
                  update({ amenities: arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a] });
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  filters.amenities.includes(a)
                    ? 'bg-[var(--gold)] text-white'
                    : 'bg-[var(--bg-subtle-50)] text-[var(--navy)] hover:bg-[var(--gold)]/15'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </Dropdown>

      {/* Search CTA */}
      <button
        id="filter-search-btn"
        onClick={handleSearch}
        className="px-8 py-3 bg-gradient-to-r from-[var(--red)] to-[var(--red-deep)] hover:from-[#FF4D5A] hover:to-[var(--red)] text-white rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-[var(--shadow-red)] transition-all duration-300 ease-silk active:scale-95"
      >
        Find
      </button>
    </div>
  );
}
