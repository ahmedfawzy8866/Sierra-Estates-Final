'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/I18nContext';

const COPY = {
  en: {
    dir: 'ltr' as const,
    eyebrow: 'Join Us',
    pageTitle: 'Careers at Sierra Estates',
    pageSubtitle: 'Build the future of AI-powered real estate. Join a team of innovators transforming how Africa invests in property.',
    tabs: { all: 'All Roles', engineering: 'Engineering', product: 'Product & Design', business: 'Business' },
    jobs: [
      { id: '1', title: 'Senior Full-Stack Engineer', dept: 'Engineering', location: 'Cairo', type: 'Full-time', desc: 'Build scalable Next.js applications for millions of users. You\'ll own full-stack features from API design to UI.' },
      { id: '2', title: 'ML Engineer · AI/Matching', dept: 'Engineering', location: 'Cairo', type: 'Full-time', desc: 'Design and train matching algorithms. Improve AI recommendations for property discovery. Python, TensorFlow, Firestore.' },
      { id: '3', title: 'Product Manager', dept: 'Product & Design', location: 'Cairo', type: 'Full-time', desc: 'Own product strategy for our Intelligence OS platform. Drive roadmap prioritization and user outcomes.' },
      { id: '4', title: 'UI/UX Designer', dept: 'Product & Design', location: 'Cairo', type: 'Full-time', desc: 'Design beautiful, intuitive interfaces for real estate tools. Figma, accessibility, user research.' },
      { id: '5', title: 'Real Estate Agent · New Cairo', dept: 'Business', location: 'New Cairo', type: 'Full-time', desc: 'Close deals using AI tools. Manage investor relationships. Bilingual (EN/AR) required.' },
      { id: '6', title: 'Sales Operations', dept: 'Business', location: 'Cairo', type: 'Full-time', desc: 'Build CRM workflows, sales reporting, pipeline management. Salesforce experience a plus.' },
    ],
    applyBtn: 'Apply Now',
    cultureTitle: 'Why Join Sierra?',
    culture: [
      { icon: '🚀', name: 'Impact at Scale', desc: 'Your code reaches thousands of investors monthly. Build products that transform markets.' },
      { icon: '🎓', name: 'Continuous Learning', desc: 'AI/ML workshops, conference budgets, mentorship from founders & industry leaders.' },
      { icon: '💰', name: 'Competitive Comp', desc: 'Market-rate salaries + equity options. Performance bonuses every quarter.' },
      { icon: '🏖️', name: 'Work-Life Balance', desc: 'Flexible hours. Unlimited PTO. Remote-friendly. WFH Fridays.' },
      { icon: '🌍', name: 'Global Team', desc: 'Work alongside engineers from Google, Facebook, and leading African startups.' },
      { icon: '🎯', name: 'Clear Ownership', desc: 'Own your projects. Minimal meetings. Maximum autonomy.' },
    ],
    benefitsTitle: 'Benefits Package',
    benefits: [
      { icon: '🏥', name: 'Comprehensive Health Insurance' },
      { icon: '💻', name: 'Latest Tech & Equipment' },
      { icon: '📚', name: 'Learning & Development Budget' },
      { icon: '🚗', name: 'Transportation Allowance' },
    ],
    ctaTitle: 'Don\'t See Your Role?',
    ctaDesc: 'We\'re always looking for talented people. Send us your CV and tell us what you\'d like to build.',
    ctaBtn: 'Send Your CV'
  },
  ar: {
    dir: 'rtl' as const,
    eyebrow: 'انضم إلينا',
    pageTitle: 'الوظائف في سييرا إستيتس',
    pageSubtitle: 'ابنِ مستقبل العقارات المدعومة بالذكاء الاصطناعي. انضم إلى فريق من المبتكرين الذين يغيرون كيفية استثمار أفريقيا في العقارات.',
    tabs: { all: 'كل الوظائف', engineering: 'الهندسة', product: 'المنتج والتصميم', business: 'الأعمال' },
    jobs: [
      { id: '1', title: 'مهندس Full-Stack أول', dept: 'Engineering', location: 'القاهرة', type: 'دوام كامل', desc: 'بناء تطبيقات Next.js قابلة للتوسع لملايين المستخدمين. ستمتلك ميزات متكاملة من تصميم API إلى واجهة المستخدم.' },
      { id: '2', title: 'مهندس تعلم آلي · المطابقة بالذكاء الاصطناعي', dept: 'Engineering', location: 'القاهرة', type: 'دوام كامل', desc: 'تصميم وتدريب خوارزميات المطابقة. تحسين توصيات الذكاء الاصطناعي لاكتشاف العقارات.' },
      { id: '3', title: 'مدير منتج', dept: 'Product & Design', location: 'القاهرة', type: 'دوام كامل', desc: 'امتلاك استراتيجية المنتج لمنصة Intelligence OS الخاصة بنا. قيادة أولويات خارطة الطريق.' },
      { id: '4', title: 'مصمم UI/UX', dept: 'Product & Design', location: 'القاهرة', type: 'دوام كامل', desc: 'تصميم واجهات جميلة وبديهية لأدوات العقارات. Figma، سهولة الوصول، أبحاث المستخدمين.' },
      { id: '5', title: 'وكيل عقاري · القاهرة الجديدة', dept: 'Business', location: 'القاهرة الجديدة', type: 'دوام كامل', desc: 'إغلاق الصفقات باستخدام أدوات الذكاء الاصطناعي. إدارة علاقات المستثمرين. (إنجليزي/عربي).' },
      { id: '6', title: 'عمليات المبيعات', dept: 'Business', location: 'القاهرة', type: 'دوام كامل', desc: 'بناء تدفقات عمل CRM، تقارير المبيعات، إدارة خطوط الأنابيب.' },
    ],
    applyBtn: 'قدم الآن',
    cultureTitle: 'لماذا تنضم إلى سييرا؟',
    culture: [
      { icon: '🚀', name: 'تأثير واسع النطاق', desc: 'يصل الكود الخاص بك إلى آلاف المستثمرين شهرياً. ابتكار منتجات تحول الأسواق.' },
      { icon: '🎓', name: 'تعلم مستمر', desc: 'ورش عمل للذكاء الاصطناعي، ميزانيات للمؤتمرات، إرشاد من المؤسسين.' },
      { icon: '💰', name: 'تعويضات تنافسية', desc: 'رواتب تنافسية + خيارات أسهم. مكافآت أداء كل ربع سنة.' },
      { icon: '🏖️', name: 'توازن العمل والحياة', desc: 'ساعات مرنة. إجازات غير محدودة. عمل عن بعد أيام الجمعة.' },
      { icon: '🌍', name: 'فريق عالمي', desc: 'اعمل جنباً إلى جنب مع مهندسين من جوجل وفيسبوك وشركات ناشئة رائدة.' },
      { icon: '🎯', name: 'ملكية واضحة', desc: 'امتلك مشاريعك. اجتماعات أقل. استقلالية قصوى.' },
    ],
    benefitsTitle: 'باقة المزايا',
    benefits: [
      { icon: '🏥', name: 'تأمين صحي شامل' },
      { icon: '💻', name: 'أحدث التقنيات والمعدات' },
      { icon: '📚', name: 'ميزانية للتعلم والتطوير' },
      { icon: '🚗', name: 'بدل انتقال' },
    ],
    ctaTitle: 'لا ترى دورك المناسب؟',
    ctaDesc: 'نحن نبحث دائماً عن أشخاص موهوبين. أرسل لنا سيرتك الذاتية وأخبرنا بما ترغب في بنائه.',
    ctaBtn: 'أرسل سيرتك الذاتية'
  }
};

export default function CareersPage() {
  const { locale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'engineering' | 'product' | 'business'>('all');

  useEffect(() => setMounted(true), []);

  const lang = locale === 'ar' ? 'ar' : 'en';
  const T = COPY[lang];

  if (!mounted) return null;

  const filteredJobs = activeTab === 'all' 
    ? T.jobs 
    : T.jobs.filter(job => job.dept.toLowerCase().includes(activeTab.split(' ')[0]));

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

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {(['all', 'engineering', 'product', 'business'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 border rounded-lg text-[12px] font-semibold font-se-ui tracking-[0.05em] transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-gradient-to-br from-[var(--gold-lt)] to-[var(--gold)] text-white border-[var(--gold)]'
                  : 'bg-transparent text-[var(--navy)] border-[rgba(13,32,53,0.1)] hover:border-[var(--gold)] hover:text-[var(--gold)]'
              }`}
            >
              {T.tabs[tab]}
            </button>
          ))}
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 mb-[60px]">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white border border-[rgba(13,32,53,0.1)] rounded-[14px] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(200,150,26,0.3)] hover:shadow-[0_12px_36px_rgba(13,32,53,0.12)] flex flex-col h-full">
              <div className="font-se-display text-[20px] font-semibold text-[var(--navy)] mb-2">{job.title}</div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--gold)] mb-3.5">{T.tabs[job.dept.toLowerCase().includes('engineering') ? 'engineering' : job.dept.toLowerCase().includes('product') ? 'product' : 'business']}</div>
              <div className="flex gap-3.5 mb-4 pb-4 border-b border-[rgba(13,32,53,0.1)] text-[11px] text-[#7C7766] font-semibold">
                <span className="flex items-center gap-1">📍 {job.location}</span>
                <span className="flex items-center gap-1">🕐 {job.type}</span>
              </div>
              <div className="text-[13px] text-[var(--navy)] leading-[1.7] mb-4.5 flex-grow">{job.desc}</div>
              <button 
                onClick={() => alert(`Apply for ${job.title}`)}
                className="mt-auto inline-flex items-center justify-center py-2.5 px-4 border border-[var(--gold)] rounded-lg bg-transparent text-[var(--gold)] text-[11px] font-bold tracking-[0.08em] uppercase transition-all duration-200 hover:bg-gradient-to-br hover:from-[var(--gold-lt)] hover:to-[var(--gold)] hover:text-white"
              >
                {T.applyBtn}
              </button>
            </div>
          ))}
        </div>

        {/* Culture Section */}
        <div className="mb-20">
          <h2 className="font-se-display text-[42px] font-semibold text-[var(--navy)] mb-10 text-center">
            {T.cultureTitle}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-7">
            {T.culture.map((c, i) => (
              <div key={i} className="p-8 bg-gradient-to-br from-[rgba(200,150,26,0.04)] to-[rgba(200,150,26,0.01)] border border-[rgba(200,150,26,0.15)] rounded-[14px] text-center">
                <div className="text-[40px] mb-3.5">{c.icon}</div>
                <div className="font-se-display text-[18px] font-semibold text-[var(--navy)] mb-2.5">{c.name}</div>
                <div className="text-[12px] text-[#7C7766] leading-[1.7]">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20 py-[60px] px-10 bg-gradient-to-br from-[rgba(200,150,26,0.06)] to-[rgba(200,150,26,0.02)] rounded-[20px]">
          <h2 className="font-se-display text-[42px] font-semibold text-[var(--navy)] mb-10 text-center">
            {T.benefitsTitle}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
            {T.benefits.map((b, i) => (
              <div key={i} className="p-5 bg-[rgba(255,255,255,0.6)] rounded-[10px] text-center">
                <div className="text-[32px] mb-2.5">{b.icon}</div>
                <div className="font-se-display text-[14px] font-semibold text-[var(--navy)]">{b.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-[60px] px-7 bg-gradient-to-br from-[rgba(200,150,26,0.08)] to-[rgba(200,150,26,0.02)] rounded-[20px] mb-[60px]">
          <h3 className="font-se-display text-[36px] font-semibold text-[var(--navy)] mb-3">{T.ctaTitle}</h3>
          <p className="text-[15px] text-[#7C7766] mb-7">{T.ctaDesc}</p>
          <button 
            onClick={() => alert('Email Us')}
            className="inline-flex items-center justify-center gap-2 py-3.5 px-8 border-none rounded-[10px] cursor-pointer font-se-ui text-[11px] font-bold tracking-[0.12em] uppercase text-white bg-gradient-to-br from-[var(--gold-lt)] to-[var(--gold)] shadow-[0_6px_18px_rgba(200,150,26,0.28)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(200,150,26,0.4)]"
          >
            {T.ctaBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
