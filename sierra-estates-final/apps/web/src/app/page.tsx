import { Hero } from '@/components/Landing/Hero';
import { PropertySearch } from '@/components/Search/PropertySearch';
import { FeaturedListings } from '@/components/Property/FeaturedListings';
import { WhySection } from '@/components/Landing/WhySection';
import { StatsSection } from '@/components/Landing/StatsSection';
import { CTASection } from '@/components/Landing/CTASection';
import { Navbar } from '@/components/Layout/Navbar';
import { Footer } from '@/components/Layout/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PropertySearch />
        <FeaturedListings />
        <StatsSection />
        <WhySection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
