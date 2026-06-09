'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, TrendingUp } from 'lucide-react';

interface MapNode {
  id: string;
  nameEn: string;
  nameAr: string;
  top: string;
  left: string;
  avgPrice: string;
  avgPriceAr: string;
  roi: number;
  propertiesCount: number;
}

const MAP_NODES: MapNode[] = [
  {
    id: 'fifth-settlement',
    nameEn: 'Fifth Settlement',
    nameAr: 'التجمع الخامس',
    top: '55%',
    left: '35%',
    avgPrice: '5.6M EGP',
    avgPriceAr: '٥.٦ مليون ج.م',
    roi: 9.2,
    propertiesCount: 142,
  },
  {
    id: 'madinaty',
    nameEn: 'Madinaty',
    nameAr: 'مدينتي',
    top: '30%',
    left: '75%',
    avgPrice: '8.4M EGP',
    avgPriceAr: '٨.٤ مليون ج.م',
    roi: 8.8,
    propertiesCount: 96,
  },
  {
    id: 'mostakbal-city',
    nameEn: 'Mostakbal City',
    nameAr: 'مستقبل سيتي',
    top: '40%',
    left: '60%',
    avgPrice: '4.8M EGP',
    avgPriceAr: '٤.٨ مليون ج.م',
    roi: 10.5,
    propertiesCount: 110,
  },
  {
    id: 'uptown-cairo',
    nameEn: 'Uptown Cairo',
    nameAr: 'أبتاون كايرو',
    top: '65%',
    left: '15%',
    avgPrice: '12.2M EGP',
    avgPriceAr: '١٢.٢ مليون ج.م',
    roi: 7.9,
    propertiesCount: 48,
  },
];

interface InteractiveCrmMapProps {
  isAr?: boolean;
}

export default function InteractiveCrmMap({ isAr = false }: InteractiveCrmMapProps) {
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);

  return (
    <div className="relative w-full aspect-[16/10] min-h-[380px] bg-gradient-to-br from-[#071422] to-[#0A1520] rounded-3xl overflow-hidden border border-white/10 shadow-luxury">
      {/* Dynamic Grid Background representing radar/telemetry */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Vectors and Rings for visual sci-fi aesthetics */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="50%" r="20%" fill="none" stroke="url(#goldGradient)" strokeWidth="1" strokeDasharray="5 5" />
          <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
          <line x1="15%" y1="65%" x2="35%" y2="55%" stroke="#C9A84C" strokeWidth="0.75" strokeDasharray="4 4" />
          <line x1="35%" y1="55%" x2="60%" y2="40%" stroke="#C9A84C" strokeWidth="0.75" strokeDasharray="4 4" />
          <line x1="60%" y1="40%" x2="75%" y2="30%" stroke="#C9A84C" strokeWidth="0.75" strokeDasharray="4 4" />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9A84C" />
              <stop offset="100%" stopColor="#E9C176" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Title Overlays */}
      <div className={`absolute top-6 ${isAr ? 'right-6' : 'left-6'} z-10 pointer-events-none`}>
        <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-1">
          {isAr ? 'مستكشف الخرائط الذكي' : 'Interactive Sector Intelligence'}
        </span>
        <h4 className="text-white font-playfair text-xl font-light">
          {isAr ? 'خريطة عائد الاستثمار بالقاهرة الجديدة' : 'New Cairo Yield Matrix Map'}
        </h4>
      </div>

      {/* Map Nodes Layer */}
      {MAP_NODES.map((node) => {
        const isSelected = selectedNode?.id === node.id;
        return (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            style={{ top: node.top, left: node.left }}
            onClick={() => setSelectedNode(node)}
          >
            {/* Pulsing Base Ring */}
            <div className="absolute inset-0 -m-3 rounded-full bg-[#1E88D9]/20 animate-ping group-hover:bg-[#C9A84C]/20 transition-all duration-300" />
            
            {/* Inner Interactive Circle */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
                isSelected 
                  ? 'bg-[#C9A84C] border-white text-[#071422] shadow-[0_0_20px_rgba(201,168,76,0.5)]' 
                  : 'bg-[#071422]/90 border-[#1E88D9] text-[#1E88D9] group-hover:border-[#C9A84C] group-hover:text-[#C9A84C]'
              }`}
            >
              <MapPin size={16} className={isSelected ? 'fill-current' : ''} />
            </motion.div>

            {/* Micro Floating Pricing Overlay */}
            <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#071422]/90 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/90 font-mono shadow-md">
              {isAr ? node.avgPriceAr : node.avgPrice}
            </div>
          </div>
        );
      })}

      {/* Information Panel (Animate Presence) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-[#071422]/95 backdrop-blur-md border border-[#C9A84C]/30 p-6 rounded-2xl z-30 shadow-luxury text-white`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#C9A84C] font-mono">
                  {isAr ? 'المنطقة المحددة' : 'ACTIVE SECTOR'}
                </span>
                <h5 className="text-lg font-playfair font-semibold">
                  {isAr ? selectedNode.nameAr : selectedNode.nameEn}
                </h5>
              </div>
              <button 
                onClick={() => setSelectedNode(null)} 
                className="text-white/40 hover:text-white transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/60">{isAr ? 'متوسط السعر:' : 'Avg BUA Price:'}</span>
                <span className="text-[#C9A84C] font-semibold">
                  {isAr ? selectedNode.avgPriceAr : selectedNode.avgPrice}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/60">{isAr ? 'عائد الاستثمار المقدر:' : 'Estimated Yield/ROI:'}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp size={12} />
                  {selectedNode.roi}%
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-white/60">{isAr ? 'العقارات المتاحة:' : 'Advisory Portfolio:'}</span>
                <span>{selectedNode.propertiesCount} {isAr ? 'وحدات' : 'Units'}</span>
              </div>
            </div>
            
            <button 
              className="mt-4 w-full py-2 bg-gradient-to-r from-[#C9A84C] to-[#E9C176] text-[#071422] font-semibold text-xs rounded-lg hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all uppercase tracking-wider"
              onClick={() => alert(`Navigating to filtered listings for ${selectedNode.nameEn}`)}
            >
              {isAr ? 'عرض الوحدات المتاحة ↗' : 'Browse Sector Listings ↗'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
