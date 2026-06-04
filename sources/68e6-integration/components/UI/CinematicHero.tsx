"use client";

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, type Variants } from 'framer-motion';
import BrandLogo from './BrandLogo';

interface HeroCopy {
  dir: 'ltr' | 'rtl';
  heroSub: string;
  tagline: string;
  btnDiscover: string;
  btnView: string;
  stats: [string, string][];
}

interface CinematicHeroProps {
  T: HeroCopy;
  onPortfolioClick: () => void;
  onAdvisorClick: () => void;
}

/**
 * CINEMATIC HERO — The Gateway to Sierra Blu
 * 
 * This component serves as the primary entry point for Investment Stakeholders.
 * It utilizes a high-fidelity space-to-earth background video to establish 
 * the "Disciplined Intelligence" brand identity.
 */
export default function CinematicHero({ T, onPortfolioClick, onAdvisorClick }: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAr = T.dir === 'rtl';

  // Motion values for mouse coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the parallax effect
  const springConfig = { damping: 50, stiffness: 400 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax shifts:
  // Video moves slightly in the counter-direction of the mouse (simulating depth)
  const videoX = useTransform(smoothX, [-0.5, 0.5], ['1%', '-1%']);
  const videoY = useTransform(smoothY, [-0.5, 0.5], ['1%', '-1%']);

  // Text moves slightly in the same direction of the mouse (foreground pop)
  const textX = useTransform(smoothX, [-0.5, 0.5], ['-10px', '10px']);
  const textY = useTransform(smoothY, [-0.5, 0.5], ['-10px', '10px']);

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();

    // Normalize mouse position between -0.5 and 0.5
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    // Reset to center smoothly
    mouseX.set(0);
    mouseY.set(0);
  };

  // SVG "Build from nothing" path variants
  const pathVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { duration: 2, ease: "easeInOut", delay: 0.5 }
    }
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[100vh] overflow-hidden bg-[#030712] flex items-center justify-center text-[#F4F0E8]"
      style={{ perspective: 1000 }}
    >
      {/* 1. LAYER ONE: The Dark Space/Earth Video (Strategic Background) */}
      <motion.div 
        className="absolute inset-0 z-0 scale-[1.05]"
        style={{ x: videoX, y: videoY }}
      >
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="object-cover w-full h-full opacity-40 mix-blend-screen grayscale-[0.3]"
        >
          {/* High-bitrate 4K space-to-earth footage source */}
          <source src="https://images-assets.nasa.gov/video/Earth%20Observations%20from%20the%20ISS/Earth%20Observations%20from%20the%20ISS~orig.mp4" type="video/mp4" />
          <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" type="video/mp4" />
        </video>
        
        {/* Cinematic Vignettes and Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/60 z-10" />
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-10" />
      </motion.div>

      {/* 2. LAYER TWO: Sierra Blu Subtle Watermark (Top Right) */}
      <motion.div 
        className={`absolute top-24 ${isAr ? 'left-12' : 'right-12'} z-20 opacity-20 pointer-events-none`}
        initial={{ opacity: 0, x: isAr ? -20 : 20 }}
        animate={{ opacity: 0.2, x: 0 }}
        transition={{ delay: 2, duration: 2 }}
      >
        <BrandLogo size="md" variant="shield" />
      </motion.div>

      {/* 3. LAYER THREE: Foreground Text & UI (Floating Parallax) */}
      <motion.div 
        className="relative z-30 flex flex-col items-center text-center px-4 max-w-5xl"
        style={{ x: textX, y: textY }}
      >
        
        {/* Animated "Build from nowhere" Decorative SVG */}
        <motion.div 
          className="mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path 
              d="M50 5 L95 50 L50 95 L5 50 Z" 
              stroke="#C9A24D" 
              strokeWidth="0.75"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              className="drop-shadow-[0_0_15px_rgba(201,162,77,0.8)]"
            />
            <motion.circle 
              cx="50" cy="50" r="10" 
              fill="#C9A24D" 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.8, duration: 1.2, ease: "easeOut" }}
              className="shadow-gold"
            />
          </svg>
        </motion.div>

        <motion.h1 
          className={`text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tighter leading-[0.85] ${isAr ? "font-['Cairo',sans-serif]" : "font-serif"}`}
          initial={{ opacity: 0, y: 50, filter: "blur(25px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        >
          {isAr ? 'ذكاء' : 'Disciplined'} <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F4F0E8] via-[#C9A24D] to-[#F4F0E8] bg-[length:200%_auto] animate-goldShimmer">
            {isAr ? 'منضبط.' : 'Intelligence.'}
          </span>
        </motion.h1>
        
        <motion.p 
          className={`text-lg md:text-xl font-sans tracking-[0.25em] text-[#F4F0E8]/70 uppercase mb-12 font-light max-w-2xl ${isAr ? "font-['Cairo',sans-serif] tracking-normal" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, delay: 1.6 }}
        >
          {T.heroSub} <br/>
          <span className="text-xs opacity-50 block mt-2 tracking-[0.4em]">{T.tagline}</span>
        </motion.p>
        
        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center gap-6 font-sans"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 2 }}
        >
          <button 
            onClick={onPortfolioClick}
            className="group px-10 py-4 bg-transparent border border-[#C9A24D] text-[#C9A24D] text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#C9A24D] hover:text-[#030712] transition-all duration-700 rounded-sm shadow-[0_0_20px_rgba(201,162,77,0.1)] hover:shadow-[0_0_50px_rgba(201,162,77,0.4)]"
          >
            {T.btnDiscover}
          </button>
          
          <button 
            onClick={onAdvisorClick}
            className="px-10 py-4 bg-[#F4F0E8] text-[#030712] text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-transparent hover:text-[#F4F0E8] hover:border-[#F4F0E8] border border-transparent transition-all duration-700 rounded-sm relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#C9A24D] group-hover:bg-[#F4F0E8] transition-colors animate-pulse" />
              {T.btnView}
            </span>
          </button>
        </motion.div>

        {/* Stats Overlay */}
        <motion.div 
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 border-t border-white/5 pt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2.5, duration: 2 }}
        >
          {T.stats.map(([val, lbl]: [string, string], i: number) => (
            <div key={i} className="flex flex-col">
              <span className="font-serif text-2xl text-[#C9A24D]">{val}</span>
              <span className="text-[8px] uppercase tracking-widest">{lbl}</span>
            </div>
          ))}
        </motion.div>

      </motion.div>
      
      {/* 4. Mouse Scroll Indicator (Strategic Pipeline Entry) */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1.5 }}
        onClick={onPortfolioClick}
      >
        <span className="text-[9px] tracking-[0.5em] text-[#C9A24D] uppercase opacity-60 hover:opacity-100 transition-opacity">
          {isAr ? 'النزول' : 'Descent'}
        </span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-[#C9A24D] to-transparent animate-shimmerLine" />
      </motion.div>
    </section>
  );
}
