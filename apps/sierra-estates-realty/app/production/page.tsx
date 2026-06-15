'use client';

import React, { useState } from 'react';
import { Phone, Mail } from 'lucide-react';
import { UserIntent } from '../../types/sierra-estates';
import { MOCK_PROPERTIES } from '../../data/mock-properties';

// Import newly refactored components
import { OnboardingIntent } from '../../components/SierraEstates/OnboardingIntent';
import { DualViewCommandCenter } from '../../components/SierraEstates/DualViewCommandCenter';
import { PropertyProfileHero } from '../../components/SierraEstates/PropertyProfileHero';
import { FloorplanExplodedView } from '../../components/SierraEstates/FloorplanExplodedView';
import { FinTechTerminal } from '../../components/SierraEstates/FinTechTerminal';
import { TrustBadges } from '../../components/SierraEstates/TrustBadges';
import { CoBuyerHub } from '../../components/SierraEstates/CoBuyerHub';

export default function SierraEstatesProductionPage() {
  const [intent, setIntent] = useState<UserIntent>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(MOCK_PROPERTIES[0].id);
  const selectedProperty = MOCK_PROPERTIES.find(p => p.id === selectedPropertyId) || MOCK_PROPERTIES[0];

  if (!intent) {
    return <OnboardingIntent onSelect={setIntent} />;
  }

  return (
    <div className="bg-[#0A1628] text-[#F4F0E8] min-h-screen">
      {/* Section 2: Dual-View */}
      <DualViewCommandCenter
        intent={intent}
        onPropertySelect={setSelectedPropertyId}
        selectedId={selectedPropertyId}
      />

      {/* Section 3: Property Profile Hero */}
      <PropertyProfileHero property={selectedProperty} />

      {/* Section 4: Floorplan */}
      <FloorplanExplodedView />

      {/* Section 5: Fintech Terminal */}
      <FinTechTerminal property={selectedProperty} />

      {/* Section 6: Trust Badges */}
      <TrustBadges />

      {/* Section 7: Co-Buyer Hub */}
      <CoBuyerHub />

      {/* Section 8: Footer */}
      <footer className="bg-[#0F1B2E] border-t border-[#C9A84C]/20 px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-8 mb-12">
            <div>
              <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-4">Product</p>
              <ul className="space-y-2 text-sm text-[#F4F0E8]/70">
                <li><a href="#" className="hover:text-[#C9A84C]">Search</a></li>
                <li><a href="#" className="hover:text-[#C9A84C]">Properties</a></li>
                <li><a href="#" className="hover:text-[#C9A84C]">Investment</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-4">Company</p>
              <ul className="space-y-2 text-sm text-[#F4F0E8]/70">
                <li><a href="#" className="hover:text-[#C9A84C]">About</a></li>
                <li><a href="#" className="hover:text-[#C9A84C]">Blog</a></li>
                <li><a href="#" className="hover:text-[#C9A84C]">Careers</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-[#F4F0E8]/70">
                <li><a href="#" className="hover:text-[#C9A84C]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#C9A84C]">Terms</a></li>
                <li><a href="#" className="hover:text-[#C9A84C]">Cookies</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-4">Contact</p>
              <ul className="space-y-2 text-sm text-[#F4F0E8]/70">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +971 50 123 4567</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@sierraestates.ae</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#C9A84C]/20 pt-8 text-center text-[#F4F0E8]/50 text-xs">
            <p>© 2026 Sierra Estates Realty. Beyond Brokerage.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
