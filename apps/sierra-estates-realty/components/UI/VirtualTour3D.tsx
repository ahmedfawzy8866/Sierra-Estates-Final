'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Box, Play, RotateCcw, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

/**
 * SIERRA ESTATES — 3D Virtual Tour
 *
 * Renders a 4K cover shot from a real luxury villa, then opens an
 * interactive photo-gallery "tour" with arrow navigation. Each image
 * is a 4K architectural photograph representing a real interior or
 * exterior space typical of New Cairo luxury compounds.
 *
 * If a Matterport ID is provided via the `matterportId` prop, the
 * "Enter 3D Tour" button opens a real Matterport iframe instead.
 */

interface VirtualTour3DProps {
  isAr?: boolean;
  /** Optional Matterport model ID (e.g. 'SxHE3R2nrEV'). If provided, shows a "Enter 3D Tour" button. */
  matterportId?: string;
  /** Optional override for the cover image (defaults to a luxury villa exterior). */
  coverImage?: string;
  /** Optional gallery of interior shots. Defaults to a curated 8-image luxury tour. */
  gallery?: string[];
}

const DEFAULT_GALLERY = [
  { src: '/interiors/living-room-luxury.jpg', labelEn: 'Living Room', labelAr: 'غرفة المعيشة' },
  { src: '/interiors/kitchen-luxury.jpg', labelEn: 'Chef\'s Kitchen', labelAr: 'المطبخ' },
  { src: '/interiors/master-bedroom.jpg', labelEn: 'Master Suite', labelAr: 'الجناح الرئيسي' },
  { src: '/interiors/infinity-pool.jpg', labelEn: 'Infinity Pool', labelAr: 'المسبح' },
  { src: '/interiors/bathroom-marble.jpg', labelEn: 'Marble Bathroom', labelAr: 'الحمام الرخامي' },
  { src: '/interiors/terrace-outdoor.jpg', labelEn: 'Outdoor Terrace', labelAr: 'التراس الخارجي' },
  { src: '/interiors/staircase.jpg', labelEn: 'Grand Staircase', labelAr: 'الدرج الكبير' },
  { src: '/interiors/wine-cellar.jpg', labelEn: 'Wine Cellar', labelAr: 'قبوة النبيذ' },
];

export default function VirtualTour3D({
  isAr,
  matterportId = 'SxHE3R2nrEV',
  coverImage = '/villas/mivida-grand-lakefront.jpg',
  gallery,
}: VirtualTour3DProps) {
  const [mode, setMode] = useState<'cover' | 'gallery' | 'matterport'>('cover');
  const [galleryIndex, setGalleryIndex] = useState(0);

  const tour = useMemo(() => gallery
    ? gallery.map((src, i) => ({ src, labelEn: `View ${i + 1}`, labelAr: `إطلالة ${i + 1}` }))
    : DEFAULT_GALLERY
  , [gallery]);

  const handleInitialize = () => {
    if (matterportId) {
      setMode('matterport');
    } else {
      setMode('gallery');
    }
  };

  const handleReset = () => {
    setMode('cover');
    setGalleryIndex(0);
  };

  const nextImage = () => setGalleryIndex((i) => (i + 1) % tour.length);
  const prevImage = () => setGalleryIndex((i) => (i - 1 + tour.length) % tour.length);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden bg-[#050b14] border border-[#071422]/20 dark:border-white/10 group shadow-2xl">
      {/* High-tech Overlay Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50 z-10" />

      {mode === 'cover' && (
        <div
          onClick={handleInitialize}
          className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center"
        >
          {/* 4K villa cover image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 group-hover:opacity-70 transition-all duration-[2s] ease-out"
            style={{ backgroundImage: `url('${coverImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-4 shadow-[0_0_40px_rgba(201,168,76,0.3)] relative z-20"
          >
            <Play size={32} className={isAr ? 'mr-1' : 'ml-1'} fill="currentColor" />
          </motion.div>
          <span className="text-white font-playfair tracking-widest text-lg md:text-xl font-semibold drop-shadow-lg relative z-20 text-center px-4">
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
      )}

      {mode === 'gallery' && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={tour[galleryIndex].src}
            alt={isAr ? tour[galleryIndex].labelAr : tour[galleryIndex].labelEn}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top label */}
          <div className="absolute top-6 left-6 z-20">
            <div className="px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-xs text-white font-mono flex items-center gap-2">
              <Box size={12} className="text-[#C9A84C]" />
              {isAr ? tour[galleryIndex].labelAr : tour[galleryIndex].labelEn}
              <span className="text-slate-400 ml-2">{galleryIndex + 1} / {tour.length}</span>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all"
            aria-label={isAr ? 'السابق' : 'Previous'}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all"
            aria-label={isAr ? 'التالي' : 'Next'}
          >
            <ChevronRight size={24} />
          </button>

          {/* Bottom dots */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {tour.map((_, i) => (
              <button
                key={i}
                onClick={() => setGalleryIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === galleryIndex ? 'w-6 bg-[#C9A84C]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to view ${i + 1}`}
              />
            ))}
          </div>

          {/* Exit button */}
          <div className="absolute bottom-6 left-6 z-20">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-xs text-white font-mono flex items-center gap-2 transition-all"
            >
              <RotateCcw size={12} className="text-[#C9A84C]" />
              {isAr ? 'إنهاء المعاينة' : 'Exit Virtual Model'}
            </button>
          </div>
        </div>
      )}

      {mode === 'matterport' && (
        <div className="absolute inset-0 w-full h-full">
          <iframe
            src={`https://my.matterport.com/show/?m=${matterportId}&play=1&qs=1&log=0`}
            className="w-full h-full border-0"
            allowFullScreen
            allow="xr-spatial-tracking; gyroscope; accelerometer"
          />
          <div className="absolute bottom-6 left-6 z-20">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-xs text-white font-mono flex items-center gap-2 transition-all"
            >
              <RotateCcw size={12} className="text-[#C9A84C]" />
              {isAr ? 'إنهاء المعاينة' : 'Exit Virtual Model'}
            </button>
          </div>
        </div>
      )}

      {/* Floating UI Info Badge (always visible) */}
      <div className="absolute top-6 right-6 flex gap-2 z-20">
        <div className="px-3 py-1.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-[10px] text-white font-mono flex items-center gap-1.5">
          <Maximize2 size={12} className="text-[#C9A84C]" />
          {mode === 'matterport' ? 'LIVE 3D SDK' : mode === 'gallery' ? '4K PHOTO TOUR' : '4K RENDER COVER'}
        </div>
      </div>
    </div>
  );
}
