'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ══════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ══════════════════════════════════════════════════════════
const NAVY = '#0D2035';
const NAVY_DARK = '#091828';
const NAVY_CARD = '#122A47';
const G = '#E9C176';
const G2 = '#C8961A';

// ══════════════════════════════════════════════════════════
//  COMPOUND DATA
// ══════════════════════════════════════════════════════════
const COMPOUNDS = [
  { name: 'Hyde Park', zone: '5th Settlement', yield: 8.7 },
  { name: 'Mountain View iCity', zone: '5th Settlement', yield: 8.4 },
  { name: 'Uptown Cairo', zone: 'Uptown', yield: 8.1 },
  { name: 'Taj City', zone: 'New Cairo', yield: 7.9 },
  { name: 'Villette', zone: '5th Settlement', yield: 7.6 },
  { name: 'Mivida', zone: '5th Settlement', yield: 7.3 },
  { name: 'Palm Hills NC', zone: '5th Settlement', yield: 7.1 },
  { name: 'Eastown', zone: '5th Settlement', yield: 6.8 },
  { name: 'Madinaty', zone: 'Madinaty', yield: 6.5 },
];

const MAX_YIELD = COMPOUNDS[0].yield;

// ══════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════
export default function ROIPage() {
  const [price, setPrice] = useState(8000000);
  const [rent, setRent] = useState(40000);
  const [appr, setAppr] = useState(8);

  const gross = (rent * 12) / price * 100;
  const net = gross * 0.82;
  const fiveYr = ((rent * 12 * 5 * 0.82) + price * (Math.pow(1 + appr / 100, 5) - 1)) / price * 100;
  const payback = 100 / net;

  const fmt = (n: number, dec = 1) => n.toFixed(dec);
  const fmtPrice = (n: number) => {
    if (n >= 1_000_000) return `EGP ${(n / 1_000_000).toFixed(1)}M`;
    return `EGP ${(n / 1_000).toFixed(0)}K`;
  };
  const fmtRent = (n: number) => `EGP ${(n / 1_000).toFixed(0)}K`;

  return (
    <div style={{ background: NAVY, color: '#EFF8F7', minHeight: '100vh', fontFamily: "'Jost', sans-serif" }}>

      <style>{`
        .roi-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 40px; align-items: start; }
        .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; }
        @media (max-width: 900px) {
          .roi-grid { grid-template-columns: 1fr !important; }
          .result-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 500px) {
          .result-grid { grid-template-columns: 1fr; }
        }
        input[type='range'] {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: rgba(233,193,118,0.18);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C8961A, #E9C176);
          border: 2px solid #E9C176;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(233,193,118,0.4);
        }
        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C8961A, #E9C176);
          border: 2px solid #E9C176;
          cursor: pointer;
        }
      `}</style>

      {/* ══ TOPBAR ══ */}
      <header style={{ height: 68, borderBottom: '1px solid rgba(233,193,118,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: NAVY_DARK, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0 2px 6px rgba(233,193,118,0.3))' }}>
            <path d="M50 5 L85 20 V55 C85 75 50 95 50 95 C50 95 15 75 15 55 V20 L50 5 Z" fill={NAVY} stroke={G} strokeWidth="3" />
            <path d="M30 45 L45 30 L55 40 L70 25" stroke={G} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M30 60 L50 72 L70 60" stroke={G} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, letterSpacing: '.18em', color: G, lineHeight: 1 }}>SIERRA ESTATES</div>
            <div style={{ fontSize: 8, letterSpacing: '.3em', color: 'rgba(239,248,247,0.5)', marginTop: 2 }}>REALTY</div>
          </div>
        </div>
        <Link href="/" style={{ color: 'rgba(239,248,247,0.75)', textDecoration: 'none', fontSize: 13, fontWeight: 500, letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back to home
        </Link>
      </header>

      {/* ══ HERO ══ */}
      <section style={{ padding: '64px 40px 48px', textAlign: 'center', background: `linear-gradient(180deg, ${NAVY_DARK} 0%, ${NAVY} 100%)`, borderBottom: '1px solid rgba(233,193,118,0.12)' }}>
        <span style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: G, fontWeight: 600 }}>AI Intelligence · Investment</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px, 5vw, 64px)', fontWeight: 300, color: '#EFF8F7', letterSpacing: '-0.02em', margin: '14px 0 12px', lineHeight: 1.1 }}>
          Best <em style={{ fontStyle: 'italic', color: G }}>ROI</em> Analysis
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(239,248,247,0.65)', maxWidth: 560, margin: '0 auto', lineHeight: 1.75, fontWeight: 300 }}>
          Live yield leaderboard across New Cairo's premium compounds — plus an interactive calculator for gross and net returns.
        </p>
      </section>

      {/* ══ MAIN CONTENT ══ */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 40px 80px' }}>
        <div className="roi-grid">

          {/* ── LEFT: YIELD LEADERBOARD ── */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase', color: G, fontWeight: 600, marginBottom: 20 }}>
              Yield Leaderboard · New Cairo Compounds
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: NAVY_CARD, border: '1px solid rgba(233,193,118,0.12)', borderRadius: 14, overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 120px 80px', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(233,193,118,0.12)', fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(239,248,247,0.4)', fontFamily: "'Jost', sans-serif" }}>
                <span>#</span>
                <span>Compound</span>
                <span>Yield</span>
                <span style={{ textAlign: 'right' }}>%</span>
              </div>
              {COMPOUNDS.map((c, i) => {
                const barPct = (c.yield / MAX_YIELD) * 100;
                const isTop = i === 0;
                return (
                  <div
                    key={c.name}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr 120px 80px',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderBottom: i < COMPOUNDS.length - 1 ? '1px solid rgba(233,193,118,0.07)' : 'none',
                      background: isTop ? 'rgba(233,193,118,0.06)' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    {/* Rank */}
                    <span style={{ fontSize: 12, fontWeight: 700, color: isTop ? G : 'rgba(239,248,247,0.3)', fontFamily: "'DM Mono', monospace" }}>
                      {i + 1}
                    </span>
                    {/* Name + zone */}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: isTop ? '#EFF8F7' : 'rgba(239,248,247,0.85)', marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(239,248,247,0.4)', letterSpacing: '.08em' }}>{c.zone}</div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ paddingRight: 16 }}>
                      <div style={{ height: 4, background: 'rgba(233,193,118,0.12)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${barPct}%`, background: isTop ? `linear-gradient(90deg, ${G2}, ${G})` : `linear-gradient(90deg, rgba(199,150,26,0.5), rgba(233,193,118,0.5))`, borderRadius: 2, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                    {/* Yield % */}
                    <div style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 600, color: isTop ? G : 'rgba(233,193,118,0.75)' }}>
                      {c.yield}%
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(239,248,247,0.3)', lineHeight: 1.7, fontStyle: 'italic' }}>
              Yields are gross annual estimates based on current market rental rates and transaction data. Past performance does not guarantee future returns.
            </div>
          </div>

          {/* ── RIGHT: CALCULATOR ── */}
          <div style={{ position: 'sticky', top: 88 }}>
            <div style={{ fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase', color: G, fontWeight: 600, marginBottom: 20 }}>
              Interactive Yield Calculator
            </div>
            <div style={{ background: NAVY_CARD, border: '1px solid rgba(233,193,118,0.18)', borderRadius: 14, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>

              {/* Slider: Purchase Price */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <label style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(239,248,247,0.55)', fontFamily: "'Jost', sans-serif" }}>Purchase Price</label>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 600, color: G }}>{fmtPrice(price)}</span>
                </div>
                <input
                  type="range"
                  min={1500000}
                  max={30000000}
                  step={100000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(239,248,247,0.28)', marginTop: 5, fontFamily: "'DM Mono', monospace" }}>
                  <span>EGP 1.5M</span><span>EGP 30M</span>
                </div>
              </div>

              {/* Slider: Monthly Rent */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <label style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(239,248,247,0.55)', fontFamily: "'Jost', sans-serif" }}>Monthly Rent</label>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 600, color: G }}>{fmtRent(rent)}</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={250000}
                  step={1000}
                  value={rent}
                  onChange={(e) => setRent(Number(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(239,248,247,0.28)', marginTop: 5, fontFamily: "'DM Mono', monospace" }}>
                  <span>EGP 5K</span><span>EGP 250K</span>
                </div>
              </div>

              {/* Slider: Annual Appreciation */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <label style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(239,248,247,0.55)', fontFamily: "'Jost', sans-serif" }}>Annual Appreciation</label>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 600, color: G }}>{appr}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={0.5}
                  value={appr}
                  onChange={(e) => setAppr(Number(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(239,248,247,0.28)', marginTop: 5, fontFamily: "'DM Mono', monospace" }}>
                  <span>0%</span><span>20%</span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(233,193,118,0.12)', margin: '4px 0 20px' }} />

              {/* Results */}
              <div className="result-grid">
                {[
                  { label: 'Gross Yield', value: `${fmt(gross)}%`, sub: 'Annual pre-expenses' },
                  { label: 'Net Yield', value: `${fmt(net)}%`, sub: '−18% expenses' },
                  { label: '5-Yr Total Return', value: `${fmt(fiveYr, 0)}%`, sub: 'Rent + appreciation' },
                  { label: 'Payback Years', value: `${fmt(payback, 1)}y`, sub: 'Based on net yield' },
                ].map((r) => (
                  <div key={r.label} style={{ background: 'rgba(233,193,118,0.05)', border: '1px solid rgba(233,193,118,0.12)', borderRadius: 10, padding: '16px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(239,248,247,0.45)', marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>{r.label}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 600, color: G, lineHeight: 1, marginBottom: 6 }}>{r.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(239,248,247,0.32)', fontFamily: "'Jost', sans-serif" }}>{r.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, fontSize: 10, color: 'rgba(239,248,247,0.3)', lineHeight: 1.65, textAlign: 'center' }}>
                Net yield = Gross × 0.82 · 5-yr includes capital appreciation
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
