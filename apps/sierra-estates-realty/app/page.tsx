'use client';
import { logger } from '@/lib/logger';

/**
 * SIERRA ESTATES — UNIFIED HOMEPAGE
 * Bilingual (EN/AR) · RTL · AI Matching · ROI · Virtual Tour · Testimonials
 * Powered by Firestore live sync
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Languages } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, DocumentData } from 'firebase/firestore';
import { db as clientDb } from '@/lib/firebase';

import CinematicHero from '@/components/UI/CinematicHero';
import AIMatchingEngine from '@/components/UI/AIMatchingEngine';
import TestimonialsCarousel from '@/components/UI/TestimonialsCarousel';
import VirtualTour3D from '@/components/UI/VirtualTour3D';
import ROICalculator from '@/components/UI/ROICalculator';
import MobileBottomNav from '@/components/UI/MobileBottomNav';
import InventoryShowcase from '@/components/Listings/InventoryShowcase';
import AISearchBar from '@/components/Search/AISearchBar';

// ─── TRANSLATION DICTIONARY ───────────────────────────────────────────────────
const DICTIONARY = {
  en: {
    navTitle: 'SIERRA ESTATES',
    navSubtitle: 'BEYOND BROKERAGE',
    ctaExplore: 'Explore Portfolio',
    ctaContact: 'Direct Advisory',
    tagline: 'Sovereign Real Estate Advisory',
    title: 'The Apex of Luxury Real Estate in New Cairo',
    desc: 'Uncompromising standard. Highly vetted, off-market inventory matched intelligently to the capital goals of elite investors.',
    stat1Val: '847+',
    stat1Lbl: 'HNWI Advisory Clients',
    stat2Val: '10.5%',
    stat2Lbl: 'Average ROI Realized',
    stat3Val: '$2.8B',
    stat3Lbl: 'Assets Under Advisory',
    spatialLabel: 'SPATIAL TELEMETRY',
    spatialTitle: 'Walk Through Spatial Models Remotely',
    spatialDesc: 'Eliminate friction and redundant site inspections. Our fully integrated Spatial Telemetry renders real-time 3D models with absolute accuracy.',
    yieldsTitle: 'AI Capital Yield Index',
    yieldsDesc: 'Benchmark yields, historic appreciation metrics, and rental indexes across Madinaty, Mostakbal City, and 5th Settlement.',
    contactLabel: 'GOLDEN HOUR ADVISORY',
    contactTitle: 'Direct Advisory Lines',
    contactSubtitle: 'Request immediate callback or live telemetry walk.',
    inputName: 'Full Name',
    inputEmail: 'Email Address',
    inputPhone: 'WhatsApp Contact Line',
    btnSubmit: 'Request Golden Hour Call',
    btnSubmitting: 'Dispatching…',
    successMsg: 'Lead qualified. Our advisory team will reach out shortly.',
    errorMsg: 'Something went wrong. Please try again or message us on WhatsApp.',
  },
  ar: {
    navTitle: 'سييرا إستيتس',
    navSubtitle: 'ما وراء الوساطة العقارية',
    ctaExplore: 'استكشف المحفظة العقارية',
    ctaContact: 'استشارة مباشرة',
    tagline: 'مستشار التطوير العقاري السيادي',
    title: 'قمة العقارات الفاخرة في القاهرة الجديدة',
    desc: 'معايير لا تقبل المساومة. محفظة حصرية ومدروسة بعناية من العقارات المميزة تتطابق بذكاء مع الأهداف الرأسمالية للنخبة.',
    stat1Val: '٨٤٧+',
    stat1Lbl: 'عملاء الاستشارات الاستثمارية',
    stat2Val: '١٠.٥٪',
    stat2Lbl: 'متوسط العائد الاستثماري المحقق',
    stat3Val: '٢.٨ مليار دولار',
    stat3Lbl: 'الأصول الخاضعة للاستشارات',
    spatialLabel: 'معاينة تكنولوجية متقدمة',
    spatialTitle: 'عاين عقارك عن بعد عبر الواقع الافتراضي',
    spatialDesc: 'لا داعي لإضاعة وقتك الثمين في الزيارات الميدانية. قمنا بهندسة نظام مسح وتليمتري ذكي يتيح لك التجول بدقة ملليمترية.',
    yieldsTitle: 'مؤشر أداء العوائد الاستثمارية الذكي',
    yieldsDesc: 'استخدم نظام تسعير سييرا المتطور لمقارنة عوائد الإيجار ونسب النمو التاريخية في مختلف قطاعات القاهرة الجديدة.',
    contactLabel: 'بوابة النخبة',
    contactTitle: 'قنوات الاتصال المباشرة',
    contactSubtitle: 'اطلب إعادة الاتصال الفوري أو جولة بث افتراضية حية.',
    inputName: 'الاسم بالكامل',
    inputEmail: 'البريد الإلكتروني',
    inputPhone: 'رقم الواتساب للتواصل المباشر',
    btnSubmit: 'اطلب مكالمة الساعة الذهبية',
    btnSubmitting: 'جارٍ الإرسال…',
    successMsg: 'تم تأهيل طلبك. سيتواصل معك فريق الاستشارات قريباً.',
    errorMsg: 'حدث خطأ ما. يرجى المحاولة مرة أخرى أو مراسلتنا عبر واتساب.',
  },
};

interface Property extends DocumentData {
  id: string;
  title: string;
  compound: string;
  priceLabel: string;
  img: string;
  beds: number;
  baths: number;
  area: string;
  aiScore: number;
  netCapitalRoi?: number;
}

export default function UnifiedHomepage() {
  const [isAr, setIsAr] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('explore');
  const [filters, setFilters] = useState({
    purpose: '',
    type: '',
    compound: '',
    budget: '',
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [leadStatus, setLeadStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const t = isAr ? DICTIONARY.ar : DICTIONARY.en;

  // Live Firestore sync
  useEffect(() => {
    try {
      const q = query(
        collection(clientDb, 'properties'),
        where('status', '==', 'active'),
        orderBy('aiScore', 'desc')
      );
      const unsub = onSnapshot(q, snap => {
        setProperties(snap.docs.map(d => ({ id: d.id, ...d.data() } as Property)));
      }, err => {
        logger.error('Firestore sync error:', err);
      });
      return () => unsub();
    } catch {
      return () => {};
    }
  }, []);

  const _handleSearch = (f: typeof filters) => {
    setFilters(f);
    const el = document.getElementById('inventory');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setLeadStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (data.get('name') as string)?.trim(),
          email: data.get('email'),
          phone: data.get('phone') || undefined,
          message: 'Golden Hour callback request (homepage)',
          locale: isAr ? 'ar' : 'en',
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setLeadStatus('success');
      form.reset();
    } catch {
      setLeadStatus('error');
    }
  };

  const resetFilters = () => {
    setFilters({
      purpose: '',
      type: '',
      compound: '',
      budget: '',
    });
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#F4F0E8] dark:bg-[#071422] text-[#071422] dark:text-[#F4F0E8] transition-all duration-700 ${
        isAr ? 'font-arabic' : 'font-sans'
      }`}
    >
      {/* ─── FLOATING TOP ADVISORY HEADER ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-[#071422]/70 backdrop-blur-md border-b border-[#071422]/10 dark:border-white/10 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Shield Emblem Logo */}
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0 drop-shadow-lg hover:scale-105 transition-transform duration-300">
              <Image
                src="/sierra-estates-shield.png"
                alt="Sierra Estates Shield"
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* Wordmark */}
            <div className="flex flex-col">
              <span className="font-playfair text-xl font-bold tracking-[0.1em] text-[#071422] dark:text-white leading-tight">
                {t.navTitle}
              </span>
              <span className="text-[8px] tracking-[0.3em] font-mono text-[#C9A84C] font-semibold">
                {t.navSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Language Toggle */}
            <button
              onClick={() => setIsAr(prev => !prev)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#071422]/15 dark:border-white/20 text-xs font-semibold hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
            >
              <Languages size={14} />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            {/* Design Previews Link */}
            <a
              href="/design-previews"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#071422]/50 dark:text-white/50 hover:text-[#C9A84C] dark:hover:text-[#C9A84C] transition-colors"
            >
              Design Archive
            </a>

            {/* CTA */}
            <a
              href="#contact"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#E9C176] text-[#071422] font-semibold text-xs rounded-xl shadow-lg hover:shadow-2xl transition-all uppercase tracking-wider"
            >
              {t.ctaContact}
            </a>
          </div>
        </div>
      </nav>

      {/* ─── PAGE CONTENT ──────────────────────────────────────────────────────── */}
      <div className="pt-20">
        {/* EXPLORE TAB */}
        {activeMobileTab === 'explore' && (
          <>
            {/* Cinematic Hero — Base44-cloned design */}
            <CinematicHero
              onSearch={(query) => {
                setFilters(f => ({ ...f, compound: query }));
                const el = document.getElementById('inventory');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              isArabic={isAr}
            />

            {/* AI Semantic Search — bilingual, rent-focused for foreigner market */}
            <section className="py-12 px-6 md:px-12 bg-gradient-to-b from-transparent to-[#F4F0E8] dark:to-[#071422]">
              <div className="max-w-5xl mx-auto text-center mb-6">
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#071422] dark:text-white mb-2">
                  {isAr ? 'ابحث بذكاءً — بالعربية أو الإنجليزية' : 'Search smarter — in Arabic or English'}
                </h2>
                <p className="text-sm text-[#071422]/60 dark:text-white/60">
                  {isAr
                    ? 'صف ما تبحث عنه بلغتك — يفهم الذكاء الاصطناعي طلبك ويرتّب أفضل النتائج'
                    : 'Describe what you need in plain language — AI understands your intent and ranks the best matches'}
                </p>
              </div>
              <AISearchBar
                locale={isAr ? 'ar' : 'en'}
                variant="hero"
                onSelectResult={(result) => {
                  if (typeof window !== 'undefined') {
                    window.location.href = `/listings/${result.id}`;
                  }
                }}
              />
            </section>

            {/* Stats Bar */}
            <section className="py-12 px-6 bg-[#071422] dark:bg-[#050c14]">
              <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
                {[
                  { val: t.stat1Val, lbl: t.stat1Lbl },
                  { val: t.stat2Val, lbl: t.stat2Lbl },
                  { val: t.stat3Val, lbl: t.stat3Lbl },
                ].map(({ val, lbl }) => (
                  <div key={lbl}>
                    <div className="font-playfair text-3xl md:text-4xl font-bold text-[#C9A84C] mb-1">{val}</div>
                    <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">{lbl}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Matching Engine */}
            <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
              <AIMatchingEngine isAr={isAr} />
            </section>

            {/* Live Inventory */}
            <div id="inventory" className="relative z-10">
              {(filters.purpose || filters.type || filters.compound || filters.budget) && (
                <div className="max-w-6xl mx-auto px-4 md:px-12 pt-6">
                  <button
                    onClick={resetFilters}
                    className="text-xs font-mono uppercase tracking-wider text-[#071422]/70 dark:text-white/70 hover:text-[#C9A84C] transition-colors"
                  >
                    {isAr ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
                  </button>
                </div>
              )}
              <InventoryShowcase filters={filters} />
            </div>

            {/* Testimonials */}
            <div className="py-24 bg-[#F4F0E8] dark:bg-[#071422]/50 border-y border-[#071422]/5 dark:border-white/5">
              <TestimonialsCarousel />
            </div>

            {/* Virtual Tour 3D */}
            <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                <div className="lg:col-span-1">
                  <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-2">
                    {t.spatialLabel}
                  </span>
                  <h2 className="font-playfair text-3xl md:text-4xl font-light leading-tight mb-4 text-[#071422] dark:text-white">
                    {t.spatialTitle}
                  </h2>
                  <p className="text-sm text-[#071422]/70 dark:text-white/70 leading-relaxed">
                    {t.spatialDesc}
                  </p>
                </div>
                <div className="lg:col-span-2">
                  <VirtualTour3D isAr={isAr} />
                </div>
              </div>
            </section>
          </>
        )}

        {/* MAP TAB */}
        {activeMobileTab === 'map' && (
          <div className="px-4 py-8 max-w-5xl mx-auto pt-8">
            <h2 className="font-playfair text-3xl text-[#071422] dark:text-white mb-6">
              {isAr ? 'خريطة المجمعات السكنية' : 'Compound Map'}
            </h2>
            <div className="h-[60vh] rounded-2xl bg-[#0A1520] border border-white/10 flex items-center justify-center">
              <div className="text-center text-white/40">
                <div className="text-4xl mb-3">🗺️</div>
                <p className="text-sm font-mono">Interactive Map — Available on Desktop</p>
                <a href="/map" className="mt-4 inline-block text-xs text-[#C9A84C] underline">
                  Open Full Map →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* YIELDS TAB */}
        {activeMobileTab === 'yields' && (
          <div className="px-6 py-12 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-playfair text-3xl text-[#071422] dark:text-white mb-3">
                {t.yieldsTitle}
              </h2>
              <p className="text-sm text-[#071422]/60 dark:text-white/60 max-w-lg mx-auto">
                {t.yieldsDesc}
              </p>
            </div>

            {/* ROI Benchmarks */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1520] border border-[#071422]/10 dark:border-white/10 mb-8">
              {[
                ['Mostakbal City Sector', '10.5%'],
                ['Fifth Settlement Luxury BUA', '9.2%'],
                ['Madinaty Premium Villas', '8.8%'],
              ].map(([loc, roi]) => (
                <div key={loc} className="flex justify-between py-3 border-b last:border-0 border-black/5 dark:border-white/5">
                  <span className="text-xs text-[#071422]/60 dark:text-white/60">{loc}</span>
                  <span className="text-emerald-400 font-bold text-sm">{roi} Est. ROI</span>
                </div>
              ))}
            </div>

            <ROICalculator isAr={isAr} />
          </div>
        )}

        {/* CONSOLE TAB */}
        {activeMobileTab === 'console' && (
          <div className="px-6 py-12 max-w-xl mx-auto">
            <div className="p-8 rounded-3xl bg-[#050b14] border border-[#C9A84C]/30 text-white font-mono text-xs shadow-2xl">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 font-bold">SIERRA CONCIERGE TERMINAL v3.1</span>
              </div>
              <div className="space-y-4">
                <p className="text-white/60">&gt; Status: Ingestion Engine Listening...</p>
                <p className="text-white/60">&gt; Database: Firestore Connected.</p>
                <p className="text-[#C9A84C] font-semibold">
                  &gt; Live Listings: {properties.length} active properties synced.
                </p>
                <p className="text-white/40">&gt; Waiting for Lead Signal Trigger...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── CONTACT / ADVISORY SECTION ────────────────────────────────────────── */}
      <section id="contact" className="py-24 px-6 md:px-12 max-w-4xl mx-auto mt-12 border-t border-[#071422]/10 dark:border-white/10">
        <div className="text-center mb-12">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-2">
            {t.contactLabel}
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl font-light mb-4 text-[#071422] dark:text-white">
            {t.contactTitle}
          </h2>
          <p className="text-sm text-[#071422]/60 dark:text-white/60">
            {t.contactSubtitle}
          </p>
        </div>

        <form onSubmit={handleLeadSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name-input" className="block text-[10px] uppercase tracking-wider text-[#071422]/60 dark:text-white/60 mb-2 font-mono">
                {t.inputName}
              </label>
              <input
                id="name-input"
                type="text"
                name="name"
                required
                placeholder={t.inputName}
                className="w-full px-5 py-4 rounded-xl bg-white dark:bg-[#071422] border border-[#071422]/15 dark:border-white/10 focus:border-[#C9A84C] outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label htmlFor="email-input" className="block text-[10px] uppercase tracking-wider text-[#071422]/60 dark:text-white/60 mb-2 font-mono">
                {t.inputEmail}
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full px-5 py-4 rounded-xl bg-white dark:bg-[#071422] border border-[#071422]/15 dark:border-white/10 focus:border-[#C9A84C] outline-none transition-colors text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#071422]/60 dark:text-white/60 mb-2 font-mono">
              {t.inputPhone}
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+20 1..."
              className="w-full px-5 py-4 rounded-xl bg-white dark:bg-[#071422] border border-[#071422]/15 dark:border-white/10 focus:border-[#C9A84C] outline-none transition-colors text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={leadStatus === 'submitting'}
            className="w-full py-4 bg-[#071422] text-white dark:bg-gradient-to-r dark:from-[#C9A84C] dark:to-[#E9C176] dark:text-[#071422] font-semibold text-xs rounded-xl shadow-lg hover:shadow-2xl transition-all uppercase tracking-widest font-mono disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {leadStatus === 'submitting' ? t.btnSubmitting : t.btnSubmit}
          </button>
          {leadStatus === 'success' && (
            <p role="status" className="text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {t.successMsg}
            </p>
          )}
          {leadStatus === 'error' && (
            <p role="alert" className="text-center text-sm font-semibold text-red-600 dark:text-red-400">
              {t.errorMsg}
            </p>
          )}
        </form>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────────────── */}
      <footer className="py-12 text-center text-xs text-[#071422]/40 dark:text-white/40 border-t border-[#071422]/5 dark:border-white/5 pb-24 md:pb-12">
        {/* Footer Logo */}
        <div className="flex justify-center mb-4">
          <div className="relative w-10 h-10 opacity-60 hover:opacity-100 transition-opacity duration-300">
            <Image
              src="/sierra-estates-shield.png"
              alt="Sierra Estates"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <p className="font-mono">© {new Date().getFullYear()} SIERRA ESTATES. ALL RIGHTS RESERVED.</p>
        <p className="mt-2 text-[10px]">{t.navSubtitle}</p>
        <div className="flex items-center justify-center gap-6 mt-4 text-[10px]">
          <a href="/design-previews" className="hover:text-[#C9A84C] transition-colors">Design Archive</a>
          <a href="/listings" className="hover:text-[#C9A84C] transition-colors">Listings</a>
          <a href="/about" className="hover:text-[#C9A84C] transition-colors">About</a>
          <a href="/contact" className="hover:text-[#C9A84C] transition-colors">Contact</a>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeMobileTab}
        setActiveTab={setActiveMobileTab}
        isAr={isAr}
      />
    </div>
  );
}
