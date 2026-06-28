'use client';

/**
 * SIERRA ESTATES — CINEMATIC HERO SECTION
 * Quiet Luxury / Apple-Style Interactive Node
 * Design: Deep Navy (#0A1628) + Gold (#C9A24D) + Ivory (#F4F0E8)
 * Bilingual (EN / AR) · Framer Motion · Fully self-contained
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, SlidersHorizontal } from 'lucide-react';

interface CinematicHeroProps {
  onSearch?: (query: string) => void;
  isArabic?: boolean;
}

export default function CinematicHero({ onSearch, isArabic = false }: CinematicHeroProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) onSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section
      dir={isArabic ? 'rtl' : 'ltr'}
      className="relative min-h-[90vh] w-full flex flex-col justify-center items-center text-center px-6 overflow-hidden border-b border-[#C9A24D]/10 bg-gradient-to-b from-[#0A1628] via-[#0D1E36] to-[#0A1628]"
    >
      {/* Gold radial glow + geometric grid */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(201,162,77,0.07)_0%,transparent_65%)]" />
      <div className="absolute inset-0 z-0 opacity-5 bg-[linear-gradient(to_right,#C9A24D_1px,transparent_1px),linear-gradient(to_bottom,#C9A24D_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Content block with cinematic entrance */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 max-w-5xl space-y-8 relative flex flex-col items-center"
      >
        {/* Ghosted serif monogram watermark */}
        <div className="absolute -top-16 w-48 h-48 rounded-full border border-[#C9A24D]/5 flex items-center justify-center bg-gradient-to-b from-[#C9A24D]/[0.02] to-transparent pointer-events-none select-none blur-[1px]">
          <span className="font-serif font-light text-[#C9A24D]/10 text-9xl tracking-tighter">S</span>
        </div>

        {/* Specialty badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-[#C9A24D]/5 border border-[#C9A24D]/20 backdrop-blur-md px-4 py-1.5 rounded-full shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C9A24D] animate-pulse" />
          <span className="text-[#C9A24D] tracking-[0.2em] uppercase text-[10px] font-mono font-semibold">
            {isArabic
              ? 'الوجهة الحصرية الأولى لعقارات القاهرة الجديدة'
              : 'First & only website in Egypt designed specially for New Cairo'}
          </span>
        </motion.div>

        {/* Serif luxury headline */}
        <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl text-[#F4F0E8] leading-[1.1] font-extralight tracking-tight max-w-4xl">
          {isArabic ? (
            <>
              الوجهة الحصرية الأولى لعقارات <br />
              <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#C9A24D] via-[#e5c37e] to-[#C9A24D]">
                القاهرة الجديدة.
              </span>{' '}
              <span className="font-light text-gray-400">إيجار وإعادة بيع.</span>
            </>
          ) : (
            <>
              The First Exclusive Destination for <br />
              <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#C9A24D] via-[#e5c37e] to-[#C9A24D] relative">
                New Cairo Properties.
              </span>{' '}
              <span className="font-light text-gray-400">Rent &amp; Resale.</span>
            </>
          )}
        </h2>

        {/* Tagline + Arabic identity divider */}
        <div className="flex flex-col items-center space-y-2 pt-2">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#C9A24D]/80 font-mono">
            Best-in-Class Design. AI-Driven Excellence.
          </p>
          <div className="flex justify-center items-center space-x-3 w-full">
            <span className="h-[1px] w-16 bg-gradient-to-l from-[#C9A24D]/30 to-transparent" />
            <p className="font-serif text-lg text-gray-300 font-light tracking-wide">التميز العقاري برؤية ذكية</p>
            <span className="h-[1px] w-16 bg-gradient-to-r from-[#C9A24D]/30 to-transparent" />
          </div>
        </div>

        {/* 1,500-broker network descriptor */}
        <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed font-light font-sans tracking-wide">
          {isArabic ? (
            <>
              نقدم أرقى الفرص العقارية في سوق القاهرة الجديدة، بدمج الذكاء الاصطناعي مع شبكة حصرية تضم أكثر من{' '}
              <span className="text-[#C9A24D] font-medium">1,500 وسيط ووكالة نخبة</span>{' '}
              عبر القاهرة الجديدة ومدينتي والشروق.
            </>
          ) : (
            <>
              We curate the finest opportunities across the New Cairo market. By combining advanced AI intelligence
              with an exclusive network of over{' '}
              <span className="text-[#C9A24D] font-medium">1,500 elite brokers and agencies</span>{' '}
              across New Cairo, Madinaty, and El Shorouk, we deliver unmatched value tailored precisely to your needs.
            </>
          )}
        </p>

        {/* AI compound search bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="pt-6 w-full max-w-xl mx-auto"
        >
          <div className="bg-[#071322]/80 border border-[#C9A24D]/30 p-2.5 rounded-2xl flex items-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl hover:border-[#C9A24D]/60 transition-all group">
            <div className="p-2 bg-[#C9A24D]/5 rounded-xl ml-2 group-hover:bg-[#C9A24D]/10 transition-colors">
              <Search className="w-4 h-4 text-[#C9A24D]" />
            </div>
            <input
              type="text"
              placeholder={
                isArabic
                  ? 'ابحث باسم الكمباوند (ميفيدا، إيستاون، فيليت، تاج سيتي...)'
                  : 'Search by compound name (Mivida, Eastown, Villette, Taj City...)'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none outline-none px-2 text-sm text-white placeholder-gray-500 font-sans tracking-wide"
            />
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-[#C9A24D] to-[#b38f40] text-[#0A1628] px-5 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center space-x-1.5 shadow-lg active:scale-95 transition-transform"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isArabic ? 'بحث' : 'Filter'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Animated scroll-down indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center space-y-1 opacity-40 hover:opacity-80 transition-opacity cursor-pointer">
        <p className="text-[9px] font-mono tracking-widest uppercase text-gray-400">Explore Catalog</p>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-1 h-3 rounded-full bg-[#C9A24D]"
        />
      </div>
    </section>
  );
}
