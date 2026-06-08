'use client';

import React, { useState } from 'react';
import InventoryShowcase from '@/components/UI/InventoryShowcase';
import { Search } from 'lucide-react';

export default function ListingsPage() {
  const [filters, setFilters] = useState({
    purpose: '',
    type: '',
    compound: '',
    budget: '',
  });

  return (
    <div className="min-h-screen bg-[#F4F0E8] dark:bg-[#071422] text-[#071422] dark:text-[#F4F0E8] pt-24 pb-12 transition-all duration-700">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-2">
          Curated Portfolio
        </span>
        <h1 className="font-playfair text-4xl md:text-5xl font-light mb-4">
          Property <span className="italic text-[#C9A84C]">Marketplace</span>
        </h1>
        <p className="text-sm opacity-70 max-w-2xl">
          Browse our exclusive, hand-picked selection of luxury real estate properties across Egypt's most premium communities.
        </p>

        {/* Basic filter bar */}
        <div className="mt-8 flex flex-wrap gap-4 items-center bg-white/50 dark:bg-[#0d2035]/50 p-4 rounded-2xl backdrop-blur-md border border-[#071422]/10 dark:border-white/10">
           <div className="flex-1 relative min-w-[200px]">
             <Search size={16} className="absolute left-3 top-3 text-[#071422]/40 dark:text-white/40" />
             <input 
               type="text" 
               placeholder="Search compounds or keywords..." 
               className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#071422] rounded-xl border border-[#071422]/15 dark:border-white/10 text-sm focus:border-[#C9A84C] outline-none"
               onChange={(e) => setFilters({ ...filters, compound: e.target.value })}
             />
           </div>
           <select 
             className="px-4 py-2.5 bg-white dark:bg-[#071422] rounded-xl border border-[#071422]/15 dark:border-white/10 text-sm focus:border-[#C9A84C] outline-none"
             onChange={(e) => setFilters({ ...filters, type: e.target.value })}
           >
             <option value="">All Types</option>
             <option value="Villa">Villa</option>
             <option value="Apartment">Apartment</option>
             <option value="Penthouse">Penthouse</option>
             <option value="Duplex">Duplex</option>
             <option value="Townhouse">Townhouse</option>
           </select>
        </div>
      </div>

      <div className="relative z-10">
        <InventoryShowcase filters={filters} />
      </div>
    </div>
  );
}
