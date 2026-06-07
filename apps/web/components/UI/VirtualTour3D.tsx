'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Box, Maximize, Play } from 'lucide-react';

export default function VirtualTour3D({ isAr }: { isAr?: boolean }) {
  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden bg-[#050b14] border border-[#071422]/20 dark:border-white/10 group cursor-pointer shadow-2xl">
      {/* Simulated 3D Space Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
      
      {/* High-tech Overlay Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />

      {/* Center Play UI */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-4 shadow-[0_0_40px_rgba(201,168,76,0.3)]"
        >
          <Play size={32} className="ml-1" fill="currentColor" />
        </motion.div>
        <span className="text-white font-playfair tracking-widest text-lg font-semibold drop-shadow-lg">
          {isAr ? 'جولة افتراضية ثلاثية الأبعاد' : '3D VIRTUAL TOUR'}
        </span>
        <span className="text-[#C9A84C] text-xs font-mono mt-2 tracking-widest uppercase">
          {isAr ? 'انقر للبدء' : 'Click to Initialize Engine'}
        </span>
      </div>

      {/* Floating UI Elements */}
      <div className="absolute top-6 left-6 flex gap-2">
        <div className="px-3 py-1.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-[10px] text-white font-mono flex items-center gap-1.5">
          <Box size={12} className="text-[#C9A84C]" /> 4K RENDER
        </div>
      </div>

      <div className="absolute bottom-6 right-6">
        <button className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-[#C9A84C] transition-colors">
          <Maximize size={18} />
        </button>
      </div>

      {/* Shiny Scanline Effect */}
      <motion.div
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-50 shadow-[0_0_10px_#C9A84C]"
      />
    </div>
  );
}
