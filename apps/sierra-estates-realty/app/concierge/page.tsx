'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Key } from 'lucide-react';

export default function ConciergePage() {
  const router = useRouter();
  const [accessKey, setAccessKey] = useState('');

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey.trim().length > 3) {
      router.push(`/concierge/${accessKey.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0E8] dark:bg-[#071422] text-[#071422] dark:text-[#F4F0E8] pt-32 pb-12 transition-all duration-700 flex flex-col items-center justify-center">
      <div className="max-w-xl mx-auto px-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] mb-8">
          <ShieldCheck size={36} strokeWidth={1.5} />
        </div>
        
        <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-3">
          Private Client Portal
        </span>
        <h1 className="font-playfair text-4xl md:text-5xl font-light mb-6">
          Sierra <span className="italic text-[#C9A84C]">Concierge</span>
        </h1>
        <p className="text-sm opacity-70 mb-12">
          Access your personalized, off-market property portfolio. Enter your unique client access key provided by your advisor.
        </p>

        <form onSubmit={handleAccess} className="bg-white/50 dark:bg-[#0d2035]/50 p-8 rounded-3xl backdrop-blur-md border border-[#071422]/10 dark:border-white/10 shadow-luxury">
          <div className="relative mb-6 text-left">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#071422]/50 dark:text-white/40 mb-2">
              Secure Access Key
            </label>
            <div className="relative">
              <Key size={18} className="absolute left-4 top-4 text-[#071422]/40 dark:text-white/40" />
              <input 
                type="text" 
                placeholder="e.g. SR-8829" 
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#071422] border border-[#071422]/15 dark:border-white/10 focus:border-[#C9A84C] outline-none text-sm rounded-xl transition-all font-mono tracking-widest"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full py-4 bg-[#071422] text-white dark:bg-gradient-to-r dark:from-[#C9A84C] dark:to-[#E9C176] dark:text-[#071422] font-semibold text-xs rounded-xl shadow-lg hover:shadow-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
          >
            <span>Unlock Portfolio</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
