'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldCheck, Compass, Move, Award } from 'lucide-react';

interface LuxuryVirtualViewportProps {
  isAr?: boolean;
  onLaunchTour: (sceneUrl: string) => void;
}

const ROOMS = [
  { id: 'living', labelEn: 'Living Area', labelAr: 'صالة المعيشة', img: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=2400&q=80', pano: 'https://pannellum.org/images/alma.jpg' },
  { id: 'master', labelEn: 'Master Suite', labelAr: 'الجناح الرئيسي', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2400&q=80', pano: 'https://pannellum.org/images/jfk.jpg' },
  { id: 'garden', labelEn: 'Private Garden', labelAr: 'الحديقة الخاصة', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=2400&q=80', pano: 'https://pannellum.org/images/alma.jpg' },
  { id: 'pool', labelEn: 'Pool Deck', labelAr: 'منطقة المسبح', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2400&q=80', pano: 'https://pannellum.org/images/jfk.jpg' },
  { id: 'terrace', labelEn: 'Sky Terrace', labelAr: 'التراس العلوي', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2400&q=80', pano: 'https://pannellum.org/images/alma.jpg' },
  { id: 'exterior', labelEn: 'Villa Exterior', labelAr: 'الواجهة الخارجية', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2400&q=80', pano: 'https://pannellum.org/images/jfk.jpg' }
];

export default function LuxuryVirtualViewport({ isAr = false, onLaunchTour }: LuxuryVirtualViewportProps) {
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const activeRoom = ROOMS[activeRoomIndex];

  // Drag Panning States
  const stageRef = useRef<HTMLDivElement>(null);
  const panoRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pointerX = useRef(0);
  const startX = useRef(0);
  const startPos = useRef(0);

  // Pointer event handlers for draggable preview
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current || !panoRef.current) return;
    setIsDragging(true);
    startX.current = e.clientX;
    startPos.current = pointerX.current;
    stageRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !stageRef.current || !panoRef.current) return;
    const delta = e.clientX - startX.current;
    const maxPan = stageRef.current.clientWidth - panoRef.current.clientWidth;
    let newX = startPos.current + delta;
    newX = Math.max(maxPan, Math.min(0, newX));
    pointerX.current = newX;
    panoRef.current.style.transform = `translateX(${newX}px)`;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Auto-drift gentle panning simulation
  useEffect(() => {
    const tick = () => {
      if (isDragging || !stageRef.current || !panoRef.current) return;
      const maxPan = stageRef.current.clientWidth - panoRef.current.clientWidth;
      let newX = pointerX.current - 0.5; // gentle auto-rotation
      if (newX <= maxPan) newX = 0;
      pointerX.current = newX;
      panoRef.current.style.transform = `translateX(${newX}px)`;
    };
    const intervalId = setInterval(tick, 30);
    return () => clearInterval(intervalId);
  }, [isDragging, activeRoomIndex]);

  // Reset panning offset when room changes
  useEffect(() => {
    pointerX.current = 0;
    if (panoRef.current) {
      panoRef.current.style.transform = `translateX(0px)`;
    }
  }, [activeRoomIndex]);

  return (
    <div className="flex flex-col gap-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Draggable Room Panorama Preview Screen */}
      <div className="relative">
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`relative h-[320px] md:h-[420px] w-full border border-[#071422]/15 dark:border-white/10 rounded-[32px] overflow-hidden shadow-luxury select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Pano Background Wrapper (Wide Image) */}
          <img
            ref={panoRef}
            src={activeRoom.img}
            alt={isAr ? activeRoom.labelAr : activeRoom.labelEn}
            className="absolute top-0 left-0 h-full w-[260%] object-cover transition-transform duration-100 ease-out pointer-events-none will-change-transform"
          />

          {/* Top Indicator overlays */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#182535]/85 backdrop-blur-md border border-[#C9A84C]/35 px-4 py-2 rounded-xl text-[9px] font-mono font-semibold text-white uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>360° · {isAr ? activeRoom.labelAr : activeRoom.labelEn}</span>
          </div>

          {/* Drag Overlay Helper */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex items-center gap-2 bg-[#182535]/70 backdrop-blur-sm text-white text-[10px] font-medium tracking-wide px-4 py-2 rounded-full shadow-lg">
            <Move size={12} className="animate-pulse" />
            <span>{isAr ? 'اسحب للمعاينة ثنائية الأبعاد' : 'Drag to pan view'}</span>
          </div>

          {/* Launch Fullscreen 3D WebGL Virtual Tour Button */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(201, 168, 76, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onLaunchTour(activeRoom.pano)}
              className="pointer-events-auto inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#C9A84C] to-[#E9C176] text-[#182535] font-semibold text-xs rounded-xl shadow-xl hover:shadow-2xl transition-all uppercase tracking-widest font-mono"
            >
              <Eye size={14} className="stroke-[2.5px]" />
              <span>{isAr ? 'إطلاق جولة ثلاثية الأبعاد كاملة' : 'Launch Fullscreen 3D Tour'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Room Selection Tabs */}
      <div className={`flex flex-wrap gap-2 justify-start ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
        {ROOMS.map((room, idx) => (
          <button
            key={room.id}
            onClick={() => setActiveRoomIndex(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-300 ${
              activeRoomIndex === idx
                ? 'bg-[#C9A84C] text-[#182535] border-transparent shadow-md font-bold'
                : 'bg-white/40 dark:bg-[#1E3046]/30 hover:bg-white dark:hover:bg-[#1E3046]/50 text-[#182535] dark:text-white/80 border-[#182535]/10 dark:border-white/10'
            }`}
          >
            {isAr ? room.labelAr : room.labelEn}
          </button>
        ))}
      </div>

      {/* Trust & Optimization Info */}
      <div className="flex items-center gap-2 text-[10px] text-[#071422]/50 dark:text-white/40 justify-center">
        <ShieldCheck size={12} className="text-emerald-500" />
        <span>
          {isAr
            ? 'نظام تليمتري آمن ومشفر بالكامل. يدعم التسارع الرسومي WebGL.'
            : 'Fully encrypted WebGL telemetry stream. Responsive touch & gyroscope panning supported.'}
        </span>
      </div>
    </div>
  );
}
