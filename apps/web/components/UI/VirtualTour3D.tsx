'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Maximize, Play, RotateCcw } from 'lucide-react';

export default function VirtualTour3D({ isAr }: { isAr?: boolean }) {
  const [isInitialized, setIsInitialized] = useState(false);

  const handleInitialize = () => {
    setIsInitialized(true);
  };

  const handleReset = () => {
    setIsInitialized(false);
  };

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden bg-[#050b14] border border-[#071422]/20 dark:border-white/10 group shadow-2xl">
      {/* High-tech Overlay Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50 z-10" />

      {!isInitialized ? (
        <div 
          onClick={handleInitialize}
          className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center"
        >
          {/* Simulated 3D Space Background */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-4 shadow-[0_0_40px_rgba(201,168,76,0.3)] relative z-20"
          >
            <Play size={32} className={isAr ? "mr-1" : "ml-1"} fill="currentColor" />
          </motion.div>
          <span className="text-white font-playfair tracking-widest text-lg font-semibold drop-shadow-lg relative z-20">
            {isAr ? 'جولة افتراضية ثلاثية الأبعاد' : '3D VIRTUAL TOUR'}
          </span>
          <span className="text-[#C9A84C] text-xs font-mono mt-2 tracking-widest uppercase relative z-20">
            {isAr ? 'انقر للبدء' : 'Click to Initialize Engine'}
          </span>

          {/* Shiny Scanline Effect */}
          <motion.div
            animate={{ y: ['0%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-50 shadow-[0_0_10px_#C9A84C] z-10"
          />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          <iframe
            src="https://my.matterport.com/show/?m=SxHE3R2nrEV&play=1&qs=1&log=0"
            className="w-full h-full border-0"
            allowFullScreen
            allow="xr-spatial-tracking; gyroscope; accelerometer"
          />
          
          {/* Back/Reset Control */}
          <div className="absolute bottom-6 left-6 z-20">
            <button 
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-xs text-white font-mono flex items-center gap-2 transition-all"
            >
              <RotateCcw size={12} className="text-[#C9A84C]" />
              {isAr ? 'إعادة تعيين المعاينة' : 'Exit Virtual Model'}
            </button>
          </div>
        </div>
      )}

      {/* Floating UI Info Badge */}
      <div className="absolute top-6 left-6 flex gap-2 z-20">
        <div className="px-3 py-1.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-[10px] text-white font-mono flex items-center gap-1.5">
          <Box size={12} className="text-[#C9A84C]" /> 
          {isInitialized ? 'LIVE 3D SDK' : '4K RENDER COVER'}
        </div>
      </div>
    </div>
  );
}
