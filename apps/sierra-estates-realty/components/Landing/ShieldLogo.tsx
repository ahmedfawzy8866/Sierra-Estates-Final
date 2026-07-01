'use client';

export default function ShieldLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 120 138" fill="none" className="transition-transform duration-300 hover:scale-105">
      <defs>
        {/* Rich Red Gradient for Sierra Estates Shield Border */}
        <linearGradient id="sbl-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF4141" />
          <stop offset="50%" stopColor="#C62828" />
          <stop offset="100%" stopColor="#7F0000" />
        </linearGradient>
        
        {/* Deep Dark Space/Navy inner shield for maximum contrast */}
        <linearGradient id="sbl-dark-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1320" />
          <stop offset="100%" stopColor="#03070F" />
        </linearGradient>

        {/* Google Gemini Sparkle Gradient (sky-blue to violet-pink) */}
        <linearGradient id="gemini-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4EA5E9" />
          <stop offset="50%" stopColor="#A259FF" />
          <stop offset="100%" stopColor="#FF007F" />
        </linearGradient>

        {/* Elegant Platinum Accent for internal structural lines */}
        <linearGradient id="sbl-platinum" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Star Glow Filter */}
        <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shield Inner Clip */}
        <clipPath id="sbl-clip">
          <path d="M60 8L106 25V78Q106 114 60 130Q14 114 14 78V25Z" />
        </clipPath>
      </defs>

      {/* Outer Shield Crest Border */}
      <path d="M60 2L112 21V79Q112 122 60 138Q8 122 8 79V21Z" fill="url(#sbl-red)" />
      
      {/* Inner Shield Background */}
      <path d="M60 8L106 25V78Q106 114 60 130Q14 114 14 78V25Z" fill="url(#sbl-dark-bg)" />

      {/* Internal Structural Details (City Skyline / Architectural Pillars) */}
      <g clipPath="url(#sbl-clip)">
        <rect x="28" y="55" width="14" height="30" fill="rgba(255,255,255,0.06)" rx="1" />
        <rect x="78" y="58" width="14" height="27" fill="rgba(255,255,255,0.06)" rx="1" />
        
        {/* Central Pillar Base */}
        <rect x="52" y="48" width="16" height="42" fill="url(#sbl-platinum)" opacity="0.15" rx="0.5" />
        <rect x="52" y="48" width="8" height="42" fill="rgba(255,255,255,0.1)" rx="0.5" />
      </g>

      {/* Fused Google Gemini 4-Pointed Sparkle at the heart of the Shield */}
      <path 
        d="M 60 28 Q 60 54 34 54 Q 60 54 60 80 Q 60 54 86 54 Q 60 54 60 28 Z" 
        fill="url(#gemini-grad)" 
        filter="url(#starGlow)" 
      />

      {/* Swoosh Ribbon representing Future Growth / Real Estate Trajectory */}
      <path d="M14 100 Q35 84 58 72 Q80 58 108 46" stroke="url(#sbl-red)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.45" />
      <path d="M14 100 Q35 84 58 72 Q80 58 108 46" stroke="url(#sbl-platinum)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M103 40L111 46L103 52" stroke="url(#sbl-platinum)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />

      {/* Shield Highlight Line */}
      <path d="M60 2L112 21V79Q112 122 60 138Q8 122 8 79V21Z" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
    </svg>
  );
}
