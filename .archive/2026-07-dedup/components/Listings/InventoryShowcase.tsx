'use client';

/**
 * sierra estates — INVENTORY SHOWCASE
 * Demonstrates how to use the usesierraestates hook for data fetching
 * Component: High-fidelity grid of available properties with live data
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usesierraestates } from '@/hooks/usesierraestates';
import { LuxuryCard, EditorialHeading, SectionBadge } from '@/components/UI/LuxurySkeleton';
import { MapPin, TrendingUp, ArrowRight } from 'lucide-react';

const cardVariants = {
  initial: {
    opacity: 0,
    y: 100,
    x: 40,
    rotate: 12,
    scale: 0.9,
  },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 0.85,
      delay: i * 0.08,
    }
  }),
  exit: {
    opacity: 0,
    y: -120,
    x: -60,
    rotate: -15,
    scale: 0.85,
    transition: {
      duration: 0.4,
      ease: [0.32, 0.72, 0, 1]
    }
  }
};

interface InventoryShowcaseProps {
  filters?: {
    purpose: string;
    type: string;
    compound: string;
    budget: string;
  };
}

export default function InventoryShowcase({ filters }: InventoryShowcaseProps) {
  const { units, loading, error } = usesierraestates();

  // Sort and limit units for showcase (top 6 filtered)
  const featuredUnits = useMemo(() => {
    let result = units || [];

    // Filter available units
    result = result.filter(u => u.status === 'available');

    if (filters) {
      const { purpose, type, compound, budget } = filters;

      // 1. Filter by Purpose (heuristic pricing threshold)
      if (purpose === 'rent') {
        result = result.filter(u => u.price < 200000);
      } else if (purpose === 'resale') {
        result = result.filter(u => u.price >= 200000);
      }

      // 2. Filter by Property Type (case-insensitive fuzzy/exact check)
      if (type && type !== 'Apartment' && type !== 'شقة') {
        const tLower = type.toLowerCase();
        result = result.filter(u => {
          const uType = (u.propertyType || u.type || '').toLowerCase();
          
          // Arabic translations mapping helper
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

      // 3. Filter by Compound (fuzzy matching)
      if (compound && compound.trim()) {
        const cLower = compound.toLowerCase().trim();
        result = result.filter(u => {
          const uComp = (u.compound || u.location || '').toLowerCase();
          return uComp.includes(cLower) || cLower.includes(uComp);
        });
      }

      // 4. Filter by Budget
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

    return result
      .sort((a, b) => (b.intelligence?.roi || 0) - (a.intelligence?.roi || 0))
      .slice(0, 6);
  }, [units, filters]);

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        <p>Error loading inventory: {error}</p>
      </div>
    );
  }

  return (
    <section className="py-24 px-4 md:px-12 bg-gradient-to-b from-white to-[#F4F0E8]">
      {/* --- SECTION HEADER --- */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <SectionBadge text="Curated Inventory" className="mb-6" />
        <EditorialHeading level={1} className="mb-4">
          Available Selections
        </EditorialHeading>
        <p className="text-lg text-[#0A1628]/70 font-light leading-relaxed">
          Discover the finest luxury properties in New Cairo, intelligently matched to investor profiles.
          {loading && ' (Syncing live data...)'}
        </p>
      </div>

      {/* --- INVENTORY GRID --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
        {loading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-[#0A1628]/10 rounded-lg mb-4" />
                <div className="h-4 bg-[#0A1628]/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#0A1628]/10 rounded w-1/2" />
              </div>
            ))}
          </>
        ) : (
          <AnimatePresence mode="popLayout">
            {featuredUnits.length > 0 ? (
              featuredUnits.map((unit, i) => (
                <motion.div
                  key={unit.id}
                  layout
                  custom={i}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="group"
                >
                  <LuxuryCard className="h-full flex flex-col hover:shadow-3xl bg-white dark:bg-[#152232] border border-[#0A1628]/10 dark:border-white/10 rounded-3xl overflow-hidden transition-all duration-300">
                    {/* Image */}
                    <div className="relative h-64 -m-8 mb-4 rounded-lg overflow-hidden">
                      {unit.imageUrl ? (
                        <img
                          src={unit.imageUrl}
                          alt={unit.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0A1628]/20 to-[#C9A84C]/10 flex items-center justify-center">
                          <span className="text-[#0A1628]/30">No Image</span>
                        </div>
                      )}
                      {/* ROI Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-[#C9A84C] text-[#0A1628] rounded-full text-xs font-bold shadow-md">
                        {unit.intelligence?.roi || 8}% ROI
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-playfair text-xl text-[#0A1628] dark:text-white mb-2">{unit.title}</h3>
                      
                      <div className="flex items-center gap-1 text-sm text-[#0A1628]/60 dark:text-white/60 mb-4">
                        <MapPin size={14} />
                        <span>{unit.compound}</span>
                      </div>

                      <p className="text-lg font-bold text-[#C9A84C] mb-4">
                        {(unit.price / 1_000_000).toFixed(2)}M EGP
                      </p>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-[#0A1628]/10 dark:border-white/10">
                        <div>
                          <p className="text-xs text-[#0A1628]/50 dark:text-white/40 uppercase tracking-wider">Bedrooms</p>
                          <p className="font-bold text-[#0A1628] dark:text-white">{unit.rooms}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#0A1628]/50 dark:text-white/40 uppercase tracking-wider">Status</p>
                          <p className="font-bold text-[#0A1628] dark:text-white">{unit.status}</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between w-full px-4 py-3 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-lg text-[#C9A84C] font-semibold text-sm hover:bg-[#C9A84C]/20 transition-colors cursor-pointer"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </motion.button>
                  </LuxuryCard>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center py-12"
              >
                <p className="text-[#0A1628]/60 dark:text-white/60">No properties available at this time.</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* --- FOOTER CTA --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <button className="px-10 py-4 bg-[#0A1628] text-white font-semibold uppercase tracking-wider rounded-lg hover:bg-[#0A1628]/90 transition-colors">
          Browse Full Inventory
        </button>
      </motion.div>
    </section>
  );
}
