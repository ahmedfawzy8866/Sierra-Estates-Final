"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Users,
  MapPin,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

type Screen =
  | 'dashboard' | 'listings' | 'crm' | 'leads' | 'reports' | 'team'
  | 'clients' | 'protocols' | 'media' | 'experiences' | 'ledger' | 'sync'
  | 'processing' | 'nexus' | 'intelligence' | 'map' | 'system'
  | 'team-crm' | 'admin-dashboard' | 'database';

interface MobileNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const TABS: { id: Screen | 'menu'; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={22} /> },
  { id: 'listings', label: 'Listings', icon: <Building2 size={22} /> },
  { id: 'map', label: 'Map', icon: <MapPin size={22} /> },
  { id: 'crm', label: 'CRM', icon: <Users size={22} /> },
  { id: 'menu', label: 'Menu', icon: <Menu size={22} /> },
];

const COMPOUNDS_21 = [
  "Uptown Cairo", "Mivida", "Marassi", "Hyde Park", "Palm Hills New Cairo", 
  "Mountain View iCity", "Villette", "ZED East", "Taj City", "Sarai", 
  "District 5", "Eastown", "The Brooks", "Stone Residence", "Swan Lake Residences",
  "Cairo Gate", "Al Burouj", "O West", "Badya", "Silversands", "Hacienda Bay"
];

export default function MobileNav({ activeScreen, onNavigate }: MobileNavProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isCompoundsExpanded, setIsCompoundsExpanded] = useState(true);

  return (
    <>
      <AnimatePresence>
        {isOverlayOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[80] md:hidden overflow-y-auto"
            style={{
              background: 'color-mix(in srgb, var(--surface) 80%, transparent)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)'
            }}
          >
            <div className="p-6 pb-32">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold tracking-widest text-gold uppercase">Sierra Estates Menu</h2>
                <button onClick={() => setIsOverlayOpen(false)} className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                  <button 
                    onClick={() => setIsCompoundsExpanded(!isCompoundsExpanded)}
                    className="w-full flex items-center justify-between p-4 bg-white/5 text-white font-semibold"
                  >
                    <span>Compounds Hub (21)</span>
                    <motion.div animate={{ rotate: isCompoundsExpanded ? 180 : 0 }}>
                      <ChevronDown size={20} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isCompoundsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-2 grid grid-cols-1 gap-1">
                          {COMPOUNDS_21.map((compound) => (
                            <button
                              key={compound}
                              onClick={() => {
                                onNavigate('listings');
                                setIsOverlayOpen(false);
                              }}
                              className="text-left px-4 py-3 text-sm text-white/70 hover:text-gold hover:bg-white/5 rounded-xl transition-colors"
                            >
                              {compound}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[70] flex items-center justify-around"
        style={{
          background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          height: 'calc(64px + env(safe-area-inset-bottom))',
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id !== 'menu' && activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'menu') setIsOverlayOpen(true);
                else onNavigate(tab.id as Screen);
              }}
              className="relative flex flex-col items-center justify-center gap-[3px] flex-1 h-full"
              style={{ color: isActive ? '#D4AF37' : 'var(--text-dim)' }}
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full"
                  style={{ background: '#D4AF37' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {tab.icon}
              </motion.div>
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ opacity: isActive ? 1 : 0.5 }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
