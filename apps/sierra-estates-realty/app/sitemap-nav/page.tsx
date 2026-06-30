'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/I18nContext';
import Link from 'next/link';

const COPY = {
  en: {
    dir: 'ltr' as const,
    eyebrow: 'Navigation',
    pageTitle: 'Sitemap',
    sections: [
      {
        title: 'Main Pages',
        links: [
          { name: 'Client Hub (Home)', url: '/' },
          { name: 'About Us', url: '/about' },
          { name: 'Careers', url: '/careers' },
          { name: 'Contact Us', url: '/contact' }
        ]
      },
      {
        title: 'Resources & Insights',
        links: [
          { name: 'Investment Guide', url: '/invest' },
          { name: 'Customer Success Stories', url: '/success-stories' },
          { name: 'Blog & News', url: '/blog' }
        ]
      },
      {
        title: 'Property Discovery',
        links: [
          { name: 'Full Virtual Tour', url: '/virtual-tour' }
        ]
      }
    ]
  },
  ar: {
    dir: 'rtl' as const,
    eyebrow: 'التنقل',
    pageTitle: 'خريطة الموقع',
    sections: [
      {
        title: 'الصفحات الرئيسية',
        links: [
          { name: 'مركز العملاء (الرئيسية)', url: '/' },
          { name: 'عن الشركة', url: '/about' },
          { name: 'الوظائف', url: '/careers' },
          { name: 'اتصل بنا', url: '/contact' }
        ]
      },
      {
        title: 'الموارد والرؤى',
        links: [
          { name: 'دليل الاستثمار', url: '/invest' },
          { name: 'قصص نجاح العملاء', url: '/success-stories' },
          { name: 'المدونة والأخبار', url: '/blog' }
        ]
      },
      {
        title: 'اكتشاف العقارات',
        links: [
          { name: 'جولة افتراضية كاملة', url: '/virtual-tour' }
        ]
      }
    ]
  }
};

export default function SitemapPage() {
  const { locale } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const lang = locale === 'ar' ? 'ar' : 'en';
  const T = COPY[lang];

  if (!mounted) return null;

  return (
    <div dir={T.dir} className={`min-h-screen bg-[var(--ivory)] text-[var(--navy)] pb-20 ${lang === 'ar' ? 'arabic-ready' : 'font-se-ui'}`}>
      <div className="max-w-[1240px] mx-auto px-7 pt-24">
        
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.28em] uppercase text-[var(--gold)] mb-4">
            <span className="w-5 h-[1px] bg-[var(--gold)]" />
            {T.eyebrow}
          </div>
          <h1 className="font-se-display text-[clamp(42px,6vw,64px)] leading-[1.1] font-semibold text-[var(--navy)]">
            {T.pageTitle}
          </h1>
        </div>

        {/* Links Grid */}
        <div className="grid md:grid-cols-3 gap-12 max-w-[900px] mx-auto">
          {T.sections.map((sec, i) => (
            <div key={i} className="flex flex-col">
              <h2 className="font-se-display text-[22px] font-semibold text-[var(--gold)] mb-6 border-b border-[rgba(13,32,53,0.1)] pb-3">
                {sec.title}
              </h2>
              <ul className="flex flex-col gap-4 list-none p-0 m-0">
                {sec.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.url} className="text-[15px] font-medium text-[var(--navy)] hover:text-[var(--gold)] transition-colors inline-flex items-center gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-[rgba(13,32,53,0.2)] group-hover:bg-[var(--gold)] transition-colors"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
