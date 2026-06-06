'use client';

import { useState } from 'react';

// ── Icons ─────────────────────────────────────────────────────────────────────
const BedIcon   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>;
const BathIcon  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M2 12h20"/><path d="M7 19v2"/><path d="M17 19v2"/></svg>;
const AreaIcon  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>;
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
  </svg>
);

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Property {
  id:         string | number;
  title:      string;
  compound:   string;
  price:      number;
  priceLabel: string;
  beds:       number;
  baths:      number;
  area:       string;
  type:       string;
  purpose:    'rent' | 'resale';
  img:        string;
  status?:    'verified' | 'owner';
  badge?:     string;
  pf_id?:     string;
}

interface PropertyCardProps {
  property:  Property;
  index?:    number;
  onClick?:  () => void;
  href?:     string;
}

// ── Badge Colors ──────────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  PREMIUM:  'bg-[var(--gold)]',
  HOT:      'bg-[var(--red)]',
  NEW:      'bg-blue-500',
  FEATURED: 'bg-purple-600',
  TRENDING: 'bg-emerald-600',
};

export default function PropertyCard({ property: p, index = 0, onClick, href }: PropertyCardProps) {
  const [saved, setSaved]   = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const delay = `${index * 80}ms`;
  const cardHref = href || `/listings/${p.id}`;

  const badgeColor = BADGE_COLORS[p.badge || ''] || 'bg-[var(--gold)]';
  const purposeClass = p.purpose === 'rent'
    ? 'bg-blue-500/85 text-white'
    : 'bg-emerald-600/85 text-white';

  return (
    <article
      className="stagger-child"
      style={{ animationDelay: delay }}
      itemScope
      itemType="https://schema.org/RealEstateListing"
    >
      <div
        onClick={onClick}
        className="group bg-[var(--bg-card)] border border-[var(--navy-08)] rounded-[var(--radius-xl)] overflow-hidden cursor-pointer"
        style={{
          transition: `all var(--transition-slow) var(--ease-silk)`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.boxShadow = '';
        }}
      >
        {/* ── Image Area ─────────────────────────────────────── */}
        <div className="relative h-56 overflow-hidden bg-[var(--ivory-mid)]">
          {!imgErr ? (
            <img
              src={p.img}
              alt={p.title}
              onError={() => setImgErr(true)}
              className="w-full h-full object-cover transition-transform duration-700 ease-silk group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--ivory)] to-[var(--ivory-mid)]">
              <span className="text-[var(--navy-40)] text-sm font-medium">Image unavailable</span>
            </div>
          )}

          {/* Badge row */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
            {p.badge && (
              <span
                className={`${badgeColor} text-white px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-[0.15em] shadow-sm`}
              >
                {p.badge}
              </span>
            )}
            <span
              className={`${purposeClass} ml-auto px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-[0.15em] backdrop-blur-md`}
            >
              {p.purpose === 'rent' ? 'For Rent' : 'For Resale'}
            </span>
          </div>

          {/* Live indicator */}
          {p.status === 'owner' && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-live" />
              <span className="text-[9px] font-bold text-green-600 uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>
                Live
              </span>
            </div>
          )}

          {/* Save / Heart */}
          <button
            aria-label={saved ? 'Remove from saved' : 'Save property'}
            className="absolute bottom-3 right-3 w-8 h-8 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-auto transition-all duration-200 hover:bg-[var(--red)] hover:text-white"
            style={{ color: saved ? 'var(--red)' : 'var(--navy-60)' }}
            onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
          >
            <HeartIcon filled={saved} />
          </button>
        </div>

        {/* ── Content ─────────────────────────────────────────── */}
        <div className="p-5">
          <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--navy-40)' }} itemProp="name">
            {p.compound}
          </p>
          <h3
            className="text-xl font-semibold mb-2 leading-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--navy)' }}
            itemProp="name"
          >
            {p.title}
          </h3>
          <p className="text-2xl font-bold mb-3" style={{ color: 'var(--gold)' }} itemProp="price">
            {p.priceLabel}
            {p.purpose === 'rent' && (
              <span className="text-xs font-normal ml-1" style={{ color: 'var(--navy-40)' }}>/mo</span>
            )}
          </p>

          {/* Specs */}
          <div
            className="flex gap-4 text-[12px] pt-3 border-t"
            style={{ borderColor: 'var(--navy-08)', color: 'var(--navy-60)' }}
          >
            <span className="flex items-center gap-1.5">
              <span style={{ color: 'var(--gold)' }}><BedIcon /></span>
              {p.beds} bd
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ color: 'var(--gold)' }}><BathIcon /></span>
              {p.baths} ba
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ color: 'var(--gold)' }}><AreaIcon /></span>
              {p.area} sqft
            </span>
            {p.pf_id && (
              <span className="ml-auto text-[10px]" style={{ color: 'var(--navy-40)', fontFamily: 'var(--font-mono)' }}>
                {p.pf_id}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
