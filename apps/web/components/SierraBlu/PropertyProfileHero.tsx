import React from 'react';
import { MapPin } from 'lucide-react';
import { PropertyCard } from '../../types/sierra-blu';

export function PropertyProfileHero({ property }: { property: PropertyCard }) {
  return (
    <section className="relative h-96 bg-[#0A1628] overflow-hidden">
      {/* Hero image */}
      <img
        src={property.image}
        alt={property.title}
        className="w-full h-full object-cover opacity-40"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/50 to-transparent"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-2">Featured Property</p>
            <h2 className="text-[#F4F0E8] text-4xl font-display italic mb-2">{property.title}</h2>
            <p className="text-[#F4F0E8]/70 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dubai, UAE
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-1">Price</p>
            <p className="text-[#F4F0E8] text-3xl font-bold">${(property.price / 1_000_000).toFixed(1)}M</p>
          </div>
        </div>
      </div>
    </section>
  );
}
