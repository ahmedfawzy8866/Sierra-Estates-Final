'use client';
/**
 * ══════════════════════════════════════════════════════════════════════════════
 * SMART FILTER MODAL — Professional Edition
 * Refined with fluid animations, multi-select, and dynamic budget display
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

const ALL_COMPOUNDS = [
  'Katameya Heights', 'Katameya Dunes', 'Swan Lake', 'Mivida', 'Cairo Festival City',
  'Hyde Park', 'Taj City', 'Eastown', 'Mountain View iCity', 'Zed East',
  'Palm Hills NC', 'The Waterway', 'Lake View', 'Fifth Square', 'Villette',
  'Stone Residence', 'The Square', 'El Patio Oro', 'El Patio 7', 'Katameya Gardens',
  'Village Gardens', 'Galleria Moon Valley', '90 Avenue', 'Azzar New Cairo',
  'District 5', 'The Brooks', 'STEI8HT', 'The Crest', 'Azad Views',
  'Eastshire', 'Aster Residence', 'The MarQ', 'Capital Gate', 'Bloomfields',
  'IL Bosco City', 'Odyssia', 'Haptown', 'Sarai',
];

export default function SearchRequestModal({ isOpen, onClose, onSubmit }: SearchRequestModalProps) {
  const [purpose, setPurpose] = useState<'rent' | 'resale'>('resale');
  const [priceSlider, setPriceSlider] = useState(50);
  const [propType, setPropType] = useState('All');
  const [beds, setBeds] = useState<number | null>(null);
  const [cpdSearch, setCpdSearch] = useState('');
  const [cpdSelected, setCpdSelected] = useState<string[]>([]);

  const handleToggleCompound = (cpdName: string) => {
    setCpdSelected((prev) =>
      prev.includes(cpdName)
        ? prev.filter((x) => x !== cpdName)
        : [...prev, cpdName]
    );
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        purpose,
        priceSlider,
        propType,
        beds,
        compounds: cpdSelected,
      });
    }
    onClose();
  };

  const filteredCompounds = ALL_COMPOUNDS.filter((nm) =>
    !cpdSearch || nm.toLowerCase().includes(cpdSearch.toLowerCase())
  );

  const priceDisplay =
    purpose === 'rent'
      ? `$${(500 + Math.round((priceSlider / 100) * 14500)).toLocaleString()}/mo`
      : `EGP ${(1 + (priceSlider / 100) * 49).toFixed(1)}M`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end md:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white text-black rounded-t-3xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="sticky top-0 bg-white pt-3 pb-0 z-20">
              <div className="flex justify-center mb-4">
                <div className="w-9 h-1 rounded-full bg-gray-300" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-200">
                <div>
                  <div className="text-[7px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                    AI-POWERED SEARCH
                  </div>
                  <h2 className="text-xl font-light text-gray-900">Smart Filter</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 py-6 space-y-5 pb-10">
              {/* Rent / Resale Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                {[
                  ['resale', '🏠  Resale'],
                  ['rent', '🔑  Rent'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setPurpose(value as 'rent' | 'resale')}
                    className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      purpose === value
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 shadow-md'
                        : 'bg-transparent text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Compound Multi-Select */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">
                    Compound (multi-select)
                  </div>
                  {cpdSelected.length > 0 && (
                    <button
                      onClick={() => {
                        setCpdSelected([]);
                        setCpdSearch('');
                      }}
                      className="text-[8px] font-bold text-red-600 hover:text-red-700"
                    >
                      {cpdSelected.length} selected · clear
                    </button>
                  )}
                </div>
                <input
                  value={cpdSearch}
                  onChange={(e) => setCpdSearch(e.target.value)}
                  placeholder="Search 38 compounds…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 mb-3 bg-gray-50"
                />
                <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                  {filteredCompounds.map((nm, i) => {
                    const isSelected = cpdSelected.includes(nm);
                    return (
                      <button
                        key={i}
                        onClick={() => handleToggleCompound(nm)}
                        className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-gray-900 text-amber-400 border border-amber-400'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{nm}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Property Type */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="text-[7px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Property Type
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Villa', 'Apartment', 'Twin House', 'Townhouse', 'Duplex', 'Penthouse'].map((tp) => (
                    <button
                      key={tp}
                      onClick={() => setPropType(tp)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        propType === tp
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tp === 'All' ? 'Any Type' : tp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="text-[7px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Bedrooms
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[null, 1, 2, 3, 4, 5, 6].map((b) => (
                    <button
                      key={b === null ? 'any' : b}
                      onClick={() => setBeds(b)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        beds === b
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {b === null ? 'Any' : `${b}B`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Slider */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">
                    Budget
                  </div>
                  <span className="font-mono text-sm font-bold text-amber-600">
                    {priceDisplay}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceSlider}
                  onChange={(e) => setPriceSlider(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
                <div className="flex justify-between mt-2 text-[8px] text-gray-500">
                  <span>{purpose === 'rent' ? '$500/mo' : 'EGP 1M'}</span>
                  <span>{purpose === 'rent' ? '$15,000/mo' : 'EGP 50M+'}</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 text-amber-300 font-bold rounded-xl uppercase tracking-wider text-sm hover:shadow-lg transition-all"
              >
                Search for your identical match home
              </button>
              <div className="text-center text-[8px] text-gray-400">
                ⚡ Powered by AI
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
