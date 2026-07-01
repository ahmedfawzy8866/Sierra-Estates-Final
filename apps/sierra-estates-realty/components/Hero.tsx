'use client';
/**
 * SIERRA ESTATES MOBILE DESIGN — Refined Professional Edition
 * Updated 2026-06-29: Enhanced with carousel, shimmer animations, fluid interactions
 */

import { useEffect, useState } from 'react';
import FilterBar from './FilterBar';
import Link from 'next/link';

// ── SLIDE DATA ────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    pre: 'FIRST & ONLY WEBSITE IN EGYPT DESIGNED FOR NEW CAIRO',
    main: 'The First Exclusive Destination for New Cairo Properties. Rent & Resale.',
    img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=85',
  },
  {
    pre: 'BEST-IN-CLASS DESIGN',
    main: 'Redefining Luxury Living with AI-Driven Excellence',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85',
  },
  {
    pre: 'AI-DRIVEN EXCELLENCE',
    main: 'Smart Matches for Smart Investors',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85',
  },
  {
    pre: 'EXCLUSIVE NETWORK',
    main: 'Unrivaled Access to Premium Compounds',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85',
  },
  {
    pre: 'CURATED PORTFOLIO',
    main: 'Your Journey to Exceptional Homes Begins Here',
    img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=85',
  },
];

// ── Scroll Indicator ──────────────────────────────────────────────────────────
function ScrollCue() {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10" style={{ animation: 'bounce-down 2s infinite' }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="rgba(7,20,34,0.4)" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v14M12 16l-4-4M12 16l4-4" />
      </svg>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export default function Hero() {
  const [visible, setVisible] = useState(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  // Carousel auto-rotate every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Initial fade-in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const currentSlide = HERO_SLIDES[currentSlideIdx];

  return (
    <section
      id="hero"
      className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(172deg, rgba(0,10,25,.95) 0%, rgba(0,25,55,.72) 50%, rgba(0,0,0,.2) 100%), url('${currentSlide.img}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background-image 0.8s ease-in-out',
      }}
    >
      {/* Background Gradient Overlay (Professional polish) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#C9A96E]/8 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0D2035]/15 rounded-full blur-[150px] mix-blend-multiply" />
      </div>

      <div
        className={`relative z-10 max-w-5xl w-full text-center transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* ── Logo: RED NEON DESIGN (Refined Placement) ──────────────────────────────────── */}
        <div className="inline-block mb-8 relative" style={{ isolation: 'isolate' }}>
          <div className="relative mx-auto" style={{ width: 100, height: 100 }}>
            <svg
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(0 8px 40px rgba(230,57,70,0.42))',
                width: '100%',
                height: '100%',
              }}
            >
              {/* RED NEON LOGO - Shield with building silhouette */}
              <defs>
                <linearGradient id="redNeon" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF1744"/>
                  <stop offset="100%" stopColor="#D50000"/>
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="57" stroke="url(#redNeon)" strokeWidth="2" fill="none" opacity="0.25"/>
              <path d="M60 18L96 42V78L60 102L24 78V42L60 18Z" fill="url(#redNeon)"/>
              <path d="M50 35v40M60 35v40M70 35v40M50 55h20M55 45h10" stroke="#FAF8F3" strokeWidth="2" opacity="0.85"/>
            </svg>
          </div>
        </div>

        {/* ── Status Badge (Refined styling) ───────────────────────────────────────────── */}
        <div
          className="inline-flex items-center gap-2 bg-white/6 backdrop-blur-md border border-amber-400/35 px-5 py-2.5 rounded-full mb-8 shadow-lg"
          style={{ animation: 'fade-in 600ms 180ms both' }}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-lg" style={{ boxShadow: '0 0 8px rgba(251,191,36,0.6)' }} />
          <span className="text-white/85 text-[9.5px] uppercase tracking-[0.24em] font-semibold">
            {currentSlide.pre}
          </span>
        </div>

        {/* ── Headline with Shimmer Animation ─────────────────────────── */}
        <h1
          className="font-light leading-[1.08] tracking-tight mb-6 text-white"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2.6rem, 7.5vw, 5.2rem)',
            background: 'linear-gradient(110deg, #fff 0%, #F9E79F 25%, #FDBC8 50%, #F9E79F 75%, #fff 100%)',
            backgroundSize: '300% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 6s linear infinite',
          }}
        >
          {currentSlide.main}
        </h1>

        {/* ── Subheading ───────────────────────────────────────────── */}
        <p className="text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed mb-6 text-white/75">
          21 compounds · <strong className="font-semibold text-amber-300/95">1,200+ units</strong> · AI-curated for you.
        </p>

        {/* ── Carousel Indicators ─────────────────────────────────── */}
        <div className="flex gap-1.5 justify-center mb-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlideIdx(i)}
              className="transition-all duration-500"
              style={{
                height: '3px',
                width: i === currentSlideIdx ? '24px' : '7px',
                borderRadius: '2px',
                background: i === currentSlideIdx ? '#F9D923' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>

        {/* ── Filter Bar (Refined) ───────────────────────────────────────────── */}
        <div style={{ animation: 'fade-in 600ms 280ms both' }}>
          <FilterBar
            onFilter={(_filters) => {
              const el = document.getElementById('listings-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* ── AI ICONS SECTION (Refined with hover animations) ──────────────────────────────────────────── */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto px-2" style={{ animation: 'fade-in 600ms 360ms both' }}>
          {[
            { icon: '🎥', label: 'Virtual Tour', desc: 'Immersive 360°' },
            { icon: '🗺️', label: 'Map Intel', desc: 'Compound live' },
            { icon: '📈', label: 'ROI Calc', desc: 'Yield analysis' },
            { icon: '🤖', label: 'AI Match', desc: 'Smart select' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 bg-white/6 border border-white/12 rounded-xl text-center transition-all duration-300 hover:bg-white/12 hover:border-amber-400/40 hover:shadow-lg group"
              style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)' }}
            >
              <div className="text-3.5xl mb-2.5 transition-transform group-hover:scale-110">{item.icon}</div>
              <p className="text-xs font-semibold text-white uppercase tracking-[0.12em]">{item.label}</p>
              <p className="text-[9px] text-white/55 mt-1.5">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Quick CTA Links (Refined) ──────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-5 mt-10 text-[11px]">
          {[
            { label: '→ For Rent',   href: '/listings?purpose=rent' },
            { label: '→ For Resale', href: '/listings?purpose=resale' },
            { label: '→ New Projects', href: '/projects' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-semibold uppercase tracking-[0.16em] transition-all duration-300 text-white/65 hover:text-amber-300 hover:tracking-[0.2em]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Stats Row (Professional styling) ────────────────────────────────── */}
        <div className="mt-14 flex justify-center gap-8 md:gap-14 text-center">
          {[
            { value: 1500, suffix: '+', label: 'Brokers' },
            { value: 1200, suffix: '',  label: 'Units' },
            { value: 4,    suffix: 's',  label: 'Response' },
            { value: 21,   suffix: '',  label: 'Compounds' },
          ].map(({ value, suffix, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-light leading-none mb-2 text-amber-300">
                {value.toLocaleString()}{suffix}
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/35 font-medium">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Cue */}
      <ScrollCue />
    </section>
  );
}
