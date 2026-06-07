'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ══════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ══════════════════════════════════════════════════════════
const G = '#E9C176';
const G2 = '#C8961A';
const NAVY = '#0D2035';
const NAVY_DEEP = '#091828';
const IVORY = '#EFF8F7';

// ══════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════
const PINS = [
  { name: 'Mivida', units: 42, zone: '5th Settlement', left: 22, top: 30 },
  { name: 'Eastown', units: 17, zone: '5th Settlement', left: 40, top: 22 },
  { name: 'Hyde Park', units: 31, zone: '5th Settlement', left: 62, top: 28 },
  { name: 'Mountain View iCity', units: 24, zone: '5th Settlement', left: 78, top: 40 },
  { name: 'Madinaty', units: 56, zone: 'Madinaty', left: 70, top: 64 },
  { name: 'El Shorouk City', units: 18, zone: 'East Cairo', left: 33, top: 60 },
  { name: 'Mostakbal City', units: 29, zone: 'New Cairo', left: 50, top: 76 },
  { name: 'Villette', units: 11, zone: '5th Settlement', left: 18, top: 50 },
  { name: 'District 5', units: 38, zone: '5th Settlement', left: 56, top: 44 },
];

const UNIT_TEMPLATES = [
  { t: '3-Bed Villa', d: '245 m² · finished', p: 'EGP 12.5M' },
  { t: '2-Bed Apartment', d: '160 m² · semi-finished', p: 'EGP 4.9M' },
  { t: 'Penthouse', d: '310 m² · finished', p: 'EGP 18.2M' },
  { t: 'Twin House', d: '280 m² · core & shell', p: 'EGP 9.4M' },
  { t: 'Studio', d: '78 m² · furnished', p: '$650 / mo' },
];

type Pin = (typeof PINS)[number];

export default function MapPage() {
  const [active, setActive] = useState<Pin | null>(null);

  const rows = active
    ? Array.from({ length: Math.min(active.units, 5) }, (_, i) => UNIT_TEMPLATES[i % UNIT_TEMPLATES.length])
    : [];

  return (
    <div style={{ background: NAVY, color: IVORY, minHeight: '100vh', fontFamily: "'Jost', sans-serif" }}>
      {/* ══ TOPBAR ══ */}
      <header style={{ height: 68, borderBottom: `1px solid rgba(233,193,118,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: NAVY_DEEP }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <span style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg,${G2},${G})`, color: NAVY_DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: "'Cormorant Garamond', serif", fontSize: 20 }}>S</span>
          <span>
            <span style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em', color: G, lineHeight: 1 }}>SIERRA ESTATES</span>
            <span style={{ display: 'block', fontSize: 8, letterSpacing: '.3em', color: 'rgba(239,248,247,0.6)', marginTop: 2 }}>NEW CAIRO · REALTY</span>
          </span>
        </Link>
        <Link href="/" style={{ color: 'rgba(239,248,247,0.85)', textDecoration: 'none', fontSize: 13, fontWeight: 500, letterSpacing: '.06em' }}>← Back to home</Link>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px 80px', width: '100%' }}>
        {/* ══ HERO ══ */}
        <div style={{ textAlign: 'center', padding: '56px 0 8px' }}>
          <span style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', color: G, fontWeight: 600 }}>AI Support · Intelligence Map</span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 300, color: IVORY, letterSpacing: '-0.02em', margin: '12px 0 8px' }}>Map Intelligent Search</h1>
          <p style={{ fontSize: 15, color: 'rgba(239,248,247,0.7)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6, fontWeight: 300 }}>Live unit counts across New Cairo, Madinaty &amp; El Shorouk. Tap any compound to open its available units.</p>
        </div>

        {/* ══ MAP + SIDE ══ */}
        <div className="map-wrap" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 26, marginTop: 40, alignItems: 'start' }}>
          {/* MAP STAGE */}
          <div className="map-stage" style={{ position: 'relative', height: 560, borderRadius: 18, overflow: 'hidden', border: `1px solid rgba(233,193,118,0.18)`, background: `radial-gradient(circle at 30% 30%, rgba(27,108,168,0.10), transparent 50%), radial-gradient(circle at 70% 70%, rgba(200,150,26,0.08), transparent 50%), linear-gradient(135deg, #11293f, #0c1f33)`, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
            {/* grid lines */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(233,193,118,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(233,193,118,0.06) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
            {/* roads */}
            <div style={{ position: 'absolute', top: '48%', left: 0, right: 0, height: 3, background: 'rgba(233,193,118,0.10)' }} />
            <div style={{ position: 'absolute', left: '52%', top: 0, bottom: 0, width: 3, background: 'rgba(233,193,118,0.10)' }} />
            <div style={{ position: 'absolute', top: 0, left: '24%', bottom: 0, width: 2, background: 'rgba(233,193,118,0.10)', transform: 'rotate(8deg)' }} />

            {/* pins */}
            {PINS.map((p) => {
              const on = active?.name === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setActive(p)}
                  style={{ position: 'absolute', left: `${p.left}%`, top: `${p.top}%`, transform: `translate(-50%, -100%) scale(${on ? 1.12 : 1})`, cursor: 'pointer', textAlign: 'center', transition: 'all 300ms cubic-bezier(.16,1,.3,1)', background: 'none', border: 'none', zIndex: on ? 5 : 1, fontFamily: 'inherit' }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: '50%', margin: '0 auto', background: on ? '#fff' : G, boxShadow: on ? '0 0 0 7px rgba(233,193,118,0.4)' : '0 0 0 5px rgba(200,150,26,0.22), 0 4px 12px rgba(0,0,0,0.35)', border: '2px solid #fff' }} />
                  <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: IVORY, whiteSpace: 'nowrap', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{p.name}</div>
                  <div style={{ display: 'inline-block', marginTop: 3, fontSize: 10, fontWeight: 700, color: NAVY_DEEP, background: G, padding: '1px 8px', borderRadius: 999 }}>{p.units} units</div>
                </button>
              );
            })}
          </div>

          {/* SIDE PANEL */}
          <div style={{ background: '#fff', color: '#1C2430', border: `1px solid rgba(0,45,98,0.1)`, borderRadius: 18, padding: 24, minHeight: 560, boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
            {!active ? (
              <div style={{ color: '#9AA3AE', fontSize: 14, textAlign: 'center', padding: '80px 10px' }}>Select a compound pin to view its available units.</div>
            ) : (
              <>
                <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: G2 }}>{active.zone}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, margin: '4px 0 2px', color: '#002D62' }}>{active.name}</div>
                <div style={{ fontSize: 13, color: '#5A6475', marginBottom: 18 }}>{active.units} available units · {(5 + (active.units % 7) * 0.45).toFixed(1)}% avg. yield</div>
                {rows.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderTop: '1px solid rgba(0,45,98,0.1)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1C2430' }}>{r.t}</div>
                      <div style={{ fontSize: 12, color: '#9AA3AE' }}>{r.d}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: G2 }}>{r.p}</div>
                  </div>
                ))}
                <Link href="/listings" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 22, padding: '13px', borderRadius: 8, background: `linear-gradient(135deg,${G2},${G})`, color: NAVY_DEEP, fontWeight: 700, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}>See all {active.units} units →</Link>
              </>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 880px) {
          .map-wrap { grid-template-columns: 1fr !important; }
          .map-stage { height: 420px !important; }
        }
      `}</style>
    </div>
  );
}
