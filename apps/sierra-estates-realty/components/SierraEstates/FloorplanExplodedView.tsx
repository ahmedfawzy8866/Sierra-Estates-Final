import React, { useState } from 'react';

export function FloorplanExplodedView() {
  const [view, setView] = useState<'2d' | '3d'>('2d');

  return (
    <section className="bg-[#0F1B2E] px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-2">Visual Exploration</p>
            <h3 className="text-[#F4F0E8] text-2xl font-display italic">Floorplan & Layout</h3>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setView('2d')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                view === '2d'
                  ? 'bg-[#C9A84C] text-[#0A1628]'
                  : 'bg-transparent border border-[#C9A84C]/40 text-[#C9A84C] hover:border-[#C9A84C]'
              }`}
            >
              2D Blueprint
            </button>
            <button
              onClick={() => setView('3d')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                view === '3d'
                  ? 'bg-[#C9A84C] text-[#0A1628]'
                  : 'bg-transparent border border-[#C9A84C]/40 text-[#C9A84C] hover:border-[#C9A84C]'
              }`}
            >
              3D Rotatable
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a2e4a] to-[#0d1b2e] rounded-lg p-12 h-96 flex items-center justify-center border border-[#C9A84C]/20">
          <div className="text-center">
            <div className="text-6xl mb-4">{view === '2d' ? '📐' : '🧊'}</div>
            <p className="text-[#F4F0E8]/60 text-sm">
              {view === '2d' 
                ? 'Engineering blueprint with room-by-room breakdown'
                : 'Interactive 3D model - rotate to explore spatial configuration'
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
