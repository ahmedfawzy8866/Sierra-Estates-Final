'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/I18nContext';

const COPY = {
  en: {
    dir: 'ltr' as const,
    eyebrow: 'Trusted Partners',
    pageTitle: 'Customer Success Stories',
    pageSubtitle: 'Real investors, real returns. See how Sierra Estates has transformed property journeys across New Cairo.',
    stories: [
      {
        type: 'Testimonial',
        quote: '"Sierra Estates found me the perfect villa in Mivida within 2 weeks. The AI matching was spot-on—exactly what I needed for my family."',
        author: 'Fatima Al-Mansouri',
        role: 'Family Home Buyer, Saudi Arabia',
        meta: [
          { label: 'Property', val: 'Villa, Mivida' },
          { label: 'Timeline', val: '2 weeks' }
        ]
      },
      {
        type: 'Case Study',
        title: '37% ROI in 18 Months',
        location: 'Hyde Park, New Cairo',
        content: 'Gulf investor purchased a 2BR apartment at EGP 4.2M in Hyde Park. Strategic timing + compound appreciation + short-term rental income drove 37% total return.',
        meta: [
          { label: 'Initial', val: 'EGP 4.2M' },
          { label: 'Return', val: '+37%' },
          { label: 'Period', val: '18 mo' }
        ]
      },
      {
        type: 'Testimonial',
        quote: '"The ROI Analysis tool gave me confidence to invest. Clear numbers, transparent assumptions. No surprises."',
        author: 'Ahmed Hassan',
        role: 'Real Estate Investor, Cairo',
        meta: [
          { label: 'Property', val: 'Penthouse, El Shorouk' },
          { label: 'Type', val: 'Investment' }
        ]
      },
      {
        type: 'Case Study',
        title: 'Portfolio Diversification',
        location: 'Mountain View iCity + Eastown',
        content: 'UAE family spread investment across 2 compounds. Mixed residential (primary home) + investment (rental income). Total portfolio value: EGP 18.6M over 3 years.',
        meta: [
          { label: 'Properties', val: '2' },
          { label: 'Portfolio', val: 'EGP 18.6M' },
          { label: 'Period', val: '3 yr' }
        ]
      },
      {
        type: 'Testimonial',
        quote: "\"Sierra's AI chat answered every question I had about the compound, walkability, schools nearby. It made the decision so much easier.\"",
        author: 'Leila Boutros',
        role: 'Expatriate, Cairo',
        meta: [
          { label: 'Property', val: 'Townhouse, Palm Hills' },
          { label: 'Timeline', val: '1 month' }
        ]
      },
      {
        type: 'Case Study',
        title: 'First-Time Buyer Success',
        location: 'Villette, New Cairo',
        content: "Young professional, first property purchase. Sierra's Smart Matching algorithm identified a 3BR apartment that fit budget AND lifestyle. Closed in 6 weeks with financing support.",
        meta: [
          { label: 'Price', val: 'EGP 6.8M' },
          { label: 'Time to Close', val: '6 weeks' },
          { label: 'AI Match', val: '96%' }
        ]
      },
      {
        type: 'Testimonial',
        quote: '"I was skeptical about AI in real estate. Sierra proved it works—data-driven decisions, no emotion, pure logic."',
        author: 'Karim El-Sayed',
        role: 'Property Investor, Dubai',
        meta: [
          { label: 'Strategy', val: 'Multi-unit' },
          { label: 'Status', val: 'Active' }
        ]
      }
    ],
    ctaTitle: 'Ready to Write Your Success Story?',
    ctaDesc: 'Join hundreds of satisfied investors across the Gulf. Start your property journey today.',
    ctaBtn: 'Schedule a Consultation'
  },
  ar: {
    dir: 'rtl' as const,
    eyebrow: 'شركاء موثوقون',
    pageTitle: 'قصص نجاح العملاء',
    pageSubtitle: 'مستثمرون حقيقيون، عوائد حقيقية. شاهد كيف حولت سييرا إستيتس رحلات العقارات في جميع أنحاء القاهرة الجديدة.',
    stories: [
      {
        type: 'شهادة',
        quote: '"وجدت لي سييرا إستيتس الفيلا المثالية في ميفيدا خلال أسبوعين. كان التطابق بالذكاء الاصطناعي دقيقاً - بالضبط ما أحتاجه لعائلتي."',
        author: 'فاطمة المنصوري',
        role: 'مشتري منزل عائلي، السعودية',
        meta: [
          { label: 'العقار', val: 'فيلا، ميفيدا' },
          { label: 'الجدول الزمني', val: 'أسبوعين' }
        ]
      },
      {
        type: 'دراسة حالة',
        title: 'عائد 37% خلال 18 شهراً',
        location: 'هايد بارك، القاهرة الجديدة',
        content: 'اشترى مستثمر خليجي شقة غرفتين بسعر 4.2 مليون جنيه في هايد بارك. التوقيت الاستراتيجي + زيادة قيمة المجمع + إيرادات الإيجار قصير الأجل أدت إلى عائد إجمالي 37%.',
        meta: [
          { label: 'مبدئي', val: '4.2 مليون جنيه' },
          { label: 'العائد', val: '+37%' },
          { label: 'الفترة', val: '18 شهراً' }
        ]
      },
      {
        type: 'شهادة',
        quote: '"منحتني أداة تحليل العائد الثقة للاستثمار. أرقام واضحة، افتراضات شفافة. لا مفاجآت."',
        author: 'أحمد حسن',
        role: 'مستثمر عقاري، القاهرة',
        meta: [
          { label: 'العقار', val: 'بنتهاوس، الشروق' },
          { label: 'النوع', val: 'استثمار' }
        ]
      },
      {
        type: 'دراسة حالة',
        title: 'تنويع المحفظة',
        location: 'ماونتن فيو آي سيتي + إيستاون',
        content: 'عائلة إماراتية توزع الاستثمار عبر مجمعين. سكني مختلط (المنزل الأساسي) + استثمار (دخل الإيجار). إجمالي قيمة المحفظة: 18.6 مليون جنيه على مدى 3 سنوات.',
        meta: [
          { label: 'العقارات', val: '2' },
          { label: 'المحفظة', val: '18.6 مليون جنيه' },
          { label: 'الفترة', val: '3 سنوات' }
        ]
      },
      {
        type: 'شهادة',
        quote: '"أجاب دردشة الذكاء الاصطناعي لسييرا على كل سؤال لدي حول المجمع، والمشي، والمدارس القريبة. جعل القرار أسهل بكثير."',
        author: 'ليلى بطرس',
        role: 'مغتربة، القاهرة',
        meta: [
          { label: 'العقار', val: 'تاون هاوس، بالم هيلز' },
          { label: 'الجدول الزمني', val: 'شهر واحد' }
        ]
      },
      {
        type: 'دراسة حالة',
        title: 'نجاح المشتري لأول مرة',
        location: 'فيليت، القاهرة الجديدة',
        content: 'محترف شاب، أول شراء لعقار. حددت خوارزمية التطابق الذكي من سييرا شقة 3 غرف تناسب الميزانية وأسلوب الحياة. تمت الصفقة في 6 أسابيع مع دعم التمويل.',
        meta: [
          { label: 'السعر', val: '6.8 مليون جنيه' },
          { label: 'وقت الإغلاق', val: '6 أسابيع' },
          { label: 'تطابق AI', val: '96%' }
        ]
      },
      {
        type: 'شهادة',
        quote: '"كنت متشككاً بشأن الذكاء الاصطناعي في العقارات. أثبتت سييرا أنه يعمل - قرارات مدفوعة بالبيانات، بلا عاطفة، منطق خالص."',
        author: 'كريم السيد',
        role: 'مستثمر عقاري، دبي',
        meta: [
          { label: 'الاستراتيجية', val: 'متعدد الوحدات' },
          { label: 'الحالة', val: 'نشط' }
        ]
      }
    ],
    ctaTitle: 'مستعد لكتابة قصة نجاحك؟',
    ctaDesc: 'انضم إلى مئات المستثمرين الراضين في جميع أنحاء الخليج. ابدأ رحلتك العقارية اليوم.',
    ctaBtn: 'احجز استشارة'
  }
};

export default function SuccessStoriesPage() {
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

        {/* Stories Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-8 mb-20">
          {T.stories.map((story, i) => (
            <div key={i} className="flex flex-col p-8 bg-white border border-[rgba(13,32,53,0.1)] rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(200,150,26,0.3)] hover:shadow-[0_14px_44px_rgba(13,32,53,0.12)]">
              <div className="inline-block px-2.5 py-1.5 bg-[rgba(200,150,26,0.08)] text-[var(--gold)] text-[9px] font-bold tracking-[0.16em] uppercase rounded w-fit mb-3.5">
                {story.type}
              </div>
              
              {story.type === 'Testimonial' || story.type === 'شهادة' ? (
                <>
                  <div className="italic text-[15px] text-[var(--navy)] leading-[1.8] mb-4 pl-4 border-l-4 border-[var(--gold)]">
                    {story.quote}
                  </div>
                  <div className="text-[12px] font-semibold text-[var(--navy)] mb-1">{story.author}</div>
                  <div className="text-[11px] text-[#7C7766] tracking-[0.05em] mb-4 flex-grow">{story.role}</div>
                </>
              ) : (
                <>
                  <div className="font-se-display text-[24px] font-semibold text-[var(--navy)] mb-3 leading-[1.2]">{story.title}</div>
                  <div className="text-[12px] text-[#7C7766] font-medium tracking-[0.05em] mb-4">{story.location}</div>
                  <div className="text-[14px] text-[var(--navy)] leading-[1.7] mb-5 flex-grow">{story.content}</div>
                </>
              )}

              <div className="flex gap-4 pt-4 border-t border-[rgba(13,32,53,0.1)] text-[12px] text-[#7C7766] font-medium mt-auto">
                {story.meta.map((m, j) => (
                  <div key={j} className="flex flex-col gap-1">
                    <span>{m.label}</span>
                    <span className="text-[var(--navy)] font-semibold text-[13px]">{m.val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center py-[60px] px-7 bg-gradient-to-br from-[rgba(200,150,26,0.06)] to-[rgba(200,150,26,0.02)] rounded-[20px] mb-0">
          <h3 className="font-se-display text-[36px] font-semibold text-[var(--navy)] mb-3">{T.ctaTitle}</h3>
          <p className="text-[15px] text-[#7C7766] mb-7">{T.ctaDesc}</p>
          <button 
            onClick={() => alert('Consultation Scheduler')}
            className="inline-flex items-center justify-center py-3.5 px-8 border-none rounded-[10px] cursor-pointer font-se-ui text-[11px] font-bold tracking-[0.12em] uppercase text-white bg-gradient-to-br from-[var(--gold-lt)] to-[var(--gold)] shadow-[0_6px_18px_rgba(200,150,26,0.28)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(200,150,26,0.4)]"
          >
            {T.ctaBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
