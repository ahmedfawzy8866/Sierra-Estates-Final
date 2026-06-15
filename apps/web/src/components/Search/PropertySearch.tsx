'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';

type SaleType = 'all' | 'sale' | 'rent';
const TYPES = ['all','apartment','villa','penthouse','townhouse'];
const SALE_TYPES: SaleType[] = ['all','sale','rent'];

export function PropertySearch() {
  const t = useTranslations('search');
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [saleType, setSaleType] = useState<SaleType>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (type !== 'all') params.set('type', type);
    if (saleType !== 'all') params.set('for', saleType);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    router.push(`/${locale}/properties?${params.toString()}`);
  };

  return (
    <section className="relative -mt-8 z-20 px-4 pb-0">
      <div className="container-se">
        <div className="bg-white rounded-xl shadow-xl border border-se-stone/50 p-6 md:p-8">
          <div className="flex gap-1 mb-6 bg-se-cream rounded-lg p-1 w-fit">
            {SALE_TYPES.map(st => (
              <button key={st} onClick={() => setSaleType(st)}
                className={clsx('px-5 py-2 text-sm rounded-md transition-all', saleType === st ? 'bg-se-navy text-white shadow-sm' : 'text-se-navy/60 hover:text-se-navy')}>
                {t(`sale_type.${st}` as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-se-gold" />
              <input type="text" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()}
                placeholder={t('location_placeholder')}
                className="w-full pl-10 pr-4 py-3.5 border border-se-stone rounded-lg text-se-navy placeholder:text-se-muted text-sm focus:outline-none focus:border-se-gold" />
            </div>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-se-gold" />
              <select value={type} onChange={e=>setType(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 border border-se-stone rounded-lg text-se-navy text-sm bg-white appearance-none focus:outline-none focus:border-se-gold">
                {TYPES.map(pt => <option key={pt} value={pt}>{t(`property_type.${pt}` as Parameters<typeof t>[0])}</option>)}
              </select>
            </div>
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-se-gold" />
                <input type="number" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder={t('min_price')}
                  className="w-full pl-8 pr-2 py-3.5 border border-se-stone rounded-lg text-se-navy text-sm focus:outline-none focus:border-se-gold" />
              </div>
              <input type="number" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder={t('max_price')}
                className="flex-1 px-3 py-3.5 border border-se-stone rounded-lg text-se-navy text-sm focus:outline-none focus:border-se-gold" />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={handleSearch} className="btn-primary gap-2"><Search className="w-4 h-4" />{t('search_btn')}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
