import React from 'react';

export function TrustBadges() {
  return (
    <section className="bg-[#0F1B2E] px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-2">Verification & Trust</p>
        <h3 className="text-[#F4F0E8] text-2xl font-display italic mb-12">Verified Credentials</h3>

        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: '✓', label: 'Price Verified', detail: 'Updated 4 hours ago' },
            { icon: '📸', label: 'Physical Walkthrough', detail: 'Confirmed by agent' },
            { icon: '📋', label: 'Title Cleared', detail: 'RERA certified' }
          ].map((badge, i) => (
            <div key={i} className="bg-[#0A1628] rounded-lg p-6 border border-[#C9A84C]/30">
              <div className="text-3xl mb-3">{badge.icon}</div>
              <p className="text-[#F4F0E8] font-semibold text-sm mb-1">{badge.label}</p>
              <p className="text-[#F4F0E8]/60 text-xs">{badge.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
