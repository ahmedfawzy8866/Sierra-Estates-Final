'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Bed, Bath, Maximize2, MapPin, Heart } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

export interface PropertyCardProps {
  id: string; title: string; titleAr?: string; location: string;
  price: number; currency?: 'EGP' | 'USD'; type: string;
  bedrooms: number; bathrooms: number; area: number;
  imageUrl: string; isNew?: boolean; isFeatured?: boolean; forSale?: boolean;
}

export function PropertyCard({ id,title,titleAr,location,price,currency='EGP',type,bedrooms,bathrooms,area,imageUrl,isNew,isFeatured,forSale=true }: PropertyCardProps) {
  const locale = useLocale();
  const t = useTranslations('property_card');
  const [saved, setSaved] = useState(false);
  const displayTitle = locale === 'ar' && titleAr ? titleAr : title;
  const formattedPrice = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { notation:'compact', maximumFractionDigits:1 }).format(price);

  return (
    <article className="group bg-white rounded-xl overflow-hidden card-shadow card-shadow-hover transition-all duration-300">
      <div className="relative h-52 overflow-hidden">
        <Image src={imageUrl||'/images/property-placeholder.jpg'} alt={displayTitle} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw,33vw" />
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew     && <span className="bg-se-gold text-se-navy text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded">{t('new')}</span>}
          {isFeatured && <span className="bg-se-navy text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded">{t('featured')}</span>}
        </div>
        <button onClick={() => setSaved(!saved)} className={clsx('absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all', saved ? 'bg-se-gold text-se-navy' : 'bg-white/90 text-se-navy/60 hover:bg-white hover:text-se-gold')}>
          <Heart className={clsx('w-4 h-4', saved && 'fill-current')} />
        </button>
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] tracking-wider uppercase px-2.5 py-1 rounded">{forSale ? t('for_sale') : t('for_rent')}</span>
        </div>
      </div>
      <div className="p-5">
        <span className="text-se-gold text-[10px] tracking-[0.2em] uppercase">{type}</span>
        <h3 className="font-display text-lg text-se-navy leading-snug mb-2 mt-1 line-clamp-2">
          <Link href={`/${locale}/properties/${id}`} className="hover:text-se-gold transition-colors">{displayTitle}</Link>
        </h3>
        <p className="flex items-center gap-1.5 text-se-muted text-sm mb-4"><MapPin className="w-3.5 h-3.5 text-se-gold" />{location}</p>
        <div className="flex items-center gap-4 text-se-muted text-sm border-t border-se-stone pt-4 mb-4">
          <span className="flex items-center gap-1.5"><Bed className="w-3.5 h-3.5" />{bedrooms}</span>
          <span className="flex items-center gap-1.5"><Bath className="w-3.5 h-3.5" />{bathrooms}</span>
          <span className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5" />{area} m²</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-se-gold font-display text-2xl">{currency} {formattedPrice}</p>
            {!forSale && <p className="text-se-muted text-xs">{t('per_month')}</p>}
          </div>
          <Link href={`/${locale}/properties/${id}`} className="text-se-navy text-xs tracking-wide border-b border-se-gold pb-0.5 hover:text-se-gold transition-colors">{t('view_details')}</Link>
        </div>
      </div>
    </article>
  );
}
