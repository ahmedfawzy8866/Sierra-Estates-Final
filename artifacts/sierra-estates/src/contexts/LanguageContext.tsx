import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "en" | "ar";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.listings": "Listings",
    "nav.tour": "Virtual Tour",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.lang": "عربي",
    "nav.cta": "Find Property",

    // Hero
    "hero.badge": "Premium Real Estate",
    "hero.headline1": "Where Luxury",
    "hero.headline2": "Meets Living",
    "hero.sub": "Discover curated estates, penthouses, and villas across the most prestigious addresses.",
    "hero.cta.primary": "Explore Properties",
    "hero.cta.secondary": "Virtual Tour",
    "hero.search.placeholder": "Search by city, neighborhood, or property type…",
    "hero.search.btn": "Search",
    "hero.filter.all": "All",
    "hero.filter.villa": "Villa",
    "hero.filter.penthouse": "Penthouse",
    "hero.filter.apartment": "Apartment",
    "hero.filter.estate": "Estate",

    // Stats
    "stats.label": "Our Numbers",
    "stats.title": "Built on a Foundation\nof Excellence",
    "stats.listings": "Luxury Listings",
    "stats.clients": "Happy Clients",
    "stats.years": "Years Experience",
    "stats.cities": "Global Cities",
    "stats.value": "Portfolio Value",

    // Listings
    "listings.label": "Properties",
    "listings.title": "Curated\nResidences",
    "listings.sub": "Handpicked for those who demand the extraordinary.",
    "listings.filter.all": "All",
    "listings.filter.villa": "Villa",
    "listings.filter.penthouse": "Penthouse",
    "listings.filter.apartment": "Apartment",
    "listings.filter.estate": "Estate",
    "listings.beds": "Beds",
    "listings.baths": "Baths",
    "listings.sqft": "sq ft",
    "listings.tap": "Tap to flip for details",
    "listings.inquire": "Inquire Now",
    "listings.schedule": "Schedule Visit",
    "listings.flip_back": "Tap to go back",
    "listings.view_all": "View All Properties",
    "listings.for_sale": "For Sale",
    "listings.for_rent": "For Rent",
    "listings.exclusive": "Exclusive",
    "listings.new": "New",
    "listings.featured": "Featured",

    // Virtual Tour
    "tour.label": "Virtual Tour",
    "tour.title": "Step Inside\nYour Dream Home",
    "tour.sub": "Explore every room of our signature penthouse — navigate with arrows, keyboard, or swipe.",
    "tour.keyboard": "Use ← → arrow keys to navigate",
    "tour.fullscreen": "Fullscreen",
    "tour.room.living": "Grand Living Room",
    "tour.room.master": "Master Suite",
    "tour.room.kitchen": "Gourmet Kitchen",
    "tour.room.bath": "Spa Bathroom",
    "tour.room.dining": "Formal Dining",
    "tour.room.pool": "Infinity Pool",
    "tour.room.office": "Private Study",
    "tour.cta": "Book a Private Viewing",

    // Testimonials
    "test.label": "Client Stories",
    "test.title": "Trusted by the\nWorld's Finest",
    "test.1.text": "Sierra Estates redefined what luxury meant for our family. The process was seamless, the team extraordinary.",
    "test.1.name": "Alexander Hartmann",
    "test.1.role": "CEO, Hartmann Capital",
    "test.2.text": "I've bought properties on three continents. None compared to the experience and portfolio Sierra Estates offers.",
    "test.2.name": "Sophia Reyes",
    "test.2.role": "International Investor",
    "test.3.text": "From search to signing, every detail was perfection. Our penthouse in Dubai exceeded every expectation.",
    "test.3.name": "Omar Al-Rashid",
    "test.3.role": "Managing Director",

    // Contact
    "contact.label": "Get in Touch",
    "contact.title": "Let's Find Your\nPerfect Estate",
    "contact.name": "Full Name",
    "contact.email": "Email Address",
    "contact.phone": "Phone Number",
    "contact.budget": "Budget Range",
    "contact.message": "Your message…",
    "contact.submit": "Send Message",
    "contact.address": "Sierra Tower, Downtown Dubai, UAE",
    "contact.phone_val": "+971 4 000 0000",
    "contact.email_val": "hello@sierra-estates.com",

    // Footer
    "footer.tagline": "Where Luxury Meets Living",
    "footer.rights": "© 2025 Sierra Estates. All rights reserved.",
    "footer.company": "Company",
    "footer.properties": "Properties",
    "footer.services": "Services",
    "footer.about": "About Us",
    "footer.careers": "Careers",
    "footer.press": "Press",
    "footer.villas": "Villas",
    "footer.penthouses": "Penthouses",
    "footer.apartments": "Apartments",
    "footer.estates": "Estates",
    "footer.consultation": "Consultation",
    "footer.management": "Property Mgmt",
    "footer.investment": "Investment",
    "footer.relocation": "Relocation",
  },
  ar: {
    // Navbar
    "nav.home": "الرئيسية",
    "nav.listings": "العقارات",
    "nav.tour": "جولة افتراضية",
    "nav.about": "عنا",
    "nav.contact": "اتصل بنا",
    "nav.lang": "English",
    "nav.cta": "ابحث عن عقار",

    // Hero
    "hero.badge": "عقارات فاخرة",
    "hero.headline1": "حيث يلتقي",
    "hero.headline2": "الفخامة بالحياة",
    "hero.sub": "اكتشف مجموعة مختارة من القصور والبنتهاوس والفيلات في أرقى العناوين.",
    "hero.cta.primary": "استعرض العقارات",
    "hero.cta.secondary": "جولة افتراضية",
    "hero.search.placeholder": "ابحث بالمدينة أو الحي أو نوع العقار…",
    "hero.search.btn": "بحث",
    "hero.filter.all": "الكل",
    "hero.filter.villa": "فيلا",
    "hero.filter.penthouse": "بنتهاوس",
    "hero.filter.apartment": "شقة",
    "hero.filter.estate": "قصر",

    // Stats
    "stats.label": "أرقامنا",
    "stats.title": "مبنيون على أساس\nمن التميز",
    "stats.listings": "عقار فاخر",
    "stats.clients": "عميل سعيد",
    "stats.years": "سنوات خبرة",
    "stats.cities": "مدينة عالمية",
    "stats.value": "قيمة المحفظة",

    // Listings
    "listings.label": "العقارات",
    "listings.title": "مساكن\nمختارة بعناية",
    "listings.sub": "اخترناها لمن يستحق الاستثنائي.",
    "listings.filter.all": "الكل",
    "listings.filter.villa": "فيلا",
    "listings.filter.penthouse": "بنتهاوس",
    "listings.filter.apartment": "شقة",
    "listings.filter.estate": "قصر",
    "listings.beds": "غرف",
    "listings.baths": "حمامات",
    "listings.sqft": "قدم مربع",
    "listings.tap": "اضغط لعرض التفاصيل",
    "listings.inquire": "استفسر الآن",
    "listings.schedule": "حجز زيارة",
    "listings.flip_back": "اضغط للعودة",
    "listings.view_all": "عرض جميع العقارات",
    "listings.for_sale": "للبيع",
    "listings.for_rent": "للإيجار",
    "listings.exclusive": "حصري",
    "listings.new": "جديد",
    "listings.featured": "مميز",

    // Virtual Tour
    "tour.label": "جولة افتراضية",
    "tour.title": "ادخل إلى\nمنزل أحلامك",
    "tour.sub": "استكشف كل غرفة في البنتهاوس المميز — تنقّل بالأسهم أو لوحة المفاتيح أو السحب.",
    "tour.keyboard": "استخدم مفاتيح الأسهم ← → للتنقل",
    "tour.fullscreen": "ملء الشاشة",
    "tour.room.living": "غرفة المعيشة الكبرى",
    "tour.room.master": "الجناح الرئيسي",
    "tour.room.kitchen": "المطبخ الفاخر",
    "tour.room.bath": "حمام السبا",
    "tour.room.dining": "غرفة الطعام الرسمية",
    "tour.room.pool": "حمام سباحة لانهائي",
    "tour.room.office": "مكتب خاص",
    "tour.cta": "احجز جولة خاصة",

    // Testimonials
    "test.label": "قصص العملاء",
    "test.title": "موثوق به من\nقِبَل الأفضل في العالم",
    "test.1.text": "أعادت سيرا إيستيتس تعريف معنى الفخامة لعائلتنا. كانت العملية سلسة والفريق استثنائياً.",
    "test.1.name": "ألكسندر هارتمان",
    "test.1.role": "الرئيس التنفيذي، هارتمان كابيتال",
    "test.2.text": "اشتريت عقارات في ثلاث قارات. لم تُقارن أيٌّ منها بتجربة ومحفظة سيرا إيستيتس.",
    "test.2.name": "صوفيا ريس",
    "test.2.role": "مستثمرة دولية",
    "test.3.text": "من البحث إلى التوقيع، كل تفصيلة كانت مثالية. بنتهاوسنا في دبي فاق كل التوقعات.",
    "test.3.name": "عمر الراشد",
    "test.3.role": "المدير التنفيذي",

    // Contact
    "contact.label": "تواصل معنا",
    "contact.title": "لنجد عقارك\nالمثالي معاً",
    "contact.name": "الاسم الكامل",
    "contact.email": "البريد الإلكتروني",
    "contact.phone": "رقم الهاتف",
    "contact.budget": "نطاق الميزانية",
    "contact.message": "رسالتك…",
    "contact.submit": "إرسال الرسالة",
    "contact.address": "برج سيرا، وسط مدينة دبي، الإمارات",
    "contact.phone_val": "٠٠٩٧١ ٤ ٠٠٠ ٠٠٠٠",
    "contact.email_val": "hello@sierra-estates.com",

    // Footer
    "footer.tagline": "حيث يلتقي الفخامة بالحياة",
    "footer.rights": "© ٢٠٢٥ سيرا إيستيتس. جميع الحقوق محفوظة.",
    "footer.company": "الشركة",
    "footer.properties": "العقارات",
    "footer.services": "الخدمات",
    "footer.about": "عنّا",
    "footer.careers": "الوظائف",
    "footer.press": "الصحافة",
    "footer.villas": "فيلات",
    "footer.penthouses": "بنتهاوس",
    "footer.apartments": "شقق",
    "footer.estates": "قصور",
    "footer.consultation": "استشارة",
    "footer.management": "إدارة عقارات",
    "footer.investment": "استثمار",
    "footer.relocation": "انتقال",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  toggleLang: () => {},
  t: (k) => k,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));
  const isRTL = lang === "ar";

  const t = (key: string) => translations[lang]?.[key] ?? key;

  useEffect(() => {
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [lang, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
