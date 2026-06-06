import React from 'react';
import { UserIntent } from '../../types/sierra-blu';

export function OnboardingIntent({ onSelect }: { onSelect: (intent: UserIntent) => void }) {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#0A1628] to-[#0F1B2E] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="font-display text-6xl italic text-[#F4F0E8] mb-4">Sierra Blu</h1>
        <p className="text-[#F4F0E8]/70 text-lg mb-16">Find your next property. Invest with intelligence.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'homebuyer', icon: '🏡', label: 'Primary Homebuyer', desc: 'School districts, transit, neighborhoods' },
            { id: 'collector', icon: '✨', label: 'Luxury Collector', desc: 'Prestige, exclusivity, heritage' },
            { id: 'investor', icon: '📊', label: 'Data-Driven Investor', desc: 'Yield, cap rate, cash flow' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id as UserIntent)}
              className="group p-8 border-2 border-[#C9A84C] rounded-lg bg-transparent hover:bg-[#C9A84C]/10 transition-all duration-300 hover:scale-105"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wider mb-2">{item.label}</h3>
              <p className="text-[#F4F0E8]/60 text-xs">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
