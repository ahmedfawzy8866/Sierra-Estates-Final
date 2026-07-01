'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, ShieldCheck, Play, Award, Check, Percent, ArrowRight, Sparkles } from 'lucide-react';
import ShieldLogo from '../Landing/ShieldLogo';

const COMPOUNDS = [
  'Mivida', 'Eastown', 'Villette (Sodic)', 'Taj City', 'Hyde Park', 'Mountain View iCity',
  'Mountain View Hyde Park', 'Madinaty', 'Uptown Cairo', 'Mostakbal City', 'El Shorouk',
  'Palm Hills New Cairo', 'Katameya Heights', 'Katameya Dunes', 'Stone Residence',
  'Fifth Square', 'La Vista City', 'Sarai', 'Bloomfields', 'SODIC East', 'Zed East',
  'The Waterway', 'Galleria Moon Valley', 'Lake View Residence', 'Al Rehab',
];

const PROPERTY_TYPES_EN = ['Apartment', 'Villa', 'Duplex', 'Penthouse', 'Twin House', 'Townhouse'];
const PROPERTY_TYPES_AR = ['شقة', 'فيلا', 'دوبلكس', 'بنتهاوس', 'توين هاوس', 'تاون هاوس'];

const BUDGETS_RESALE_EN = ['Under 5M EGP', '5M–10M EGP', '10M–20M EGP', '20M+ EGP'];
const BUDGETS_RESALE_AR = ['أقل من ٥ مليون جنيه', '٥–١٠ مليون جنيه', '١٠–٢٠ مليون جنيه', 'أكثر من ٢٠ مليون جنيه'];

const BUDGETS_RENT_EN = ['Under 20k EGP', '20k–50k EGP', '50k–100k EGP', '100k+ EGP'];
const BUDGETS_RENT_AR = ['أقل من ٢٠ ألف جنيه', '٢٠–٥٠ ألف جنيه', '٥٠–١٠٠ ألف جنيه', 'أكثر من ١٠٠ ألف جنيه'];

interface PremiumHeroProps {
  onSearch: (filters: { purpose: string; type: string; compound: string; budget: string }) => void;
  isArabic?: boolean;
}

function rankCompounds(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return COMPOUNDS.slice(0, 8);
  const score = (name: string) => {
    const n = name.toLowerCase();
    if (n === s) return 1000;
    if (n.startsWith(s)) return 800 - n.length;
    const idx = n.indexOf(s);
    if (idx !== -1) return 600 - idx - n.length;
    return -1;
  };
  return COMPOUNDS.map(n => ({ name: n, score: score(n) }))
    .filter(x => x.score > -1)
    .sort((a, b) => b.score - a.score)
    .map(x => x.name)
    .slice(0, 8);
}

export default function PremiumHero({ onSearch, isArabic = false }: PremiumHeroProps) {
  const [purpose, setPurpose] = useState('rent');
  const [selectedType, setSelectedType] = useState('Apartment');
  const [selectedBudget, setSelectedBudget] = useState('Under 20k EGP');
  const [compoundQuery, setCompoundQuery] = useState('');
  const [isComboOpen, setIsComboOpen] = useState(false);
  const [activeComboIndex, setActiveComboIndex] = useState(0);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const comboRef = useRef<HTMLDivElement>(null);

  const compoundResults = useMemo(() => rankCompounds(compoundQuery), [compoundQuery]);

  const propertyTypes = isArabic ? PROPERTY_TYPES_AR : PROPERTY_TYPES_EN;
  const budgets = purpose === 'rent'
    ? (isArabic ? BUDGETS_RENT_AR : BUDGETS_RENT_EN)
    : (isArabic ? BUDGETS_RESALE_AR : BUDGETS_RESALE_EN);

  useEffect(() => {
    setSelectedType(propertyTypes[0]);
    setSelectedBudget(budgets[0]);
  }, [purpose, isArabic]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setIsComboOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName && clientPhone) {
      alert(isArabic ? 'تم إرسال طلب الاستشارة بنجاح! سنتواصل معك خلال ٤ ثوانٍ.' : 'Consultation request sent successfully! We will call you in 4 seconds.');
    }
    onSearch({
      purpose,
      type: selectedType,
      compound: compoundQuery,
      budget: selectedBudget,
    });
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-24 md:py-32 px-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Cinematic Parallax Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&fit=crop')`,
            backgroundPosition: 'center',
          }}
        />
        {/* Navy/Black High-Contrast washed overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#182535]/90 via-[#182535]/85 to-[#182535]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#182535]/40 to-[#182535]/90" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center relative z-10 w-full">
        
        {/* --- LEFT COLUMN: BRANDING & ABOUT US --- */}
        <motion.div 
          initial={{ opacity: 0, x: isArabic ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="flex flex-col text-right lg:text-left gap-8"
          style={{ textAlign: isArabic ? 'right' : 'left' }}
        >
          {/* Fused Gemini-Red Shield Logo and Brand Header */}
          <div className="flex items-center gap-4 justify-start" style={{ flexDirection: isArabic ? 'row-reverse' : 'row' }}>
            <ShieldLogo size={52} />
            <div className="flex flex-col">
              <span className="font-playfair text-3xl font-bold tracking-[0.12em] text-white leading-none">
                {isArabic ? 'سييرا إستيتس' : 'SIERRA ESTATES'}
              </span>
              <span className="text-[10px] tracking-[0.3em] font-mono text-[#C9A84C] font-semibold mt-2 uppercase flex items-center gap-1.5 justify-start" style={{ flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                <Sparkles size={11} className="text-pink-500 animate-pulse" />
                {isArabic ? 'مستقبل العقارات برؤية ذكية' : 'The future of Real Estates'}
              </span>
            </div>
          </div>

          {/* Slogan Headline */}
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight">
            {isArabic ? (
              <>
                الجيل القادم من <br />
                <span className="italic text-[#C9A84C]">العقارات الفاخرة</span> بالذكاء الاصطناعي
              </>
            ) : (
              <>
                The Next Generation of <br />
                <span className="italic text-[#C9A84C]">Luxury Real Estate</span>
              </>
            )}
          </h1>

          {/* Bilingual About Us (نبذة عننا) Overview */}
          <div className="flex flex-col gap-4 border-l-2 border-[#C9A84C]/30 pl-6 pr-0" style={{ borderLeftWidth: isArabic ? 0 : 2, borderRightWidth: isArabic ? 2 : 0, borderRightColor: '#C9A84C/30', paddingLeft: isArabic ? 0 : 24, paddingRight: isArabic ? 24 : 0 }}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A84C]">
              {isArabic ? 'نبذة عننا' : 'ABOUT US'}
            </span>
            <p className="text-sm md:text-base text-white/70 leading-relaxed font-light">
              {isArabic ? (
                'سييرا إستيتس تمثل مستقبل الاستشارات العقارية المدعومة بالذكاء الاصطناعي في القاهرة الجديدة. نحن نوجه المستثمرين المتميزين نحو محفظة عقارية حصرية وخارج السوق، منتقاة بعناية بشرية فائقة ومحسّنة بخوارزميات ذكية لتأمين أعلى العوائد الرأسمالية والخصوصية التامة.'
              ) : (
                'Sierra Estates represents the future of real estate advisory. We match qualified buyers and discerning investors with off-market inventory in New Cairo\'s premium zones, backed by deep data modeling, automated yield analysis, and qualified advisory lines.'
              )}
            </p>
          </div>

          {/* Interactive micro-badge list */}
          <div className="flex flex-wrap gap-4 pt-4 justify-start" style={{ flexDirection: isArabic ? 'row-reverse' : 'row' }}>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">
                {isArabic ? 'تحديث فوري للسوق' : 'Live Market Ingestion'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">
                {isArabic ? 'ذكاء اصطناعي ثنائي اللغة' : 'Bilingual Gemini AI'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT COLUMN: SMART REQUEST FILTER CARD --- */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="relative w-full"
        >
          {/* Pulsing "18% OFF SERVICE FEES" Campaign Badge */}
          <div className="absolute -top-4 right-6 z-20 flex items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <div className="ml-2 bg-gradient-to-r from-red-600 to-red-800 text-white font-mono text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-[0_4px_20px_rgba(220,38,38,0.45)] border border-red-500 flex items-center gap-1.5 animate-bounce">
              <Percent size={12} className="stroke-[3px]" />
              <span>{isArabic ? 'خصم ١٨٪ على رسوم الخدمة' : '18% OFF SERVICE FEES'}</span>
            </div>
          </div>

          {/* Floating Dark Glassmorphic Filter Card */}
          <form 
            onSubmit={handleSearchSubmit}
            className="p-8 rounded-[32px] bg-[#0d2035]/80 backdrop-blur-2xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] flex flex-col gap-6"
          >
            <div>
              <h3 className="font-playfair text-xl font-light text-white mb-1">
                {isArabic ? 'بوابة المطابقة الذكية' : 'Smart Request Filter'}
              </h3>
              <p className="text-[10px] text-white/50 tracking-wider">
                {isArabic ? 'قم بتصفية طلبك وسيقوم مستشار سييرا بالرد خلال ٤ ثوانٍ' : 'Configure request criteria for instant AI matchmaking.'}
              </p>
            </div>

            {/* Toggle: Rent / Resale */}
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
              <button 
                type="button"
                onClick={() => setPurpose('rent')}
                className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${
                  purpose === 'rent' 
                    ? 'bg-white text-[#071422] shadow-md' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {isArabic ? 'إيجار' : 'Rent'}
              </button>
              <button 
                type="button"
                onClick={() => setPurpose('resale')}
                className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${
                  purpose === 'resale' 
                    ? 'bg-white text-[#071422] shadow-md' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {isArabic ? 'إعادة بيع' : 'Resale'}
              </button>
            </div>

            {/* Inputs Block */}
            <div className="flex flex-col gap-4">
              
              {/* Autocomplete Compound Search */}
              <div ref={comboRef} className="relative">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 mb-1.5">
                  {isArabic ? 'الكمباوند أو المنطقة المحددة' : 'Target Compound / Area'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={compoundQuery}
                    onFocus={() => setIsComboOpen(true)}
                    onChange={(e) => {
                      setCompoundQuery(e.target.value);
                      setIsComboOpen(true);
                      setActiveComboIndex(0);
                    }}
                    onKeyDown={(e) => {
                      if (!isComboOpen || compoundResults.length === 0) return;
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setActiveComboIndex((prev) => Math.min(prev + 1, compoundResults.length - 1));
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setActiveComboIndex((prev) => Math.max(prev - 1, 0));
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        setCompoundQuery(compoundResults[activeComboIndex]);
                        setIsComboOpen(false);
                      } else if (e.key === 'Escape') {
                        setIsComboOpen(false);
                      }
                    }}
                    placeholder={isArabic ? 'اكتب اسم الكمباوند (مثال: ميفيدا)...' : 'Type compound (e.g. Mivida)...'}
                    className="w-full px-4 py-3.5 bg-black/30 border border-white/10 focus:border-[#C9A84C] outline-none text-xs text-white rounded-xl transition-all"
                  />
                  <Search size={14} className="absolute right-3.5 top-4 text-white/40 pointer-events-none" />
                </div>

                {/* Dropdown list popup */}
                <AnimatePresence>
                  {isComboOpen && compoundResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute z-50 left-0 right-0 mt-2 bg-[#0d2035] border border-white/10 shadow-2xl rounded-2xl max-h-48 overflow-y-auto"
                    >
                      {compoundResults.map((name, i) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setCompoundQuery(name);
                            setIsComboOpen(false);
                          }}
                          onMouseEnter={() => setActiveComboIndex(i)}
                          className={`w-full text-left px-4 py-3 text-xs flex items-center justify-between transition-all ${
                            i === activeComboIndex 
                              ? 'bg-[#C9A84C]/15 text-[#C9A84C]' 
                              : 'text-white/80 hover:text-white'
                          }`}
                        >
                          <span>{name}</span>
                          {name === compoundQuery && <Check size={12} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Grid split for Property Type and Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 mb-1.5">
                    {isArabic ? 'نوع العقار' : 'Property Type'}
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3.5 bg-black/30 border border-white/10 focus:border-[#C9A84C] outline-none text-xs text-white rounded-xl transition-all cursor-pointer"
                  >
                    {propertyTypes.map((t) => (
                      <option key={t} value={t} className="bg-[#182535]">{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 mb-1.5">
                    {isArabic ? 'مستويات الميزانية' : 'Budget Segment'}
                  </label>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full px-4 py-3.5 bg-black/30 border border-white/10 focus:border-[#C9A84C] outline-none text-xs text-white rounded-xl transition-all cursor-pointer"
                  >
                    {budgets.map((b) => (
                      <option key={b} value={b} className="bg-[#182535]">{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name Input Field */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 mb-1.5">
                  {isArabic ? 'اسم العميل بالكامل' : 'Client Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={isArabic ? 'أدخل اسمك...' : 'Enter your name...'}
                  className="w-full px-4 py-3.5 bg-black/30 border border-white/10 focus:border-[#C9A84C] outline-none text-xs text-white rounded-xl transition-all"
                />
              </div>

              {/* Contact Line Input Field */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 mb-1.5">
                  {isArabic ? 'خط التواصل المباشر (موبايل / واتساب)' : 'WhatsApp / Mobile Contact Line'}
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder={isArabic ? '+20 1...' : '+20 1...'}
                  className="w-full px-4 py-3.5 bg-black/30 border border-white/10 focus:border-[#C9A84C] outline-none text-xs text-white rounded-xl transition-all"
                />
              </div>

            </div>

            <button
              type="submit"
              className="w-full mt-2 py-4 bg-gradient-to-r from-[#C9A84C] to-[#E9C176] text-[#071422] font-semibold text-xs rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Search size={14} className="stroke-[2.5px]" />
              <span>{isArabic ? 'بحث وتأكيد عروض الخصم' : 'Search & Unlock Discounts'}</span>
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  );
}
