import { Suspense } from 'react';
import { Navbar } from '@/components/Layout/Navbar';
import { Footer } from '@/components/Layout/Footer';
import { PropertyCard } from '@/components/Property/PropertyCard';
import { PropertyFilters } from '@/components/Search/PropertyFilters';

interface PropertiesPageProps {
  searchParams: Promise<{ q?: string; type?: string; for?: string; minPrice?: string; maxPrice?: string; page?: string; }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-se-cream pt-24">
        <div className="bg-se-navy py-14">
          <div className="container-se">
            <p className="text-se-gold text-xs tracking-[0.3em] uppercase mb-3">Portfolio</p>
            <h1 className="font-display text-5xl text-white">Properties</h1>
            <p className="text-white/50 mt-3">Curated luxury real estate in New Cairo</p>
          </div>
        </div>
        <div className="container-se py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-72 shrink-0">
              <Suspense><PropertyFilters initialParams={params} /></Suspense>
            </aside>
            <div className="flex-1">
              <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{Array.from({length:6}).map((_,i)=><div key={i} className="bg-white rounded-xl h-80 animate-pulse" />)}</div>}>
                <PropertiesGrid params={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

async function PropertiesGrid({ params: _params }: { params: Awaited<PropertiesPageProps['searchParams']> }) {
  // TODO: Replace with real Firestore query via getProperties(params)
  const mockProperties = Array.from({ length: 9 }, (_, i) => ({
    id: `prop-${String(i + 1).padStart(3, '0')}`,
    title: `Luxury Property ${i + 1}`,
    location: 'New Cairo, Fifth Settlement',
    price: 3000000 + i * 500000,
    type: ['Apartment', 'Villa', 'Penthouse'][i % 3],
    bedrooms: 2 + (i % 4),
    bathrooms: 2 + (i % 3),
    area: 120 + i * 30,
    imageUrl: '/images/property-placeholder.jpg',
    isNew: i < 3,
    forSale: true,
  }));
  return (
    <div>
      <p className="text-se-muted text-sm mb-6">{mockProperties.length} properties found</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockProperties.map((p) => <PropertyCard key={p.id} {...p} />)}
      </div>
    </div>
  );
}
