'use client';

import { useEffect, useRef, useState } from 'react';
import FilterBar from './FilterBar';
import Link from 'next/link';

// ── Animated Counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(ease * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

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

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden"
      style={{
        background: `
          linear-gradient(180deg, rgba(250,248,243,0.35) 0%, rgba(250,248,243,0.88) 68%, rgba(250,248,243,1) 100%),
          radial-gradient(ellipse at top center, rgba(200,150,26,0.13) 0%, transparent 58%),
          radial-gradient(ellipse at bottom right, rgba(230,57,70,0.06) 0%, transparent 52%),
          url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=2400&q=85&auto=format&fit=crop')
        `,
        backgroundSize: 'cover, auto, auto, cover',
        backgroundPosition: 'center, center, center, center',
        backgroundAttachment: 'scroll, scroll, scroll, fixed',
      }}
    >
      {/* Background Gradient Orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200,150,26,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 110%, rgba(230,57,70,0.05) 0%, transparent 60%)
          `,
        }}
      />

      <div
        className={`relative z-10 max-w-5xl w-full text-center transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* ── Logo Mark with Aura ──────────────────────────────────── */}
        <div className="inline-block mb-7 relative" style={{ isolation: 'isolate' }}>
          {/* Aura ring */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: '-40px',
              background: 'radial-gradient(circle, rgba(230,57,70,0.22) 0%, rgba(200,150,26,0.10) 40%, transparent 70%)',
              animation: 'aura-pulse 4s ease-in-out infinite',
              zIndex: -1,
            }}
          />
          {/* Logo SVG */}
          <div className="relative mx-auto" style={{ width: 120, height: 120 }}>
            <svg
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(0 6px 32px rgba(230,57,70,0.38))',
                width: '100%',
                height: '100%',
              }}
            >
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#E63946"/>
                  <stop offset="100%" stopColor="#B71C2C"/>
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="57" stroke="url(#logoGrad)" strokeWidth="2" fill="none" opacity="0.25"/>
              <path d="M60 18L96 42V78L60 102L24 78V42L60 18Z" fill="url(#logoGrad)"/>
              <path d="M60 30L84 46V74L60 90L36 74V46L60 30Z" fill="rgba(250,248,243,0.12)"/>
              <text
                x="60" y="68"
                textAnchor="middle"
                fill="#FAF8F3"
                fontSize="26"
                fontWeight="700"
                fontFamily="'Cormorant Garamond', serif"
                letterSpacing="3"
              >SB</text>
            </svg>
          </div>
        </div>

        {/* ── Live Badge ───────────────────────────────────────────── */}
        <div
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-[rgba(200,150,26,0.3)] px-5 py-2 rounded-full mb-7 shadow-sm"
          style={{ animation: 'fade-in 600ms 200ms both' }}
        >
          <span
            className="w-2 h-2 rounded-full bg-green-500"
            style={{ animation: 'pulse-live 2s ease-in-out infinite' }}
          />
          <span
            className="text-[var(--navy)] text-[10px] uppercase tracking-[0.22em] font-semibold"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Egypt&rsquo;s Premier Property Intelligence
          </span>
        </div>

        {/* ── Headline ─────────────────────────────────────────────── */}
        <h1
          className="font-light leading-[1.06] tracking-tight mb-5"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            color: 'var(--navy)',
            animation: 'reveal-up 700ms 300ms both',
          }}
        >
          Find Your Place in{' '}
          <br className="hidden sm:block" />
          <span
            className="italic"
            style={{
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light), var(--gold))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            New Cairo.
          </span>
        </h1>

        {/* ── Subheading ───────────────────────────────────────────── */}
        <p
          className="text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed mb-10"
          style={{
            color: 'var(--navy-60)',
            animation: 'reveal-up 700ms 450ms both',
          }}
        >
          From premium villas to luxury apartments.{' '}
          <strong className="font-semibold" style={{ color: 'var(--gold)' }}>1,500+ elite brokers</strong>,
          AI-driven matching, and replies within{' '}
          <strong className="font-semibold" style={{ color: 'var(--red)' }}>4 seconds</strong>.
        </p>

        {/* ── Filter Bar ───────────────────────────────────────────── */}
        <div style={{ animation: 'reveal-up 700ms 600ms both' }}>
          <FilterBar
            onFilter={(filters) => {
              const el = document.getElementById('listings-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* ── Quick CTA Links ──────────────────────────────────────── */}
        <div
          className="flex flex-wrap justify-center gap-4 mt-6 text-[12px]"
          style={{ animation: 'reveal-up 700ms 700ms both' }}
        >
          {[
            { label: '→ For Rent',   href: '/listings?purpose=rent' },
            { label: '→ For Resale', href: '/listings?purpose=resale' },
            { label: '→ New Projects', href: '/projects' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-semibold uppercase tracking-[0.15em] transition-colors duration-200"
              style={{ color: 'var(--navy-60)', fontFamily: 'var(--font-mono)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--navy-60)')}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Stats Counter Row ────────────────────────────────────── */}
        <div
          className="mt-12 flex justify-center gap-10 md:gap-16 text-center"
          style={{ animation: 'reveal-up 700ms 800ms both' }}
        >
          {[
            { value: 1500, suffix: '+', label: 'Brokers' },
            { value: 25916, suffix: '',  label: 'Properties' },
            { value: 4,    suffix: 's',  label: 'Response' },
            { value: 98,   suffix: '%',  label: 'Match Rate' },
          ].map(({ value, suffix, label }) => (
            <div key={label}>
              <p
                className="text-3xl font-bold leading-none mb-1"
                style={{ color: 'var(--gold)' }}
              >
                <Counter target={value} suffix={suffix} />
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.18em]"
                style={{ color: 'var(--navy-40)', fontFamily: 'var(--font-mono)' }}
              >
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
