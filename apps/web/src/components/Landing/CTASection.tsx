'use client';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const t = useTranslations('cta');
  const locale = useLocale();
  return (
    <section className="py-24 bg-se-ivory overflow-hidden">
      <div className="container-se">
        <div className="relative rounded-2xl gradient-navy overflow-hidden px-8 md:px-16 py-16 text-center">
          <div className="absolute top-0 left-1/4 w-px h-full bg-se-gold/10" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-se-gold/10" />
          <p className="text-se-gold text-xs tracking-[0.3em] uppercase mb-4">{t('overline')}</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6 max-w-2xl mx-auto">{t('headline')}</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">{t('subtitle')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`/${locale}/contact`} className="btn-primary">{t('primary_cta')} <ArrowRight className="w-4 h-4" /></Link>
            <Link href={`/${locale}/properties`} className="btn-outline">{t('secondary_cta')}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
