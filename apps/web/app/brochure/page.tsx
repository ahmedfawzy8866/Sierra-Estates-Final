'use client';

import React from 'react';
import { BookOpen, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BrochureDirectoryPage() {
  const brochures = [
    { id: 'mivida', title: 'Mivida Boulevard', dev: 'Emaar Misr', type: 'Compound Masterplan' },
    { id: 'marassi', title: 'Marassi Blanca', dev: 'Emaar Misr', type: 'Coastal Luxury' },
    { id: 'sodic-east', title: 'Villette', dev: 'SODIC', type: 'Signature Villas' },
    { id: 'zed', title: 'ZED East', dev: 'ORA Developers', type: 'Luxury Apartments' }
  ];

  return (
    <div className="min-h-screen bg-[#F4F0E8] dark:bg-[#071422] text-[#071422] dark:text-[#F4F0E8] pt-32 pb-24 transition-all duration-700">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] mb-6">
            <BookOpen size={28} strokeWidth={1.5} />
          </div>
          <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-3">
            Digital Asset Library
          </span>
          <h1 className="font-playfair text-4xl md:text-5xl font-light mb-4">
            Property <span className="italic text-[#C9A84C]">Brochures</span>
          </h1>
          <p className="text-sm opacity-70 max-w-xl mx-auto">
            Explore detailed floor plans, masterplans, and high-resolution digital brochures for our featured luxury developments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brochures.map((brochure) => (
            <div key={brochure.id} className="group relative rounded-3xl overflow-hidden bg-white/50 dark:bg-[#0d2035]/50 border border-[#071422]/10 dark:border-white/10 shadow-luxury transition-all hover:-translate-y-2">
              <div className="aspect-[3/4] bg-[#071422] dark:bg-[#050b14] p-6 flex flex-col justify-between relative overflow-hidden">
                {/* Abstract graphic background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10">
                  <span className="text-[9px] font-mono text-[#C9A84C] uppercase tracking-widest block mb-2">{brochure.dev}</span>
                  <h3 className="font-playfair text-xl text-white font-light">{brochure.title}</h3>
                </div>

                <div className="relative z-10 flex flex-col gap-4">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">{brochure.type}</span>
                  <Link href={`/brochure/${brochure.id}`} className="w-full py-3 bg-white/10 hover:bg-[#C9A84C] text-white hover:text-[#071422] rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                    <span>View Digital</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
