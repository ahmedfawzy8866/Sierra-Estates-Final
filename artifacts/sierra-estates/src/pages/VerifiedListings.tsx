import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────

interface PropertyUnit {
  id: string;
  title: string;
  compound: string;
  price: number;
  beds: number;
  approved: boolean;
  source: 'Manual_Admin' | 'PropertyFinder_API' | 'WhatsApp_Scraper';
  description?: string;
  images?: string[];
  area?: number;
  bathrooms?: number;
  propertyType?: string;
}

// ─── Verified compounds (21 premium New Cairo) ────────────────────────

const VERIFIED_COMPOUNDS = [
  'Mivida (Emaar Misr)',
  'Uptown Cairo',
  'The Brooks',
  'Marakez District 5',
  'Hyde Park',
  'Sarab (Uptown Cairo)',
  'Tag Sultan',
  'Mountain View iCity',
  'The Square (SODIC)',
  'Layan Residence',
  'Stone Residence',
  'Capital Heights 2',
  'Creek Town',
  'Amorada',
  'Il Bosco City',
  'Palm Hills New Cairo',
  'Villette (SODIC)',
  'Eastown (SODIC)',
  'The Waterway',
  'Madrinet El-Mostakbal (Creek Town Side)',
  'ZED East',
];

// ─── Sample data fallback (shows when Firebase isn't configured or empty) ─

const SAMPLE_UNITS: PropertyUnit[] = [
  {
    id: 'sample-villa-01',
    title: 'Grand Lakefront Villa — 5BR with Infinity Pool',
    compound: 'Mivida (Emaar Misr)',
    price: 28500000,
    beds: 5,
    approved: true,
    source: 'Manual_Admin',
    description: 'Contemporary 5BR lakefront villa with private infinity pool, floor-to-ceiling glass, and panoramic sunset views.',
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85&auto=format&fit=crop'],
    area: 720,
    bathrooms: 6,
    propertyType: 'villa',
  },
  {
    id: 'sample-villa-02',
    title: 'Golf-View Palace Estate — 6BR with Home Theater',
    compound: 'Hyde Park',
    price: 42000000,
    beds: 6,
    approved: true,
    source: 'PropertyFinder_API',
    description: 'Six-bedroom palace overlooking the golf course. Marble foyer, double-height ceilings, private home theater.',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85&auto=format&fit=crop'],
    area: 1100,
    bathrooms: 8,
    propertyType: 'villa',
  },
  {
    id: 'sample-villa-03',
    title: 'Modern Architect Villa — Smart Home + Lap Pool',
    compound: 'Palm Hills New Cairo',
    price: 33500000,
    beds: 5,
    approved: true,
    source: 'Manual_Admin',
    description: 'Architect-designed 5BR villa with clean lines, smart-home automation, and a 25-meter lap pool.',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=85&auto=format&fit=crop'],
    area: 850,
    bathrooms: 6,
    propertyType: 'villa',
  },
  {
    id: 'sample-apt-01',
    title: 'Furnished 2BR Apartment — Italian Kitchen',
    compound: 'ZED East',
    price: 28000,
    beds: 2,
    approved: true,
    source: 'WhatsApp_Scraper',
    description: 'Move-in ready 2BR apartment with Italian kitchen, marble bathrooms, and balcony overlooking central park.',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85&auto=format&fit=crop'],
    area: 165,
    bathrooms: 2,
    propertyType: 'apartment',
  },
  {
    id: 'sample-pent-01',
    title: 'Sky Penthouse — 360° Panoramic + Rooftop Pool',
    compound: 'Eastown (SODIC)',
    price: 14750000,
    beds: 4,
    approved: true,
    source: 'Manual_Admin',
    description: 'Duplex penthouse with 360° panoramic views of New Cairo, private rooftop with plunge pool, and double-height living room.',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85&auto=format&fit=crop'],
    area: 380,
    bathrooms: 4,
    propertyType: 'penthouse',
  },
  {
    id: 'sample-duplex-01',
    title: 'Garden Duplex — 3BR with Lake View',
    compound: 'Hyde Park',
    price: 38000,
    beds: 3,
    approved: true,
    source: 'PropertyFinder_API',
    description: 'Spacious 3BR duplex with direct garden access, modern kitchen, and master suite with walk-in closet.',
    images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85&auto=format&fit=crop'],
    area: 290,
    bathrooms: 3,
    propertyType: 'duplex',
  },
];

// ─── Component ────────────────────────────────────────────────────────

export default function VerifiedListings() {
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  useEffect(() => {
    // Guard: skip Firestore listener if Firebase isn't configured.
    // Falls back to sample data so the page always shows listings.
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setUnits(SAMPLE_UNITS);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'units'),
      where('approved', '==', true),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: PropertyUnit[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as PropertyUnit);
        });
        // If Firestore has data, use it; otherwise fall back to sample
        setUnits(fetched.length > 0 ? fetched : SAMPLE_UNITS);
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore listener error — using sample data:', error.message);
        setUnits(SAMPLE_UNITS);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Premium Luxury Navbar */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur sticky top-0 p-4 z-50 flex justify-between items-center">
        <a href="/" className="text-xl font-bold tracking-widest text-amber-400 font-serif">
          SIERRA ESTATES
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <a href="/" className="hover:text-amber-400 transition-colors">Showcase Listings</a>
          <a href="/roi" className="hover:text-amber-400 transition-colors">Investment Modeling</a>
          <a href="/concierge" className="hover:text-amber-400 transition-colors">Concierge Hub</a>
          <a href="/about" className="hover:text-amber-400 transition-colors">About</a>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex flex-col space-y-1.5 focus:outline-none z-50 p-2 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </header>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-950 z-40 p-6 pt-24 flex flex-col space-y-4 md:hidden">
          <a href="/" className="text-lg border-b border-slate-800 pb-2 hover:text-amber-400 transition-colors">Showcase Listings</a>

          <div>
            <button
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="w-full flex justify-between items-center text-lg border-b border-slate-800 pb-2 focus:outline-none hover:text-amber-400 transition-colors"
            >
              <span>Premium Compounds (21)</span>
              <span>{isAccordionOpen ? '▲' : '▼'}</span>
            </button>
            {isAccordionOpen && (
              <div className="bg-slate-900/60 rounded-xl p-3 my-2 max-h-48 overflow-y-auto space-y-1.5 text-sm text-amber-400 border border-slate-800 font-medium">
                {VERIFIED_COMPOUNDS.map((name, index) => (
                  <div key={index} className="hover:text-white transition-colors py-0.5 cursor-pointer line-clamp-1">{name}</div>
                ))}
              </div>
            )}
          </div>

          <a href="/roi" className="text-lg border-b border-slate-800 pb-2 hover:text-amber-400 transition-colors">Investment Modeling (+12.4%)</a>
          <a href="/concierge" className="text-lg border-b border-slate-800 pb-2 hover:text-amber-400 transition-colors">Concierge Hub / Portfolio</a>
          <a href="/about" className="text-lg border-b border-slate-800 pb-2 hover:text-amber-400 transition-colors">About Sierra Estates</a>
        </div>
      )}

      {/* Listings grid */}
      <main className="max-w-7xl mx-auto p-6 mt-4">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-100 tracking-tight">Exclusive Verified Listings</h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time inventory from local broker scrapers and PropertyFinder Atlas API channels.
            </p>
          </div>
          <div className="text-xs text-slate-400 border border-slate-800 px-3 py-1 rounded-full bg-slate-900 font-mono tracking-tight">
            {units.length} verified properties
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-amber-500 font-mono animate-pulse tracking-wider">
            SYNCHRONIZING PROPERTY INVENTORY…
          </div>
        ) : units.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <span>No approved listings are currently active in the pool.</span>
            <span className="text-xs text-slate-600 mt-1">Publish and toggle 'approved' states inside the Administrative Portal.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="group bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl overflow-hidden hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300"
              >
                {/* Image */}
                {unit.images && unit.images.length > 0 && (
                  <div className="relative h-52 overflow-hidden bg-slate-800">
                    <img
                      src={unit.images[0]}
                      alt={unit.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-mono text-slate-300 bg-slate-950/80 backdrop-blur px-2 py-1 rounded border border-slate-700">
                        {unit.source}
                      </span>
                    </div>
                  </div>
                )}

                {/* Body */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
                        {unit.compound}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 line-clamp-2">{unit.title}</h3>
                    {unit.description && (
                      <p className="text-slate-400 text-xs mt-2 line-clamp-2">{unit.description}</p>
                    )}
                    <p className="text-slate-500 text-xs mt-2 font-medium">
                      {unit.beds} Bedrooms{unit.bathrooms ? ` · ${unit.bathrooms} Baths` : ''}{unit.area ? ` · ${unit.area} m²` : ''}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center">
                    <span className="text-lg font-bold text-emerald-400">
                      {unit.price.toLocaleString()} EGP
                    </span>
                    <a
                      href={`/property/${unit.id}`}
                      className="text-xs font-semibold bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-white px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      Explore Asset
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
