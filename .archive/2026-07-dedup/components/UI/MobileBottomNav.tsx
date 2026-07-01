'use client';

import React from 'react';
import { Compass, Map, Percent, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAr?: boolean;
}

export default function MobileBottomNav({ activeTab, setActiveTab, isAr = false }: MobileBottomNavProps) {
  const tabs = [
    { id: 'explore', label: isAr ? 'استكشف' : 'Explore', icon: Compass },
    { id: 'map', label: isAr ? 'خريطة' : 'Map Index', icon: Map },
    { id: 'yields', label: isAr ? 'عائد الذكاء' : 'AI Yields', icon: Percent },
    { id: 'console', label: isAr ? 'لوحة التحكم' : 'Console', icon: Terminal },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 dark:bg-[#071422]/80 backdrop-blur-lg border-t border-[#071422]/10 dark:border-white/10 pb-safe shadow-luxury">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center w-16 h-full text-center transition-all duration-300 focus:outline-none"
            >
              <div
                className={`flex items-center justify-center p-2 rounded-full transition-colors duration-300 ${
                  isActive
                    ? 'text-[#C9A84C]'
                    : 'text-[#071422]/60 dark:text-white/60 hover:text-[#C9A84C]/80'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'} />
              </div>
              <span
                className={`text-[9px] font-medium tracking-wide uppercase transition-all duration-300 ${
                  isActive
                    ? 'text-[#C9A84C] font-semibold'
                    : 'text-[#071422]/50 dark:text-white/50'
                }`}
              >
                {tab.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute top-0 w-8 h-[2px] bg-[#C9A84C] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
