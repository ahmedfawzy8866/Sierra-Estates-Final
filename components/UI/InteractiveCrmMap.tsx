'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, TrendingUp, Info } from 'lucide-react';
import { useSierraBlu } from '@/hooks/useSierraBlu';

// Leaflet imports (only loaded on client)
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const COMPOUNDS_LIST = [
  { key: 'mivida', nameEn: 'Mivida', nameAr: 'ميفيدا', coords: [30.0125, 31.4820] as [number, number], avgPrice: '12.5M EGP', avgPriceAr: '١٢.٥ مليون ج.م', roi: 9.4 },
  { key: 'villette', nameEn: 'Villette SODIC', nameAr: 'فيلت سوديك', coords: [30.0035, 31.4930] as [number, number], avgPrice: '18.2M EGP', avgPriceAr: '١٨.٢ مليون ج.م', roi: 9.1 },
  { key: 'eastown', nameEn: 'Eastown', nameAr: 'إيستاون', coords: [30.0150, 31.4980] as [number, number], avgPrice: '8.8M EGP', avgPriceAr: '٨.٨ مليون ج.م', roi: 8.5 },
  { key: 'mountain view', nameEn: 'Mountain View HP', nameAr: 'ماونتن فيو هايد بارك', coords: [29.9920, 31.4780] as [number, number], avgPrice: '9.6M EGP', avgPriceAr: '٩.٦ مليون ج.م', roi: 10.1 },
  { key: 'hyde park', nameEn: 'Hyde Park', nameAr: 'هايد بارك', coords: [29.9880, 31.4910] as [number, number], avgPrice: '11.0M EGP', avgPriceAr: '١١.٠ مليون ج.م', roi: 8.9 },
  { key: 'cairo festival city', nameEn: 'Cairo Festival City', nameAr: 'كايرو فستيفال سيتي', coords: [30.0280, 31.4050] as [number, number], avgPrice: '16.4M EGP', avgPriceAr: '١٦.٤ مليون ج.م', roi: 9.5 },
  { key: 'lake view', nameEn: 'Lake View', nameAr: 'ليك فيو', coords: [30.0210, 31.4620] as [number, number], avgPrice: '14.2M EGP', avgPriceAr: '١٤.٢ مليون ج.م', roi: 8.8 },
  { key: 'zed east', nameEn: 'Zed East', nameAr: 'زد إيست', coords: [29.9860, 31.4640] as [number, number], avgPrice: '10.5M EGP', avgPriceAr: '١٠.٥ مليون ج.م', roi: 10.3 },
  { key: 'madinaty', nameEn: 'Madinaty', nameAr: 'مدينتي', coords: [30.0750, 31.6250] as [number, number], avgPrice: '8.4M EGP', avgPriceAr: '٨.٤ مليون ج.م', roi: 8.8 },
  { key: 'swan lake', nameEn: 'Swan Lake', nameAr: 'سوان ليك', coords: [30.0450, 31.4680] as [number, number], avgPrice: '15.0M EGP', avgPriceAr: '١٥.٠ مليون ج.م', roi: 9.2 }
];

interface InteractiveCrmMapProps {
  isAr?: boolean;
  filters?: {
    purpose: string;
    type: string;
    compound: string;
    budget: string;
  };
  onSelectCompound?: (compoundName: string) => void;
}

// Custom Leaflet Marker Generator
const createCustomMarker = (name: string, count: number, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-leaflet-marker-wrapper',
    html: `
      <div class="relative flex items-center justify-center pointer-events-auto">
        <div class="absolute -inset-2.5 rounded-full bg-[#C9A84C]/25 ${count > 0 ? 'animate-ping' : ''}"></div>
        <div class="relative z-10 px-3.5 py-2 rounded-full border ${isSelected ? 'border-white bg-[#C9A84C] text-[#182535] shadow-[0_0_20px_rgba(201,168,76,0.6)]' : 'border-[#C9A84C] bg-[#182535] text-white'} text-[10px] font-bold font-mono shadow-xl flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-all">
          <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#182535]' : 'bg-[#C9A84C]'} inline-block"></span>
          <span>${name}</span>
          <span class="px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#182535]/15 text-[#182535]' : 'bg-[#C9A84C]/20 text-[#C9A84C]'} text-[9px] font-black">${count}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Map controls modifier
function MapController({ isUnlocked }: { isUnlocked: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (isUnlocked) {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
    } else {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
    }
  }, [map, isUnlocked]);
  return null;
}

export default function InteractiveCrmMap({ 
  isAr = false, 
  filters, 
  onSelectCompound 
}: InteractiveCrmMapProps) {
  const { units } = useSierraBlu();
  const [selectedCompoundKey, setSelectedCompoundKey] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Search-aware dynamic listings filtering
  const filteredUnits = useMemo(() => {
    let result = units || [];
    result = result.filter(u => u.status === 'available');

    if (filters) {
      const { purpose, type, budget } = filters;

      // 1. Filter by Purpose
      if (purpose === 'rent') {
        result = result.filter(u => u.price < 200000);
      } else if (purpose === 'resale') {
        result = result.filter(u => u.price >= 200000);
      }

      // 2. Filter by Property Type
      if (type && type !== 'Apartment' && type !== 'شقة') {
        const tLower = type.toLowerCase();
        result = result.filter(u => {
          const uType = (u.propertyType || u.type || '').toLowerCase();
          const arabicMap: Record<string, string> = {
            'فيلا': 'villa',
            'دوبلكس': 'duplex',
            'بنتهاوس': 'penthouse',
            'توين هاوس': 'twin house',
            'تاون هاوس': 'townhouse',
            'شقة': 'apartment'
          };
          const mappedType = arabicMap[type] || tLower;
          return uType.includes(mappedType) || mappedType.includes(uType);
        });
      }

      // 3. Filter by Budget
      if (budget && budget.trim()) {
        const b = budget.toLowerCase();
        result = result.filter(u => {
          const price = u.price || 0;
          if (purpose === 'rent') {
            if (b.includes('under 20k') || b.includes('أقل من ٢٠')) return price < 20000;
            if (b.includes('20k–50k') || b.includes('٢٠–٥٠')) return price >= 20000 && price <= 50000;
            if (b.includes('50k–100k') || b.includes('٥٠–١٠٠')) return price >= 50000 && price <= 100000;
            if (b.includes('100k+') || b.includes('أكثر من ١٠٠')) return price > 100000;
          } else {
            if (b.includes('under 5m') || b.includes('أقل من ٥')) return price < 5000000;
            if (b.includes('5m–10m') || b.includes('٥–١٠')) return price >= 5000000 && price <= 10000000;
            if (b.includes('10m–20m') || b.includes('١٠–٢٠')) return price >= 10000000 && price <= 20000000;
            if (b.includes('20m+') || b.includes('أكثر من ٢٠')) return price > 20000000;
          }
          return true;
        });
      }
    }

    return result;
  }, [units, filters]);

  // Compute property counts dynamically per compound
  const compoundCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredUnits.forEach(u => {
      const compName = (u.compound || '').toLowerCase().trim();
      const matched = COMPOUNDS_LIST.find(c => 
        compName.includes(c.key) || c.key.includes(compName)
      );
      if (matched) {
        counts[matched.key] = (counts[matched.key] || 0) + 1;
      }
    });
    return counts;
  }, [filteredUnits]);

  const activeCompound = useMemo(() => {
    return COMPOUNDS_LIST.find(c => c.key === selectedCompoundKey) || null;
  }, [selectedCompoundKey]);

  return (
    <div 
      className="relative w-full aspect-[16/10] min-h-[420px] bg-[#182535] rounded-[32px] overflow-hidden border border-white/10 shadow-luxury group select-none"
      onMouseLeave={() => setIsUnlocked(false)}
    >
      {/* Scroll Zoom Lock Interactive Overlay */}
      {!isUnlocked && (
        <div 
          className="absolute inset-0 z-[1000] bg-[#101B27]/60 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-[#101B27]/50"
          onClick={() => setIsUnlocked(true)}
        >
          <div className="px-6 py-3 bg-[#182535]/95 border border-[#C9A84C]/40 text-[#C9A84C] rounded-full text-xs font-mono font-bold tracking-wider uppercase animate-pulse flex items-center gap-2 shadow-2xl">
            <span>{isAr ? 'انقر لتفعيل الخريطة والتفاعل' : 'Click to interact with map'}</span>
          </div>
        </div>
      )}

      {/* Map Control Telemetry Header */}
      <div className={`absolute top-6 ${isAr ? 'right-6 text-right' : 'left-6 text-left'} z-[999] pointer-events-none bg-[#101B27]/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10`}>
        <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-1">
          {isAr ? 'مستكشف الخرائط الذكي' : 'Interactive Sector Intelligence'}
        </span>
        <h4 className="text-white font-playfair text-base font-light">
          {isAr ? 'خريطة القاهرة الجديدة الجغرافية' : 'New Cairo Yield Matrix Map'}
        </h4>
      </div>

      {/* Leaflet Core Map Component */}
      <MapContainer 
        center={[30.0071, 31.4345]} 
        zoom={12.5} 
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        className="w-full h-full z-10"
        zoomControl={false}
      >
        <MapController isUnlocked={isUnlocked} />
        
        {/* Sleek washed dark map theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {COMPOUNDS_LIST.map((comp) => {
          const count = compoundCounts[comp.key] || 0;
          const isSelected = selectedCompoundKey === comp.key;

          return (
            <Marker 
              key={comp.key}
              position={comp.coords}
              icon={createCustomMarker(isAr ? comp.nameAr : comp.nameEn, count, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelectedCompoundKey(comp.key);
                }
              }}
            />
          );
        })}
      </MapContainer>

      {/* Detail Overlay Card Panel */}
      <AnimatePresence>
        {activeCompound && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className={`absolute bottom-6 ${isAr ? 'left-6' : 'right-6'} bg-[#182535]/95 backdrop-blur-md border border-[#C9A84C]/30 p-6 rounded-3xl z-[999] shadow-2xl text-white w-80 max-w-[calc(100vw-3rem)]`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#C9A84C] font-mono">
                  {isAr ? 'المنطقة المحددة' : 'ACTIVE SECTOR'}
                </span>
                <h5 className="text-base font-playfair font-semibold">
                  {isAr ? activeCompound.nameAr : activeCompound.nameEn}
                </h5>
              </div>
              <button 
                onClick={() => setSelectedCompoundKey(null)} 
                className="text-white/40 hover:text-white transition-colors text-xs p-1 rounded-full hover:bg-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/60">{isAr ? 'متوسط السعر:' : 'Avg BUA Price:'}</span>
                <span className="text-[#C9A84C] font-semibold">
                  {isAr ? activeCompound.avgPriceAr : activeCompound.avgPrice}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/60">{isAr ? 'عائد الاستثمار المقدر:' : 'Estimated Yield/ROI:'}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp size={12} />
                  {activeCompound.roi}%
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-white/60">{isAr ? 'وحدات مطابقة للبحث:' : 'Matching Available Units:'}</span>
                <span className="font-bold text-[#C9A84C]">{compoundCounts[activeCompound.key] || 0} {isAr ? 'وحدات' : 'Units'}</span>
              </div>
            </div>
            
            <button 
              className="mt-4 w-full py-3 bg-gradient-to-r from-[#C9A84C] to-[#E9C176] text-[#182535] font-semibold text-xs rounded-xl hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all uppercase tracking-wider font-mono cursor-pointer"
              onClick={() => {
                if (onSelectCompound) {
                  onSelectCompound(activeCompound.nameEn);
                }
              }}
            >
              {isAr ? 'عرض الوحدات المتاحة ↗' : 'Browse Sector Listings ↗'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
