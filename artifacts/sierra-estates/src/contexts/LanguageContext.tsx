import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const EN: Record<string, string> = {
  "ann.text": "25% OFF service fees · First 50 users only",
  "ann.spots": "47 SPOTS · Claim Now",
  "nav.home": "Home", "nav.listings": "Listings", "nav.tour": "Virtual Tour",
  "nav.intel": "Intelligence", "nav.about": "About", "nav.contact": "Contact",
  "nav.lang": "ع", "nav.cta": "Smart Request",
  "nav.all": "All", "nav.rent": "Rent", "nav.resale": "Resale",
  "nav.compounds": "All Compounds", "nav.rooms": "Rooms", "nav.nearby": "Nearby",
  "hero.eyebrow": "Artificial Intelligence · New Cairo",
  "hero.title1": "Find Your", "hero.titleEm": "Dream Home", "hero.title2": "Driven by AI",
  "hero.sub": "19 premium compounds · instant AI-powered matching",
  "hero.listings": "Listings", "hero.compounds": "Compounds",
  "hero.aiScore": "AI Score", "hero.response": "Response",
  "listings.eyebrow": "AI-Curated Inventory", "listings.title": "Properties Found",
  "listings.sort.ai": "AI Score ↓", "listings.sort.priceLow": "Price ↑",
  "listings.sort.priceHigh": "Price ↓", "listings.sort.area": "Largest Area",
  "listings.view": "View Property", "listings.cta": "Call / WhatsApp Agent",
  "listings.empty": "No properties match. Try broadening your filters.",
  "tour.eyebrow": "Immersive Experience", "tour.title": "Virtual Property Tour",
  "tour.sub": "Explore our finest properties from wherever you are.",
  "intel.eyebrow": "Intelligence OS", "intel.title": "Powered by AI",
  "intel.sub": "Our platform uses advanced AI to match you with the perfect property.",
  "intel.f1.title": "AI Score Engine",
  "intel.f1.desc": "Every listing rated 1–10 using 40+ data points including appreciation, yield, and lifestyle fit.",
  "intel.f2.title": "Instant Matching",
  "intel.f2.desc": "Tell us your budget and preferences — our AI returns curated matches in under 4 seconds.",
  "intel.f3.title": "Market Signals",
  "intel.f3.desc": "Live price trends, ROI forecasts, and demand heatmaps for every New Cairo compound.",
  "intel.f4.title": "Virtual Tours",
  "intel.f4.desc": "Photorealistic panoramic walkthroughs — visit any property before you step outside.",
  "why.eyebrow": "Why Sierra Estates", "why.title": "Beyond Brokerage",
  "why.sub": "We combine local expertise with AI-driven intelligence to give you an unfair advantage.",
  "why.c1.title": "Curated Portfolio",
  "why.c1.desc": "Hand-selected properties across 19 compounds in New Cairo — only the finest make our list.",
  "why.c2.title": "AI-First Platform",
  "why.c2.desc": "Real-time market intelligence, AI scoring, and instant compound analysis at your fingertips.",
  "why.c3.title": "Bilingual Experts",
  "why.c3.desc": "Our advisors are fully bilingual and available 24 hours a day, 7 days a week.",
  "stats.title": "Trusted by Thousands",
  "stats.portfolio": "Portfolio Value", "stats.listings": "Active Listings",
  "stats.clients": "Happy Clients", "stats.compounds": "Compounds",
  "testi.eyebrow": "Client Reviews", "testi.title": "Voices of Trust",
  "testi.sub": "Real experiences from our valued clients across New Cairo.",
  "contact.eyebrow": "Get In Touch", "contact.title": "Find Your Property",
  "contact.sub": "Tell us what you're looking for and we'll match you with the best options in 24 hours.",
  "contact.name": "Full Name", "contact.wa": "WhatsApp Number",
  "contact.compound": "Preferred Compound", "contact.budget": "Budget",
  "contact.submit": "Submit Request — 25% OFF",
  "contact.success.title": "Request Received!",
  "contact.success.desc": "Our team will contact you within 24 hours with matched listings.",
  "footer.slogan": "Future of Real Estates",
  "footer.company": "Company", "footer.services": "Services",
  "footer.compounds": "Compounds", "footer.legal": "Legal",
  "footer.copy": "© 2026 Sierra Estates. All rights reserved.",
  "chat.placeholder": "Ask Sierra anything…", "chat.online": "● Online · AI Assistant",
  "smart.name": "Name", "smart.wa": "WhatsApp Number",
};

const AR: Record<string, string> = {
  "ann.text": "خصم 25% على رسوم الخدمة · أول 50 مستخدم فقط",
  "ann.spots": "47 مكانًا · احجز الآن",
  "nav.home": "الرئيسية", "nav.listings": "العقارات", "nav.tour": "جولة افتراضية",
  "nav.intel": "الذكاء", "nav.about": "عن سييرا", "nav.contact": "اتصل بنا",
  "nav.lang": "EN", "nav.cta": "طلب ذكي",
  "nav.all": "الكل", "nav.rent": "إيجار", "nav.resale": "إعادة بيع",
  "nav.compounds": "كل المجمعات", "nav.rooms": "الغرف", "nav.nearby": "قريب من",
  "hero.eyebrow": "ذكاء اصطناعي · القاهرة الجديدة",
  "hero.title1": "اعثر على", "hero.titleEm": "بيتك المثالي", "hero.title2": "مدعوم بالذكاء الاصطناعي",
  "hero.sub": "١٩ مجمعاً فاخراً · مطابقة فورية",
  "hero.listings": "عقار", "hero.compounds": "مجمع",
  "hero.aiScore": "تقييم الذكاء", "hero.response": "استجابة",
  "listings.eyebrow": "مختار بالذكاء الاصطناعي", "listings.title": "عقارات متاحة",
  "listings.sort.ai": "تقييم الذكاء ↓", "listings.sort.priceLow": "السعر ↑",
  "listings.sort.priceHigh": "السعر ↓", "listings.sort.area": "الأكبر مساحة",
  "listings.view": "عرض العقار", "listings.cta": "اتصل / واتساب",
  "listings.empty": "لا توجد عقارات مطابقة.",
  "tour.eyebrow": "تجربة غامرة", "tour.title": "جولة افتراضية للعقارات",
  "tour.sub": "استكشف أفضل عقاراتنا من أي مكان.",
  "intel.eyebrow": "نظام الذكاء", "intel.title": "مدعوم بالذكاء الاصطناعي",
  "intel.sub": "منصتنا تستخدم الذكاء الاصطناعي لتطابقك مع العقار المثالي.",
  "intel.f1.title": "محرك التقييم",
  "intel.f1.desc": "كل عقار يُقيَّم من 1-10 باستخدام أكثر من 40 نقطة بيانات.",
  "intel.f2.title": "مطابقة فورية",
  "intel.f2.desc": "أخبرنا بميزانيتك وتفضيلاتك — يعيد ذكاؤنا الاصطناعي نتائج منتقاة خلال 4 ثوانٍ.",
  "intel.f3.title": "إشارات السوق",
  "intel.f3.desc": "اتجاهات الأسعار المباشرة وتوقعات العائد لكل مجمع.",
  "intel.f4.title": "جولات افتراضية",
  "intel.f4.desc": "جولات بانورامية — زر أي عقار قبل أن تغادر منزلك.",
  "why.eyebrow": "لماذا سييرا عستاتس", "why.title": "أكثر من سمسرة",
  "why.sub": "نجمع بين الخبرة المحلية والذكاء الاصطناعي لنمنحك ميزة استثنائية.",
  "why.c1.title": "محفظة منتقاة",
  "why.c1.desc": "عقارات مختارة يدوياً عبر 19 مجمعاً في القاهرة الجديدة.",
  "why.c2.title": "منصة الذكاء أولاً",
  "why.c2.desc": "معلومات السوق الفورية وتحليل المجمعات في متناول يدك.",
  "why.c3.title": "خبراء ثنائيو اللغة",
  "why.c3.desc": "مستشارونا ثنائيو اللغة ومتاحون على مدار 24 ساعة طوال الأسبوع.",
  "stats.title": "موثوق به من آلاف العملاء",
  "stats.portfolio": "قيمة المحفظة", "stats.listings": "عقارات نشطة",
  "stats.clients": "عميل سعيد", "stats.compounds": "مجمع",
  "testi.eyebrow": "آراء العملاء", "testi.title": "أصوات الثقة",
  "testi.sub": "تجارب حقيقية من عملائنا الكرام في القاهرة الجديدة.",
  "contact.eyebrow": "تواصل معنا", "contact.title": "ابحث عن عقارك",
  "contact.sub": "أخبرنا بما تبحث عنه وسنطابقك مع أفضل الخيارات خلال 24 ساعة.",
  "contact.name": "الاسم الكامل", "contact.wa": "رقم واتساب",
  "contact.compound": "المجمع المفضل", "contact.budget": "الميزانية",
  "contact.submit": "إرسال الطلب — خصم 25%",
  "contact.success.title": "تم استلام الطلب!",
  "contact.success.desc": "سيتواصل معك فريقنا خلال 24 ساعة مع العقارات المطابقة.",
  "footer.slogan": "مستقبل العقارات",
  "footer.company": "الشركة", "footer.services": "الخدمات",
  "footer.compounds": "المجمعات", "footer.legal": "قانوني",
  "footer.copy": "© 2026 Sierra Estates. جميع الحقوق محفوظة.",
  "chat.placeholder": "اسأل سييرا…", "chat.online": "● متاح · مساعد ذكي",
  "smart.name": "الاسم", "smart.wa": "رقم واتساب",
};

type LangContextType = {
  lang: "en" | "ar";
  isRTL: boolean;
  t: (key: string) => string;
  toggleLang: () => void;
};

const LangCtx = createContext<LangContextType>({
  lang: "en", isRTL: false, t: (k) => k, toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [lang, isRTL]);

  const t = (key: string) => {
    const dict = lang === "ar" ? AR : EN;
    return dict[key] ?? EN[key] ?? key;
  };

  const toggleLang = () => setLang(l => l === "en" ? "ar" : "en");
  return <LangCtx.Provider value={{ lang, isRTL, t, toggleLang }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
