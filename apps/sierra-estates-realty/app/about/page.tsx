'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/I18nContext';

const COPY = {
  en: {
    dir: 'ltr' as const,
    eyebrow: 'Our Story',
    pageTitle: 'About Sierra Estates',
    visionH: 'Vision',
    visionD: 'To become the AI-powered real estate intelligence hub for Africa, where every investor makes confident, data-driven decisions.',
    missionH: 'Mission',
    missionD: 'Democratize premium real estate access across New Cairo by combining human expertise with cutting-edge AI to match every buyer, seller, and investor with their ideal property.',
    valuesTitle: 'Core Values',
    values: [
      { icon: '💡', title: 'Innovation', desc: 'We pioneer AI-driven solutions that transform how real estate is bought, sold, and invested.' },
      { icon: '🔍', title: 'Transparency', desc: 'Every metric, every recommendation is explainable. No black boxes. No surprises.' },
      { icon: '👥', title: 'Trust', desc: 'We earn trust by putting client success above commission. Always.' },
      { icon: '⚡', title: 'Speed', desc: 'Move faster. Smart algorithms cut weeks off the decision-making process.' },
      { icon: '🌍', title: 'Global Reach', desc: 'We serve investors from the Gulf, Europe, and across Africa with bilingual expertise.' },
      { icon: '🎯', title: 'Excellence', desc: 'We settle for nothing less than the best match, the best advice, the best outcome.' },
    ],
    journeyTitle: 'Our Journey',
    journey: [
      { year: '2021', event: 'Founded with a vision to reimagine real estate in New Cairo' },
      { year: '2022', event: 'Launched Smart Matching AI — matched 500+ families to their dream homes' },
      { year: '2023', event: 'ROI Analysis tool released; $80M in investment transactions facilitated' },
      { year: '2024', event: 'Expanded to 19 compounds; onboarded 1,000+ active investors' },
      { year: '2025', event: 'Intelligence OS platform launched — unified dashboard for all agents' },
      { year: '2026', event: 'Multi-city expansion roadmap; AI advisor chatbot goes live' },
    ],
    teamTitle: 'Leadership Team',
    team: [
      { photo: '👨‍💼', name: 'Ahmed Fawzy', role: 'Founder & CEO', bio: '15+ years in real estate tech. Built the first AI-powered valuation system in Egypt.' },
      { photo: '👩‍💼', name: 'Nour El-Din', role: 'Chief Technology Officer', bio: 'ML engineer. Led AI infrastructure scaling to 10K+ concurrent users.' },
      { photo: '👨‍💼', name: 'Karim Saleh', role: 'Chief Operations Officer', bio: 'Operations wizard. Manages 50+ agent network across New Cairo.' },
      { photo: '👩‍💼', name: 'Reem El-Sayed', role: 'VP Product', bio: 'Former Google Maps product lead. Designed the Intelligence OS platform.' },
    ],
    awardsTitle: 'Recognition',
    awards: [
      { icon: '🏆', name: 'Best PropTech Startup', year: 'African Tech Awards 2024' },
      { icon: '🌟', name: 'Most Innovative Real Estate Platform', year: 'Egypt Digital Summit 2023' },
      { icon: '⭐', name: 'Customer Choice Award', year: 'Real Estate Guild 2024' },
    ]
  },
  ar: {
    dir: 'rtl' as const,
    eyebrow: 'قصتنا',
    pageTitle: 'عن سييرا إستيتس',
    visionH: 'رؤيتنا',
    visionD: 'أن نصبح مركز الاستخبارات العقارية المدعوم بالذكاء الاصطناعي لأفريقيا، حيث يتخذ كل مستثمر قرارات واثقة مبنية على البيانات.',
    missionH: 'مهمتنا',
    missionD: 'إتاحة الوصول إلى العقارات الفاخرة في جميع أنحاء القاهرة الجديدة من خلال الجمع بين الخبرة البشرية والذكاء الاصطناعي المتطور للتوفيق بين كل مشتري وبائع ومستثمر وعقاره المثالي.',
    valuesTitle: 'قيمنا الأساسية',
    values: [
      { icon: '💡', title: 'الابتكار', desc: 'نحن رواد الحلول المعتمدة على الذكاء الاصطناعي التي تحول كيفية شراء العقارات وبيعها واستثمارها.' },
      { icon: '🔍', title: 'الشفافية', desc: 'كل مقياس وكل توصية قابلة للتفسير. لا صناديق سوداء. لا مفاجآت.' },
      { icon: '👥', title: 'الثقة', desc: 'نكسب الثقة بوضع نجاح العميل فوق العمولة. دائماً.' },
      { icon: '⚡', title: 'السرعة', desc: 'تحرك أسرع. خوارزميات ذكية توفر أسابيع من عملية اتخاذ القرار.' },
      { icon: '🌍', title: 'انتشار عالمي', desc: 'نخدم المستثمرين من الخليج وأوروبا وأفريقيا بخبرة ثنائية اللغة.' },
      { icon: '🎯', title: 'التميز', desc: 'لا نرضى بأقل من التوافق الأفضل، النصيحة الأفضل، والنتيجة الأفضل.' },
    ],
    journeyTitle: 'رحلتنا',
    journey: [
      { year: '2021', event: 'تأسست برؤية لإعادة تصور العقارات في القاهرة الجديدة' },
      { year: '2022', event: 'إطلاق الذكاء الاصطناعي للتطابق الذكي - تم التوفيق بين أكثر من 500 عائلة ومنازل أحلامهم' },
      { year: '2023', event: 'إطلاق أداة تحليل العائد على الاستثمار؛ تسهيل 80 مليون دولار من الصفقات الاستثمارية' },
      { year: '2024', event: 'التوسع إلى 19 مجمعاً سكنياً؛ انضمام أكثر من 1000 مستثمر نشط' },
      { year: '2025', event: 'إطلاق منصة نظام التشغيل الذكي - لوحة تحكم موحدة لجميع الوكلاء' },
      { year: '2026', event: 'خطة توسع لمدن متعددة؛ بدء تشغيل مساعد الذكاء الاصطناعي الاستشاري' },
    ],
    teamTitle: 'فريق القيادة',
    team: [
      { photo: '👨‍💼', name: 'أحمد فوزي', role: 'المؤسس والرئيس التنفيذي', bio: 'أكثر من 15 عاماً في تكنولوجيا العقارات. بنى أول نظام تقييم مدعوم بالذكاء الاصطناعي في مصر.' },
      { photo: '👩‍💼', name: 'نور الدين', role: 'الرئيس التنفيذي للتكنولوجيا', bio: 'مهندس تعلم آلي. قاد توسيع البنية التحتية للذكاء الاصطناعي لتشمل أكثر من 10,000 مستخدم متزامن.' },
      { photo: '👨‍💼', name: 'كريم صالح', role: 'الرئيس التنفيذي للعمليات', bio: 'خبير عمليات. يدير شبكة من 50+ وكيل في جميع أنحاء القاهرة الجديدة.' },
      { photo: '👩‍💼', name: 'ريم السيد', role: 'نائب الرئيس للمنتج', bio: 'رئيسة سابقة لمنتج خرائط جوجل. صممت منصة نظام التشغيل الذكي.' },
    ],
    awardsTitle: 'التقدير',
    awards: [
      { icon: '🏆', name: 'أفضل شركة ناشئة في تكنولوجيا العقارات', year: 'جوائز التكنولوجيا الأفريقية 2024' },
      { icon: '🌟', name: 'المنصة العقارية الأكثر ابتكاراً', year: 'قمة مصر الرقمية 2023' },
      { icon: '⭐', name: 'جائزة اختيار العملاء', year: 'نقابة العقارات 2024' },
    ]
  },
};

export default function AboutPage() {
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

        {/* Vision & Mission */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10 mb-20">
          <div className="p-10 bg-white border border-[rgba(13,32,53,0.1)] rounded-2xl">
            <h3 className="font-se-display text-[28px] font-semibold text-[var(--gold)] mb-3.5">{T.visionH}</h3>
            <p className="text-[14px] leading-[1.8] text-[var(--navy)]">{T.visionD}</p>
          </div>
          <div className="p-10 bg-white border border-[rgba(13,32,53,0.1)] rounded-2xl">
            <h3 className="font-se-display text-[28px] font-semibold text-[var(--gold)] mb-3.5">{T.missionH}</h3>
            <p className="text-[14px] leading-[1.8] text-[var(--navy)]">{T.missionD}</p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <h2 className="font-se-display text-[42px] font-semibold text-[var(--navy)] mb-10 text-center">
            {T.valuesTitle}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
            {T.values.map((v, i) => (
              <div key={i} className="p-[30px] bg-gradient-to-br from-[rgba(200,150,26,0.04)] to-[rgba(200,150,26,0.01)] border border-[rgba(200,150,26,0.15)] rounded-[14px] text-center">
                <div className="text-[36px] mb-3">{v.icon}</div>
                <div className="font-se-display text-[18px] font-semibold text-[var(--navy)] mb-2">{v.title}</div>
                <div className="text-[12px] text-[#7C7766] leading-[1.6]">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="font-se-display text-[42px] font-semibold text-[var(--navy)] mb-10 text-center">
            {T.journeyTitle}
          </h2>
          <div className="relative py-10">
            <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-[2px] bg-[var(--gold)] md:-translate-x-1/2" />
            {T.journey.map((item, i) => (
              <div key={i} className={`relative mb-10 md:w-1/2 ${i % 2 === 0 ? 'md:mr-auto md:text-right md:pr-[30px]' : 'md:ml-auto md:text-left md:pl-[30px]'} pl-[50px] md:pl-[30px]`}>
                <div className={`absolute w-4 h-4 bg-[var(--gold)] border-[3px] border-[var(--ivory)] rounded-full z-10 top-0 left-5 md:left-auto md:translate-x-0 -translate-x-1/2 ${i % 2 === 0 ? 'md:right-0 md:translate-x-1/2' : 'md:left-0 md:-translate-x-1/2'}`} />
                <div className="font-se-display text-[24px] font-semibold text-[var(--navy)] mb-1.5">{item.year}</div>
                <div className="text-[13px] text-[#7C7766]">{item.event}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="font-se-display text-[42px] font-semibold text-[var(--navy)] mb-10 text-center">
            {T.teamTitle}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-7">
            {T.team.map((m, i) => (
              <div key={i} className="bg-white border border-[rgba(13,32,53,0.1)] rounded-[14px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(200,150,26,0.3)] hover:shadow-[0_10px_32px_rgba(13,32,53,0.1)]">
                <div className="w-full h-[200px] bg-gradient-to-br from-[var(--gold)] to-[rgba(233,193,118,1)] flex items-center justify-center text-[64px] text-[rgba(13,32,53,0.2)]">
                  {m.photo}
                </div>
                <div className="p-5">
                  <div className="font-se-display text-[16px] font-semibold text-[var(--navy)] mb-1">{m.name}</div>
                  <div className="text-[11px] text-[var(--gold)] font-semibold tracking-[0.08em] uppercase mb-2">{m.role}</div>
                  <div className="text-[12px] text-[#7C7766] leading-[1.6]">{m.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div className="mb-0">
          <h2 className="font-se-display text-[42px] font-semibold text-[var(--navy)] mb-10 text-center">
            {T.awardsTitle}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
            {T.awards.map((a, i) => (
              <div key={i} className="p-7 bg-gradient-to-br from-[rgba(200,150,26,0.08)] to-[rgba(200,150,26,0.02)] border border-[rgba(200,150,26,0.2)] rounded-[14px] text-center">
                <div className="text-[40px] mb-3.5">{a.icon}</div>
                <div className="font-se-display text-[16px] font-semibold text-[var(--navy)] mb-1.5">{a.name}</div>
                <div className="text-[11px] text-[var(--gold)] font-semibold tracking-[0.08em]">{a.year}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
