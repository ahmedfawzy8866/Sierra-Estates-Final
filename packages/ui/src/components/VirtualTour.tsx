'use client';

/**
 * SIERRA ESTATES — VIRTUAL TOUR COMPONENT
 * Embeddable 360° virtual tour viewer.
 * Supports Matterport, CloudPano, or any iframe-based tour provider.
 * Falls back to a panoramic image gallery when no tour URL is provided.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Play, Maximize2, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VirtualTourProps {
  /** Iframe URL for the 3D tour (Matterport, CloudPano, etc.) */
  tourUrl?: string;
  /** Array of 360° panoramic image URLs as fallback */
  panoramaImages?: Array<{ url: string; label?: string }>;
  /** Thumbnail image shown before tour loads */
  thumbnailUrl?: string;
  /** Tour title */
  title?: string;
  /** Whether to autoplay the tour */
  autoPlay?: boolean;
  /** Height of the tour container (default: '500px') */
  height?: string;
  /** Language direction */
  isArabic?: boolean;
}

export default function VirtualTour({
  tourUrl,
  panoramaImages = [],
  thumbnailUrl,
  title = 'Virtual Tour',
  autoPlay = false,
  height = '500px',
  isArabic = false,
}: VirtualTourProps) {
  const [isLoaded, setIsLoaded] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPanorama, setCurrentPanorama] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const nextPanorama = useCallback(() => {
    setCurrentPanorama((prev) => (prev + 1) % panoramaImages.length);
  }, [panoramaImages.length]);

  const prevPanorama = useCallback(() => {
    setCurrentPanorama((prev) => (prev - 1 + panoramaImages.length) % panoramaImages.length);
  }, [panoramaImages.length]);

  // Iframe-based 3D tour (Matterport, CloudPano, etc.)
  if (tourUrl && isLoaded) {
    return (
      <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-black" style={{ height }}>
        <iframe
          src={tourUrl}
          className="w-full h-full border-0"
          allow="vr; fullscreen; accelerometer; gyroscope"
          title={title}
          loading="lazy"
        />
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur rounded-lg text-white/80 hover:text-white transition"
          title={isArabic ? 'ملء الشاشة' : 'Fullscreen'}
        >
          <Maximize2 size={16} />
        </button>
      </div>
    );
  }

  // Thumbnail overlay before tour loads
  if (!isLoaded) {
    return (
      <div
        className="relative w-full rounded-xl overflow-hidden border border-slate-800 cursor-pointer group"
        style={{ height }}
        onClick={handleLoad}
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${thumbnailUrl || (panoramaImages[0]?.url ?? '')})` }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-full bg-[#C9A84C]/90 flex items-center justify-center shadow-lg shadow-[#C9A84C]/20"
          >
            <Play size={28} className="text-[#0A1628] ml-1" fill="#0A1628" />
          </motion.div>
          <span className="text-white font-semibold text-sm uppercase tracking-wider">
            {isArabic ? 'ابدأ الجولة الافتراضية' : 'Start Virtual Tour'}
          </span>
          {title && <span className="text-white/60 text-xs">{title}</span>}
        </div>
      </div>
    );
  }

  // Fallback: panoramic image gallery with navigation
  if (panoramaImages.length > 0) {
    const current = panoramaImages[currentPanorama];
    return (
      <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-black" style={{ height }}>
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${current.url})` }}
        />
        {/* Navigation */}
        {panoramaImages.length > 1 && (
          <>
            <button
              onClick={prevPanorama}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur rounded-full text-white/80 hover:text-white transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextPanorama}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur rounded-full text-white/80 hover:text-white transition"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        {/* Controls */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={toggleFullscreen} className="p-2 bg-black/60 backdrop-blur rounded-lg text-white/80 hover:text-white transition">
            <Maximize2 size={16} />
          </button>
        </div>
        {/* Room label + dots */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {current.label && (
            <span className="text-white text-sm font-medium">{current.label}</span>
          )}
          {panoramaImages.length > 1 && (
            <div className="flex gap-1.5 mt-2">
              {panoramaImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPanorama(i)}
                  className={`w-2 h-2 rounded-full transition ${i === currentPanorama ? 'bg-[#C9A84C]' : 'bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // No tour or images available
  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center" style={{ height }}>
      <p className="text-slate-500 text-sm">{isArabic ? 'لا تتوفر جولة افتراضية' : 'No virtual tour available'}</p>
    </div>
  );
}
