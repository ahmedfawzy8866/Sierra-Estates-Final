import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PropertyCard } from './PropertyCard';

const MOCK_FEATURED = [
  { id:'prop-001', title:'The Crest — Penthouse Collection', titleAr:'ذا كريست — مجموعة البنتهاوس', location:'New Cairo, Fifth Settlement', price:12500000, type:'Penthouse', bedrooms:4, bathrooms:5, area:380, imageUrl:'/images/property-placeholder.jpg', isNew:true, isFeatured:true, forSale:true },
  { id:'prop-002', title:'Arabella Villas — Corner Unit', titleAr:'فيلات أرابيلا', location:'Mostakbal City, Cairo', price:8900000, type:'Villa', bedrooms:5, bathrooms:4, area:450, imageUrl:'/images/property-placeholder.jpg', isFeatured:true, forSale:true },
  { id:'prop-003', title:'Azure Sky — Type B Apartment', titleAr:'سكاي أزور — شقة النوع ب', location:'New Cairo, Compound Living', price:4200000, type:'Apartment', bedrooms:3, bathrooms:2, area:175, imageUrl:'/images/property-placeholder.jpg', isNew:true, forSale:true },
];

export function FeaturedListings() {
  const t = useTranslations('featured');
  const locale = useLocale();
  return (
    <section className="py-20 bg-se-ivory">
      <div className="container-se">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="gold-divider !mx-0 mb-4" />
            <p className="text-se-gold text-xs tracking-[0.3em] uppercase mb-3">{t('overline')}</p>
            <h2 className="font-display text-4xl md:text-5xl text-se-navy">{t('headline')}</h2>
          </div>
          <Link href={`/${locale}/properties`} className="flex items-center gap-2 text-se-navy text-sm border-b border-se-gold pb-0.5 hover:text-se-gold transition-colors">
            {t('view_all')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_FEATURED.map((p) => <PropertyCard key={p.id} {...p} />)}
        </div>
      </div>
    </section>
  );
}
