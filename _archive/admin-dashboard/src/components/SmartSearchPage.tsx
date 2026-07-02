import React, { useState } from 'react';
import SmartFilterBar from './SmartFilterBar';
import { Building2, BedDouble, Bath, MapPin, ArrowUpDown } from 'lucide-react';

interface PropertyResult {
  id: string;
  title?: string;
  titleAr?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  compound?: string;
  location?: string;
  propertyType?: string;
  featuredImage?: string;
  images?: string[];
  status?: string;
}

export default function SmartSearchPage() {
  const [results, setResults] = useState<PropertyResult[]>([]);
  const [parsedFilters, setParsedFilters] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'area-desc'>('price-asc');

  const handleResults = (newResults: any[], filters: any) => {
    setResults(newResults);
    setParsedFilters(filters);
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'area-desc') return (b.area || 0) - (a.area || 0);
    return 0;
  });

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    if (price >= 1000000) return `EGP ${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `EGP ${(price / 1000).toFixed(0)}K`;
    return `EGP ${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
            AI SMART SEARCH
          </span>
          <span className="text-[9px] font-mono text-slate-500">
            Powered by Gemini
          </span>
        </div>

        <div className="p-5 space-y-6">
          {/* Smart Filter Bar */}
          <SmartFilterBar
            placeholder='Try: "3 bedroom villa in New Cairo under 5 million" or "rent apartment Mivida"'
            onResults={handleResults}
          />

          {/* Sort Controls */}
          {results.length > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 font-mono uppercase tracking-wider">Sort by:</span>
              {[
                { key: 'price-asc', label: 'Price ↑' },
                { key: 'price-desc', label: 'Price ↓' },
                { key: 'area-desc', label: 'Largest' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key as any)}
                  className={`px-3 py-1.5 rounded border text-[10px] font-mono uppercase tracking-wider transition ${
                    sortBy === key
                      ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                      : 'border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <ArrowUpDown size={10} className="inline mr-1" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Results Grid */}
          {sortedResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedResults.map((property) => (
                <div
                  key={property.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg overflow-hidden hover:border-cyan-500/30 transition group"
                >
                  {/* Image */}
                  <div className="h-40 bg-slate-900 overflow-hidden">
                    {property.featuredImage || property.images?.[0] ? (
                      <img
                        src={property.featuredImage || property.images?.[0]}
                        alt={property.title || 'Property'}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Building2 size={32} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-white text-sm font-semibold line-clamp-1">
                        {property.title || property.titleAr || 'Untitled Property'}
                      </h3>
                    </div>

                    <div className="text-lg font-bold text-cyan-400">
                      {formatPrice(property.price)}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      {property.bedrooms !== undefined && (
                        <span className="flex items-center gap-1">
                          <BedDouble size={12} /> {property.bedrooms} bed
                        </span>
                      )}
                      {property.bathrooms !== undefined && (
                        <span className="flex items-center gap-1">
                          <Bath size={12} /> {property.bathrooms} bath
                        </span>
                      )}
                      {property.area !== undefined && (
                        <span className="flex items-center gap-1">
                          {property.area} m²
                        </span>
                      )}
                    </div>

                    {(property.compound || property.location) && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <MapPin size={10} />
                        {property.compound || property.location}
                      </div>
                    )}

                    {property.propertyType && (
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-[9px] font-mono uppercase tracking-wider text-slate-400">
                        {property.propertyType}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {results.length === 0 && parsedFilters === null && (
            <div className="text-center py-16 text-slate-500">
              <Building2 size={48} className="mx-auto mb-4 text-slate-700" />
              <p className="text-sm">Search for properties using natural language</p>
              <p className="text-xs mt-1 text-slate-600">e.g. "2 bedroom apartment in Madinaty for rent under 50K/year"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
