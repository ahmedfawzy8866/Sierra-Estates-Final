"use client";
import React, { useState, useEffect } from 'react';
import ShieldLogo from '../Landing/ShieldLogo';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  themeOverride?: 'dark' | 'light';
  /** 'wordmark' = horizontal text logo | 'emblem' = SVG shield | 'shield' = official PNG shield mark (default) */
  variant?: 'wordmark' | 'emblem' | 'shield';
}

/**
 * BRAND LOGO — Sierra Blu Realty
 *
 * variant="wordmark" (default):
 *   Strategic Double-Panel Crop. Source image (/sierra-blu-logo.jpg) contains two
 *   logo variants side-by-side. Left 50% = dark variant, Right 50% = light variant.
 *   We clip via overflow-hidden and slide the image to reveal the correct half.
 *
 * variant="emblem":
 *   Gold shield crest (/sierra-blu-emblem.svg). Scales uniformly.
 *   Ideal for: favicons, chat widget headers, loading screens, app icons.
 */
export default function BrandLogo({
  size = 'md',
  themeOverride,
  variant = 'shield',
}: BrandLogoProps) {
  const [currentTheme, setCurrentTheme] = useState('dark');

  useEffect(() => {
    if (themeOverride) {
      setCurrentTheme(themeOverride);
      return;
    }
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      setCurrentTheme(theme);
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [themeOverride]);

  // ── Wordmark sizes (horizontal banner) ──────────────────────────────────
  const wordmarkSizes = {
    sm: { width: 120, height: 48 },
    md: { width: 160, height: 64 },
    lg: { width: 300, height: 120 },
    xl: { width: 440, height: 176 },
  };

  // ── Emblem sizes (square shield) ────────────────────────────────────────
  const emblemSizes = {
    sm: { width: 40, height: 44 },
    md: { width: 56, height: 62 },
    lg: { width: 96, height: 106 },
    xl: { width: 160, height: 176 },
  };

  const isLight = currentTheme === 'light';

  // ── SHIELD & EMBLEM VARIANTS (Red Shield + Gemini sparkle SVG) ───────────
  if (variant === 'shield' || variant === 'emblem') {
    const { width } = emblemSizes[size];
    return <ShieldLogo size={width} />;
  }

  // ── WORDMARK VARIANT (Red Shield Logo next to styled Sierra Estates text) ─
  const { width } = wordmarkSizes[size];
  return (
    <div className="flex items-center gap-3 select-none cursor-pointer" style={{ width: 'max-content' }}>
      <ShieldLogo size={size === 'sm' ? 32 : size === 'md' ? 42 : size === 'lg' ? 64 : 84} />
      <div className="flex flex-col">
        <span 
          className="font-playfair font-bold tracking-[0.1em] leading-none"
          style={{
            fontSize: size === 'sm' ? '14px' : size === 'md' ? '18px' : size === 'lg' ? '28px' : '36px',
            color: isLight ? '#071422' : '#ffffff',
          }}
        >
          SIERRA ESTATES
        </span>
        <span 
          className="font-mono text-[#C9A84C] font-semibold uppercase tracking-[0.25em] mt-1"
          style={{
            fontSize: size === 'sm' ? '7px' : size === 'md' ? '8px' : size === 'lg' ? '10px' : '12px',
          }}
        >
          The future of Real Estates
        </span>
      </div>
    </div>
  );
}
