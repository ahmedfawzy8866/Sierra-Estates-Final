import React, { useState, useRef } from 'react';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';
import { UserIntent, PropertyCard } from '../../types/sierra-estates';
import { MOCK_PROPERTIES } from '../../data/mock-properties';

export function DualViewCommandCenter({
  intent,
  onPropertySelect,
  selectedId
}: {
  intent: UserIntent;
  onPropertySelect: (id: string) => void;
  selectedId: string | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Dynamic card data based on intent
  const getDisplayValue = (prop: PropertyCard) => {
    switch (intent) {
      case 'investor':
        return `${prop.capRate}% cap rate`;
      case 'homebuyer':
        return prop.schoolDist;
      case 'collector':
        return `${(prop.price / 1_000_000).toFixed(1)}M`;
      default:
        return `$${(prop.price / 1_000_000).toFixed(1)}M`;
    }
  };

  return (
    <section className="h-screen flex gap-0 bg-[#0A1628]">
      {/* MAP LAYER (55%) */}
      <div
        ref={mapRef}
        className="w-[55%] bg-gradient-to-br from-[#1a2e4a] to-[#0d1b2e] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#C9A84C_1px,transparent_1px),linear-gradient(to_bottom,#C9A84C_1px,transparent_1px)] bg-[size:8rem_8rem] opacity-5"></div>

        {/* Map pins */}
        {MOCK_PROPERTIES.map(prop => (
          <button
            key={prop.id}
            onClick={() => onPropertySelect(prop.id)}
            style={{
              top: `${30 + Math.random() * 40}%`,
              left: `${20 + Math.random() * 60}%`
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              selectedId === prop.id ? 'z-20 scale-125' : hoveredId === prop.id ? 'z-10 scale-110' : 'z-5'
            }`}
            onMouseEnter={() => setHoveredId(prop.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className={`px-3 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all ${
                selectedId === prop.id
                  ? 'bg-[#C9A84C] text-[#0A1628] shadow-lg shadow-[#C9A84C]/50'
                  : hoveredId === prop.id
                  ? 'bg-[#C9A84C]/80 text-[#0A1628] shadow-md'
                  : 'bg-[#F4F0E8]/10 text-[#F4F0E8] border border-[#C9A84C]/30 backdrop-blur-sm'
              }`}
            >
              ${(prop.price / 1_000_000).toFixed(1)}M
            </div>
          </button>
        ))}

        {/* Map label */}
        <div className="absolute top-6 left-6 text-[#F4F0E8]/40 text-xs uppercase tracking-widest font-semibold">
          🗺 Mapbox GL Integration
        </div>
      </div>

      {/* FEED LAYER (45%) */}
      <div className="w-[45%] bg-[#0A1628] border-l border-[#C9A84C]/20 overflow-y-auto p-6 space-y-4">
        <div className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-4">
          Featured Listings
        </div>

        {MOCK_PROPERTIES.map(prop => (
          <button
            key={prop.id}
            onClick={() => onPropertySelect(prop.id)}
            onMouseEnter={() => setHoveredId(prop.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-300 ${
              selectedId === prop.id
                ? 'border-[#C9A84C] bg-[#C9A84C]/10'
                : hoveredId === prop.id
                ? 'border-[#C9A84C]/60 bg-[#C9A84C]/05 scale-[1.02]'
                : 'border-[#C9A84C]/20 bg-transparent hover:border-[#C9A84C]/40'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[#F4F0E8] font-semibold text-sm">{prop.title}</h3>
              <Heart className={`w-4 h-4 ${selectedId === prop.id ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-[#C9A84C]/40'}`} />
            </div>
            <p className="text-[#F4F0E8]/60 text-xs mb-3 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Dubai, UAE
            </p>
            <div className="flex justify-between text-xs text-[#C9A84C] mb-3">
              <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {prop.beds} beds</span>
              <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {prop.baths} baths</span>
              <span className="flex items-center gap-1"><Square className="w-3 h-3" /> {prop.area} sqft</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#C9A84C] font-bold text-lg">${(prop.price / 1_000_000).toFixed(1)}M</span>
              <span className="text-[#F4F0E8]/50 text-xs">{getDisplayValue(prop)}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
