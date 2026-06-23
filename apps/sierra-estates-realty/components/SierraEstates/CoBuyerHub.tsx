import React, { useState } from 'react';

export function CoBuyerHub() {
  const [consensus] = useState(75);

  return (
    <section className="bg-[#0A1628] px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-2">Partnership & Collaboration</p>
        <h3 className="text-[#F4F0E8] text-2xl font-display italic mb-12">Shared Portfolio</h3>

        <div className="grid grid-cols-2 gap-8">
          {/* Left: Status & Voting */}
          <div>
            <div className="bg-[#0F1B2E] rounded-lg p-6 border border-[#C9A84C]/30 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">👥</div>
                <div>
                  <p className="text-[#F4F0E8] font-semibold">You + Sarah</p>
                  <p className="text-[#F4F0E8]/60 text-xs">Partnership active • 4 properties</p>
                </div>
              </div>
              <div className="bg-[#0A1628] rounded p-3 mt-4">
                <p className="text-[#F4F0E8]/60 text-xs uppercase tracking-wider mb-2">Consensus Score</p>
                <p className="text-[#C9A84C] text-2xl font-bold">{consensus}%</p>
              </div>
            </div>

            <div className="space-y-3">
              {['Downtown Penthouse', 'Marina Villa', 'Historic Townhouse'].map((name, i) => (
                <div key={i} className="bg-[#0F1B2E] rounded-lg p-4 border border-[#C9A84C]/20">
                  <p className="text-[#F4F0E8] text-sm font-semibold mb-2">{name}</p>
                  <div className="flex gap-2 text-xs">
                    <button className="flex-1 py-2 bg-[#C9A84C]/20 text-[#C9A84C] rounded hover:bg-[#C9A84C]/30">👍 You</button>
                    <button className="flex-1 py-2 bg-[#C9A84C]/20 text-[#C9A84C] rounded hover:bg-[#C9A84C]/30">👍 Sarah</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Shared Notes */}
          <div className="bg-[#0F1B2E] rounded-lg p-6 border border-[#C9A84C]/30">
            <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-4">Shared Notes & Chat</p>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              <div className="bg-[#0A1628] rounded-lg p-4">
                <p className="text-[#C9A84C] text-xs font-semibold mb-1">Sarah • 2 hours ago</p>
                <p className="text-[#F4F0E8]/80 text-sm">Downtown penthouse has amazing light. Can we negotiate HOA fees?</p>
              </div>

              <div className="bg-[#0A1628] rounded-lg p-4 ml-4">
                <p className="text-[#C9A84C] text-xs font-semibold mb-1">You • just now</p>
                <p className="text-[#F4F0E8]/80 text-sm">Called the broker. HOA is fixed, but sellers might cover closing costs.</p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Add a note..."
              className="w-full mt-4 px-3 py-2 bg-[#0A1628] border border-[#C9A84C]/30 rounded text-[#F4F0E8] text-sm placeholder-[#F4F0E8]/40 focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
