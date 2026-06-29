'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/I18nContext';

const COPY = {
  en: {
    dir: 'ltr' as const,
    eyebrow: 'Market Insights',
    pageTitle: 'Blog & News',
    pageSubtitle: 'Expert analysis, market trends, and updates from the Sierra Estates team.',
    featuredTag: 'Featured',
    readMore: 'Read Article',
    posts: [
      {
        id: 1,
        title: 'New Cairo Real Estate Market Report: Q3 2026',
        category: 'Market Reports',
        date: 'Oct 15, 2026',
        desc: 'An in-depth look at property valuations, rental yields, and the impact of the new metro lines connecting New Cairo to the New Administrative Capital.',
        img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
      },
      {
        id: 2,
        title: 'Top 5 Compounds for Rental Yield in 2026',
        category: 'Investment Strategy',
        date: 'Oct 02, 2026',
        desc: 'Analyzing the best performing communities for short and long-term rental income based on our AI matching data.',
        img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'
      },
      {
        id: 3,
        title: 'Sierra Estates Launches Intelligence OS 2.0',
        category: 'Company News',
        date: 'Sep 28, 2026',
        desc: 'Our latest platform update brings predictive pricing models directly to our client dashboard.',
        img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
      },
      {
        id: 4,
        title: 'Understanding the Legal Framework for Foreign Investors',
        category: 'Guides',
        date: 'Sep 15, 2026',
        desc: 'A comprehensive guide to property registration, residency benefits, and taxation for international buyers in Egypt.',
        img: 'https://images.unsplash.com/photo-1450101499163-c8848c66cb85?w=800&q=80'
      }
    ],
    ctaTitle: 'Subscribe to Our Newsletter',
    ctaDesc: 'Get the latest market reports and investment opportunities delivered to your inbox.',
    ctaBtn: 'Subscribe'
  },
  ar: {
    dir: 'rtl' as const,
    eyebrow: 'رؤى السوق',
    pageTitle: 'المدونة والأخبار',
    pageSubtitle: 'تحليلات الخبراء، اتجاهات السوق، وتحديثات من فريق سييرا إستيتس.',
    featuredTag: 'مميز',
    readMore: 'اقرأ المقال',
    posts: [
      {
        id: 1,
        title: 'تقرير سوق العقارات في القاهرة الجديدة: الربع الثالث 2026',
        category: 'تقارير السوق',
        date: '15 أكتوبر 2026',
        desc: 'نظرة متعمقة على تقييمات العقارات، والعوائد الإيجارية، وتأثير خطوط المترو الجديدة التي تربط القاهرة الجديدة بالعاصمة الإدارية الجديدة.',
        img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
      },
      {
        id: 2,
        title: 'أفضل 5 مجمعات سكنية للعائد الإيجاري في 2026',
        category: 'استراتيجية الاستثمار',
        date: '02 أكتوبر 2026',
        desc: 'تحليل أفضل المجتمعات أداءً لدخل الإيجار القصير والطويل الأجل بناءً على بيانات المطابقة بالذكاء الاصطناعي الخاصة بنا.',
        img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'
      },
      {
        id: 3,
        title: 'سييرا إستيتس تطلق نظام Intelligence OS 2.0',
        category: 'أخبار الشركة',
        date: '28 سبتمبر 2026',
        desc: 'أحدث تحديث لمنصتنا يجلب نماذج التسعير التنبؤية مباشرة إلى لوحة تحكم عملائنا.',
        img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
      },
      {
        id: 4,
        title: 'فهم الإطار القانوني للمستثمرين الأجانب',
        category: 'أدلة',
        date: '15 سبتمبر 2026',
        desc: 'دليل شامل لتسجيل العقارات، ومزايا الإقامة، والضرائب للمشترين الدوليين في مصر.',
        img: 'https://images.unsplash.com/photo-1450101499163-c8848c66cb85?w=800&q=80'
      }
    ],
    ctaTitle: 'اشترك في نشرتنا الإخبارية',
    ctaDesc: 'احصل على أحدث تقارير السوق وفرص الاستثمار في بريدك الإلكتروني.',
    ctaBtn: 'اشترك'
  }
};

export default function BlogPage() {
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
          <h1 className="font-se-display text-[clamp(42px,6vw,64px)] leading-[1.1] font-semibold text-[var(--navy)] mb-4">
            {T.pageTitle}
          </h1>
          <p className="text-[16px] text-[#7C7766] max-w-[600px] mx-auto">
            {T.pageSubtitle}
          </p>
        </div>

        {/* Featured Post */}
        {T.posts[0] && (
          <div className="mb-16 bg-white border border-[rgba(13,32,53,0.1)] rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-lg">
            <div className="md:w-1/2 h-[300px] md:h-auto bg-gray-200" style={{ backgroundImage: `url('${T.posts[0].img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div className="md:w-1/2 p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-[var(--gold)] text-white text-[10px] font-bold tracking-[0.1em] uppercase rounded-full">
                  {T.featuredTag}
                </span>
                <span className="text-[12px] font-semibold text-[var(--gold)] tracking-[0.08em] uppercase">{T.posts[0].category}</span>
                <span className="text-[12px] text-[#7C7766]">{T.posts[0].date}</span>
              </div>
              <h2 className="font-se-display text-[32px] font-semibold text-[var(--navy)] mb-4 leading-[1.2]">
                {T.posts[0].title}
              </h2>
              <p className="text-[15px] text-[#7C7766] mb-6 leading-[1.7]">
                {T.posts[0].desc}
              </p>
              <button className="self-start py-2.5 px-6 border border-[var(--gold)] text-[var(--gold)] text-[11px] font-bold uppercase tracking-[0.1em] rounded-lg hover:bg-[var(--gold)] hover:text-white transition-colors">
                {T.readMore}
              </button>
            </div>
          </div>
        )}

        {/* Grid Posts */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-8 mb-20">
          {T.posts.slice(1).map((post) => (
            <div key={post.id} className="bg-white border border-[rgba(13,32,53,0.1)] rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="h-[200px] bg-gray-200" style={{ backgroundImage: `url('${post.img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div className="p-7 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-[var(--gold)] tracking-[0.1em] uppercase">{post.category}</span>
                  <span className="text-[11px] text-[#7C7766]">{post.date}</span>
                </div>
                <h3 className="font-se-display text-[22px] font-semibold text-[var(--navy)] mb-3 leading-[1.3]">
                  {post.title}
                </h3>
                <p className="text-[14px] text-[#7C7766] leading-[1.6] mb-5 flex-grow">
                  {post.desc}
                </p>
                <div className="text-[12px] font-bold text-[var(--navy)] uppercase tracking-[0.05em] flex items-center gap-1 group cursor-pointer">
                  {T.readMore} <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center py-[60px] px-7 bg-gradient-to-br from-[rgba(200,150,26,0.08)] to-[rgba(200,150,26,0.02)] rounded-[20px] mb-0">
          <h3 className="font-se-display text-[36px] font-semibold text-[var(--navy)] mb-3">{T.ctaTitle}</h3>
          <p className="text-[15px] text-[#7C7766] mb-6 max-w-[400px] mx-auto">{T.ctaDesc}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-[480px] mx-auto">
            <input 
              type="email" 
              placeholder="Email address" 
              className="flex-grow p-3.5 rounded-[10px] border border-[rgba(13,32,53,0.1)] font-se-ui text-[13px] focus:outline-none focus:border-[var(--gold)]" 
            />
            <button 
              className="inline-flex items-center justify-center py-3.5 px-8 border-none rounded-[10px] cursor-pointer font-se-ui text-[11px] font-bold tracking-[0.12em] uppercase text-white bg-gradient-to-br from-[var(--gold-lt)] to-[var(--gold)] shadow-[0_6px_18px_rgba(200,150,26,0.28)] transition-all hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(200,150,26,0.4)] whitespace-nowrap"
            >
              {T.ctaBtn}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
