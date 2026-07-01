'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/I18nContext';

const COPY = {
  en: {
    dir: 'ltr' as const,
    eyebrow: 'Investor Resource',
    pageTitle: 'New Cairo Investment Guide',
    pageSubtitle: 'Everything you need to know about investing in New Cairo real estate. Data-driven insights, ROI benchmarks, and strategic opportunities.',
    overviewTitle: 'Market Overview',
    metrics: [
      { val: '+12.4%', label: 'YoY Price Growth', desc: 'New Cairo compounds appreciate 12–14% annually' },
      { val: '4–7%', label: 'Avg Rental Yield', desc: 'Short-term rentals average 6–7%; long-term 4%' },
      { val: 'EGP 2.5M–50M', label: 'Investment Range', desc: 'Affordable apartments to luxury villas' },
      { val: '18–24 mo', label: 'Avg Time to ROI', desc: 'Breakeven period for capital appreciation' }
    ],
    whyTitle: 'Why Invest in New Cairo?',
    whyCards: [
      { icon: '🏙️', title: 'Proximity to CBD', desc: '15–20 min drive to Downtown Cairo & East Cairo business districts. Premium location for business professionals & families.' },
      { icon: '💎', title: 'Gated Communities', desc: '19 master-planned compounds with high security, amenities (pools, gyms, schools), and strict HOA governance.' },
      { icon: '🌍', title: 'International Buyer Base', desc: 'Attracts Gulf nationals, expats, and portfolio investors. Strong demand from Saudi Arabia, UAE, Kuwait, and Europe.' },
      { icon: '📈', title: 'Capital Appreciation', desc: 'Consistent 10–15% annual appreciation. Limited supply + growing demand = strong buyer interest.' },
      { icon: '💰', title: 'Rental Income', desc: 'High demand for short-term rentals (tourism, expat relocations). Monthly yields can exceed 6–7% of purchase price.' },
      { icon: '⚖️', title: 'Legal Stability', desc: 'Foreign ownership allowed. Clear title registration. Transparent transaction frameworks.' }
    ],
    benchmarksTitle: 'ROI Benchmarks by Strategy',
    benchmarksHead: ['Strategy', 'Initial Investment', '1-Year Return', '3-Year Return', '5-Year Return', 'Compound Annual Growth'],
    benchmarks: [
      { strategy: 'Capital Appreciation Only', initial: 'EGP 4M–8M', y1: '+8%', y3: '+28%', y5: '+62%', cagr: '+12.4%' },
      { strategy: 'Rental + Appreciation', initial: 'EGP 3.5M–6M', y1: '+10.2%', y3: '+34%', y5: '+78%', cagr: '+14.2%' },
      { strategy: 'Short-Term Rental (Furnished)', initial: 'EGP 5M–10M', y1: '+22%', y3: '+68%', y5: '+140%', cagr: '+24.8%' },
      { strategy: 'Multi-Unit Portfolio', initial: 'EGP 15M+', y1: '+11%', y3: '+36%', y5: '+85%', cagr: '+15.1%' }
    ],
    bestTitle: 'Best Compounds for Investment',
    bestCards: [
      { icon: '🏆', title: 'Hyde Park', text: 'Best for: Luxury capital appreciation\\nAvg Price: EGP 8M–18M\\nYield: 4–5% rental\\nGrowth: +14% YoY' },
      { icon: '🏢', title: 'Mivida', text: 'Best for: Mixed portfolio\\nAvg Price: EGP 4M–9M\\nYield: 6–7% rental\\nGrowth: +12% YoY' },
      { icon: '🌳', title: 'Mountain View iCity', text: 'Best for: Value + growth\\nAvg Price: EGP 3.5M–7M\\nYield: 6.5% rental\\nGrowth: +11% YoY' },
      { icon: '🏠', title: 'Eastown', text: 'Best for: Family homes & rentals\\nAvg Price: EGP 3M–6M\\nYield: 7% rental\\nGrowth: +10% YoY' },
      { icon: '✨', title: 'Palm Hills New Cairo', text: 'Best for: Luxury positioning\\nAvg Price: EGP 6M–14M\\nYield: 5% rental\\nGrowth: +13% YoY' },
      { icon: '🌟', title: 'Villette', text: 'Best for: Emerging appreciation\\nAvg Price: EGP 3M–5.5M\\nYield: 7% rental\\nGrowth: +12% YoY' }
    ],
    tipsTitle: 'Investment Best Practices',
    tipsCards: [
      { num: '1', title: 'Diversify by Compound', desc: 'Spread portfolio across 2–3 compounds to mitigate location-specific risk. Mix luxury (appreciation) + mid-market (yield).' },
      { num: '2', title: 'Use Our ROI Tool', desc: 'Analyze every investment scenario. Model rent increases, capital appreciation, and financing costs in one place.' },
      { num: '3', title: 'Monitor Compound News', desc: 'Proximity to new developments (schools, malls, metro links) dramatically increases property values. Stay informed.' },
      { num: '4', title: 'Timing Matters', desc: 'Buy during soft markets (summer). Sell during peak interest (winter). Our AI predicts optimal windows.' },
      { num: '5', title: 'Think Long-Term', desc: 'Best returns come from 3–5 year holds. Short-term speculation can trap liquidity.' },
      { num: '6', title: 'Work With Experts', desc: 'Use our AI matching to find properties aligned with your goals. Avoid emotional decisions.' }
    ],
    ctaTitle: 'Ready to Invest?',
    ctaDesc: 'Use our ROI Analysis tool to model your investment strategy.',
    ctaBtn: 'Open ROI Analyzer'
  },
  ar: {
    dir: 'rtl' as const,
    eyebrow: 'مورد المستثمر',
    pageTitle: 'دليل الاستثمار في القاهرة الجديدة',
    pageSubtitle: 'كل ما تحتاج لمعرفته حول الاستثمار في عقارات القاهرة الجديدة. رؤى مبنية على البيانات، ومعايير العائد على الاستثمار، وفرص استراتيجية.',
    overviewTitle: 'نظرة عامة على السوق',
    metrics: [
      { val: '+12.4%', label: 'نمو الأسعار السنوي', desc: 'مجمعات القاهرة الجديدة ترتفع قيمتها 12-14٪ سنوياً' },
      { val: '4–7%', label: 'متوسط العائد الإيجاري', desc: 'الإيجارات قصيرة الأجل بمتوسط 6-7٪؛ وطويلة الأجل 4٪' },
      { val: '2.5–50 مليون جنيه', label: 'نطاق الاستثمار', desc: 'من شقق بأسعار معقولة إلى فيلات فاخرة' },
      { val: '18–24 شهراً', label: 'متوسط وقت العائد', desc: 'فترة التعادل لزيادة قيمة رأس المال' }
    ],
    whyTitle: 'لماذا الاستثمار في القاهرة الجديدة؟',
    whyCards: [
      { icon: '🏙️', title: 'القرب من وسط البلد', desc: 'على بعد 15-20 دقيقة من وسط القاهرة ومناطق الأعمال. موقع متميز للمحترفين والعائلات.' },
      { icon: '💎', title: 'مجتمعات مغلقة', desc: '19 مجمعاً سكنياً مخططاً جيداً بأمان عالٍ ومرافق (مسابح، صالات رياضية، مدارس) وحوكمة صارمة.' },
      { icon: '🌍', title: 'قاعدة مشترين دوليين', desc: 'يجذب مواطني الخليج والمغتربين ومستثمري المحافظ. طلب قوي من السعودية والإمارات وأوروبا.' },
      { icon: '📈', title: 'زيادة قيمة رأس المال', desc: 'زيادة سنوية ثابتة بنسبة 10-15٪. عرض محدود + طلب متزايد = اهتمام قوي من المشترين.' },
      { icon: '💰', title: 'الدخل الإيجاري', desc: 'طلب مرتفع على الإيجارات قصيرة الأجل. يمكن أن تتجاوز العوائد الشهرية 6-7٪ من سعر الشراء.' },
      { icon: '⚖️', title: 'الاستقرار القانوني', desc: 'يسمح بالملكية الأجنبية. تسجيل ملكية واضح. أطر معاملات شفافة.' }
    ],
    benchmarksTitle: 'معايير العائد على الاستثمار حسب الاستراتيجية',
    benchmarksHead: ['الاستراتيجية', 'الاستثمار الأولي', 'عائد سنة واحدة', 'عائد 3 سنوات', 'عائد 5 سنوات', 'معدل النمو السنوي المركب'],
    benchmarks: [
      { strategy: 'زيادة رأس المال فقط', initial: '4–8 مليون جنيه', y1: '+8%', y3: '+28%', y5: '+62%', cagr: '+12.4%' },
      { strategy: 'الإيجار + الزيادة', initial: '3.5–6 مليون جنيه', y1: '+10.2%', y3: '+34%', y5: '+78%', cagr: '+14.2%' },
      { strategy: 'إيجار قصير الأجل', initial: '5–10 مليون جنيه', y1: '+22%', y3: '+68%', y5: '+140%', cagr: '+24.8%' },
      { strategy: 'محفظة متعددة الوحدات', initial: '15+ مليون جنيه', y1: '+11%', y3: '+36%', y5: '+85%', cagr: '+15.1%' }
    ],
    bestTitle: 'أفضل المجمعات السكنية للاستثمار',
    bestCards: [
      { icon: '🏆', title: 'هايد بارك', text: 'الأفضل لـ: زيادة رأس المال الفاخر\\nمتوسط السعر: 8-18 مليون جنيه\\nالعائد: 4-5٪ إيجار\\nالنمو: +14٪ سنوياً' },
      { icon: '🏢', title: 'ميفيدا', text: 'الأفضل لـ: محفظة مختلطة\\nمتوسط السعر: 4-9 مليون جنيه\\nالعائد: 6-7٪ إيجار\\nالنمو: +12٪ سنوياً' },
      { icon: '🌳', title: 'ماونتن فيو آي سيتي', text: 'الأفضل لـ: القيمة + النمو\\nمتوسط السعر: 3.5-7 مليون جنيه\\nالعائد: 6.5٪ إيجار\\nالنمو: +11٪ سنوياً' },
      { icon: '🏠', title: 'إيستاون', text: 'الأفضل لـ: منازل عائلية وإيجارات\\nمتوسط السعر: 3-6 مليون جنيه\\nالعائد: 7٪ إيجار\\nالنمو: +10٪ سنوياً' },
      { icon: '✨', title: 'بالم هيلز القاهرة الجديدة', text: 'الأفضل لـ: التموقع الفاخر\\nمتوسط السعر: 6-14 مليون جنيه\\nالعائد: 5٪ إيجار\\nالنمو: +13٪ سنوياً' },
      { icon: '🌟', title: 'فيليت', text: 'الأفضل لـ: زيادة ناشئة\\nمتوسط السعر: 3-5.5 مليون جنيه\\nالعائد: 7٪ إيجار\\nالنمو: +12٪ سنوياً' }
    ],
    tipsTitle: 'أفضل ممارسات الاستثمار',
    tipsCards: [
      { num: '1', title: 'تنويع المجمعات', desc: 'وزع محفظتك عبر 2-3 مجمعات لتخفيف المخاطر الخاصة بالموقع. اخلط بين الفاخر والمتوسط.' },
      { num: '2', title: 'استخدم أداة العائد على الاستثمار', desc: 'حلل كل سيناريو استثماري. صمم زيادات الإيجار وزيادة رأس المال في مكان واحد.' },
      { num: '3', title: 'راقب أخبار المجمعات', desc: 'القرب من التطورات الجديدة (مدارس، مراكز تجارية، محطات مترو) يزيد من قيم العقارات بشكل كبير.' },
      { num: '4', title: 'التوقيت مهم', desc: 'اشترِ خلال الأسواق الهادئة (الصيف). بِع خلال ذروة الاهتمام (الشتاء). يتوقع ذكاؤنا الاصطناعي الأوقات المثلى.' },
      { num: '5', title: 'فكر على المدى الطويل', desc: 'أفضل العوائد تأتي من الاحتفاظ لمدة 3-5 سنوات. المضاربة قصيرة الأجل يمكن أن تحبس السيولة.' },
      { num: '6', title: 'العمل مع الخبراء', desc: 'استخدم الذكاء الاصطناعي للمطابقة للعثور على عقارات تتوافق مع أهدافك. تجنب القرارات العاطفية.' }
    ],
    ctaTitle: 'جاهز للاستثمار؟',
    ctaDesc: 'استخدم أداة تحليل العائد على الاستثمار الخاصة بنا لتصميم استراتيجيتك.',
    ctaBtn: 'افتح محلل العائد'
  }
};

export default function InvestPage() {
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
          <p className="text-[16px] text-[#7C7766] max-w-[700px] mx-auto">
            {T.pageSubtitle}
          </p>
        </div>

        {/* Overview */}
        <div className="mb-20">
          <h2 className="font-se-display text-[42px] font-semibold text-[var(--navy)] mb-10 text-center">{T.overviewTitle}</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
            {T.metrics.map((m, i) => (
              <div key={i} className="p-8 bg-white border border-[rgba(13,32,53,0.1)] rounded-[14px] text-center">
                <div className="font-se-display text-[36px] font-bold text-[var(--gold)] mb-1.5">{m.val}</div>
                <div className="text-[12px] font-semibold text-[#7C7766] uppercase tracking-[0.08em]">{m.label}</div>
                <div className="text-[11px] text-[#7C7766] mt-2 leading-[1.5]">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Invest */}
        <div className="mb-20">
          <h2 className="font-se-display text-[42px] font-semibold text-[var(--navy)] mb-10 text-center">{T.whyTitle}</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-7">
            {T.whyCards.map((c, i) => (
              <div key={i} className="p-8 bg-gradient-to-br from-[rgba(200,150,26,0.04)] to-[rgba(200,150,26,0.01)] border border-[rgba(200,150,26,0.15)] rounded-2xl">
                <h3 className="font-se-display text-[22px] font-semibold text-[var(--navy)] mb-3">{c.icon} {c.title}</h3>
                <p className="text-[14px] text-[var(--navy)] leading-[1.7]">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benchmarks Table */}
        <div className="mb-20">
          <h2 className="font-se-display text-[42px] font-semibold text-[var(--navy)] mb-10 text-center">{T.benchmarksTitle}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white border border-[rgba(13,32,53,0.1)] rounded-xl overflow-hidden">
              <thead>
                <tr>
                  {T.benchmarksHead.map((h, i) => (
                    <th key={i} className="p-4 bg-gradient-to-br from-[rgba(200,150,26,0.06)] to-[rgba(200,150,26,0.02)] border-b border-[rgba(13,32,53,0.1)] text-left text-[12px] font-bold text-[var(--navy)] uppercase tracking-[0.06em] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {T.benchmarks.map((row, i) => (
                  <tr key={i} className="hover:bg-[rgba(247,244,236,0.5)] transition-colors">
                    <td className="p-4 border-b border-[rgba(13,32,53,0.1)] text-[13px] text-[var(--navy)]"><strong>{row.strategy}</strong></td>
                    <td className="p-4 border-b border-[rgba(13,32,53,0.1)] text-[13px] text-[var(--navy)] whitespace-nowrap">{row.initial}</td>
                    <td className="p-4 border-b border-[rgba(13,32,53,0.1)] text-[13px] text-[var(--navy)]">{row.y1}</td>
                    <td className="p-4 border-b border-[rgba(13,32,53,0.1)] text-[13px] text-[var(--navy)]">{row.y3}</td>
                    <td className="p-4 border-b border-[rgba(13,32,53,0.1)] text-[13px] text-[var(--navy)]">{row.y5}</td>
                    <td className="p-4 border-b border-[rgba(13,32,53,0.1)] text-[13px] text-[var(--navy)] font-semibold text-[var(--gold)]">{row.cagr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Compounds */}
        <div className="mb-20">
          <h2 className="font-se-display text-[42px] font-semibold text-[var(--navy)] mb-10 text-center">{T.bestTitle}</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-7">
            {T.bestCards.map((c, i) => (
              <div key={i} className="p-8 bg-gradient-to-br from-[rgba(200,150,26,0.04)] to-[rgba(200,150,26,0.01)] border border-[rgba(200,150,26,0.15)] rounded-2xl">
                <h3 className="font-se-display text-[22px] font-semibold text-[var(--navy)] mb-3">{c.icon} {c.title}</h3>
                <p className="text-[14px] text-[var(--navy)] leading-[1.7]">
                  {c.text.split('\\n').map((line, j) => {
                    const parts = line.split(': ');
                    return (
                      <React.Fragment key={j}>
                        {parts.length > 1 ? <><strong className="font-semibold text-[var(--gold)]">{parts[0]}:</strong> {parts[1]}</> : line}
                        <br/>
                      </React.Fragment>
                    );
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mb-20">
          <h2 className="font-se-display text-[42px] font-semibold text-[var(--navy)] mb-10 text-center">{T.tipsTitle}</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-7">
            {T.tipsCards.map((c, i) => (
              <div key={i} className="p-8 bg-white border border-[rgba(13,32,53,0.1)] rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <h3 className="font-se-display text-[20px] font-semibold text-[var(--navy)] mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--gold)] text-white text-[12px]">{c.num}</span> {c.title}
                </h3>
                <p className="text-[14px] text-[#7C7766] leading-[1.7] pl-8">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-[60px] px-7 bg-gradient-to-br from-[rgba(200,150,26,0.08)] to-[rgba(200,150,26,0.02)] rounded-[20px] mb-0">
          <h3 className="font-se-display text-[36px] font-semibold text-[var(--navy)] mb-3">{T.ctaTitle}</h3>
          <p className="text-[15px] text-[#7C7766] mb-7">{T.ctaDesc}</p>
          <button 
            onClick={() => alert('Opening Analyzer...')}
            className="inline-flex items-center justify-center py-3.5 px-8 border-none rounded-[10px] cursor-pointer font-se-ui text-[11px] font-bold tracking-[0.12em] uppercase text-white bg-gradient-to-br from-[var(--gold-lt)] to-[var(--gold)] shadow-[0_6px_18px_rgba(200,150,26,0.28)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(200,150,26,0.4)]"
          >
            {T.ctaBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
