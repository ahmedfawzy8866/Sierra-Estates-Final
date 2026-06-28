export interface HeroScene {
  bg: string;
  thumb: string;
  lbl: string;
  loc: string;
  tagEn: string;
  tagAr: string;
  title1En: string;
  titleEmEn: string;
  title2En: string;
  title1Ar: string;
  titleEmAr: string;
  title2Ar: string;
  subtitleEn: string;
  subtitleAr: string;
}

export interface TourRoom {
  name: string;
  icon: string;
  of: string;
  bg: string;
  specs: [string, string][];
}

export const SCENES: HeroScene[] = [
  {
    bg: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=90",
    thumb: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=160&q=70",
    lbl: "Villa Exterior",
    loc: "Hyde Park · New Cairo",
    tagEn: "FIRST & ONLY WEBSITE IN EGYPT DESIGNED FOR NEW CAIRO",
    tagAr: "الموقع الأول والوحيد في مصر المصمم خصيصاً للقاهرة الجديدة",
    title1En: "The First Exclusive Destination for ",
    titleEmEn: "New Cairo",
    title2En: "Properties. Rent & Resale.",
    title1Ar: "الوجهة الأولى والحصرية لعقارات ",
    titleEmAr: "القاهرة الجديدة",
    title2Ar: "إيجار وبيع.",
    subtitleEn: "We curate the finest opportunities across the New Cairo market. By combining advanced AI intelligence with an exclusive network of over 1,500 elite brokers across New Cairo, Madinaty, and El Shorouk, we deliver unmatched value tailored precisely to your needs.",
    subtitleAr: "التميز العقاري برؤية ذكية. نجمع بين الذكاء الاصطناعي المتقدم وشبكة حصرية من أكثر من ١٥٠٠ وسيط نخبوي عبر القاهرة الجديدة ومدينتي والشروق، لنقدم قيمة لا تضاهى مصممة خصيصاً لاحتياجاتك."
  },
  {
    bg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=90",
    thumb: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=160&q=70",
    lbl: "Luxury Pool",
    loc: "Mivida · 5th Settlement",
    tagEn: "BEST-IN-CLASS DESIGN",
    tagAr: "تصميم من الطراز العالمي",
    title1En: "Redefining ",
    titleEmEn: "Luxury Living",
    title2En: "with AI-Driven Excellence",
    title1Ar: "إعادة تعريف ",
    titleEmAr: "المعيشة الفاخرة",
    title2Ar: "بتفوق الذكاء الاصطناعي",
    subtitleEn: "Experience the pinnacle of real estate innovation. Our platform provides unprecedented insights into high-end properties, ensuring you make informed decisions with confidence.",
    subtitleAr: "جرب قمة الابتكار العقاري. توفر منصتنا رؤى غير مسبوقة للعقارات الراقية، مما يضمن اتخاذ قرارات مستنيرة بثقة."
  },
  {
    bg: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=90",
    thumb: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=160&q=70",
    lbl: "Garden Estate",
    loc: "Mountain View · New Cairo",
    tagEn: "AI-DRIVEN EXCELLENCE",
    tagAr: "تميز مدفوع بالذكاء الاصطناعي",
    title1En: "Smart Matches for ",
    titleEmEn: "Smart Investors",
    title2En: "",
    title1Ar: "تطابق ذكي ",
    titleEmAr: "للمستثمرين الأذكياء",
    title2Ar: "",
    subtitleEn: "Our intelligence engine evaluates over 40 data points per property, filtering out the noise to present only the highest potential yield and lifestyle fits.",
    subtitleAr: "يقوم محرك الذكاء لدينا بتقييم أكثر من 40 نقطة بيانات لكل عقار، ليقدم لك فقط أعلى العوائد المحتملة والمنازل التي تناسب أسلوب حياتك."
  },
  {
    bg: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=90",
    thumb: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=160&q=70",
    lbl: "Contemporary Villa",
    loc: "Uptown Cairo · Mokattam",
    tagEn: "EXCLUSIVE NETWORK",
    tagAr: "شبكة حصرية",
    title1En: "Unrivaled Access to ",
    titleEmEn: "Premium Compounds",
    title2En: "",
    title1Ar: "وصول لا مثيل له ",
    titleEmAr: "للمجمعات الفاخرة",
    title2Ar: "",
    subtitleEn: "Gain entry to off-market listings and exclusive phases before they launch, backed by our strong relationships with Egypt's top developers.",
    subtitleAr: "احصل على إمكانية الوصول إلى العقارات غير المدرجة في السوق والمراحل الحصرية قبل إطلاقها، مدعومًا بعلاقاتنا القوية مع كبار المطورين في مصر."
  },
  {
    bg: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1920&q=90",
    thumb: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=160&q=70",
    lbl: "Night View",
    loc: "El Shorouk Springs · Shorouk",
    tagEn: "CURATED PORTFOLIO",
    tagAr: "محفظة منتقاة بعناية",
    title1En: "Your Journey to ",
    titleEmEn: "Exceptional Homes",
    title2En: "Begins Here",
    title1Ar: "رحلتك إلى ",
    titleEmAr: "المنازل الاستثنائية",
    title2Ar: "تبدأ هنا",
    subtitleEn: "From architectural masterpieces to high-ROI investments, we've hand-picked the finest selection of New Cairo real estate to match your exact standards.",
    subtitleAr: "من التحف المعمارية إلى الاستثمارات ذات العائد المرتفع، قمنا باختيار أرقى العقارات في القاهرة الجديدة لتتناسب مع معاييرك الدقيقة."
  }
];

export const TOUR_ROOMS: TourRoom[] = [
  {
    name: "Living Area",
    icon: "🛋️",
    of: "01 / 06",
    bg: "/panoramas/vr_living_room_1781980971227.png",
    specs: [["450m²", "Total Area"], ["6", "Bedrooms"], ["5", "Baths"], ["EGP 35M", "Price"]]
  },
  {
    name: "Master Suite",
    icon: "🛏️",
    of: "02 / 06",
    bg: "/panoramas/vr_master_suite_1781980980947.png",
    specs: [["85m²", "Suite Area"], ["En-Suite", "Bathroom"], ["Walk-In", "Wardrobe"], ["Garden", "View"]]
  },
  {
    name: "Private Garden",
    icon: "🌿",
    of: "03 / 06",
    bg: "/panoramas/vr_private_garden_1781980995315.png",
    specs: [["280m²", "Garden"], ["Landscape", "Design"], ["Irrigation", "System"], ["Private", "Access"]]
  },
  {
    name: "Pool Deck",
    icon: "🏊",
    of: "04 / 06",
    bg: "/panoramas/vr_pool_deck_1781981007863.png",
    specs: [["12×5m", "Pool Size"], ["Infinity", "Edge"], ["Heated", "Pool"], ["Outdoor", "Lounge"]]
  },
  {
    name: "Sky Terrace",
    icon: "🌅",
    of: "05 / 06",
    bg: "/panoramas/vr_sky_terrace_1781981024531.png",
    specs: [["120m²", "Terrace"], ["360°", "Panorama"], ["BBQ", "Station"], ["Sunset", "Views"]]
  },
  {
    name: "Villa Exterior",
    icon: "🏡",
    of: "06 / 06",
    bg: "/panoramas/vr_exterior_1781981036306.png",
    specs: [["800m²", "Plot"], ["Corner", "Position"], ["3 Car", "Garage"], ["2026", "Delivery"]]
  }
];

export const ALL_COMPOUNDS: string[] = [
  // New Cairo Compounds
  "Hyde Park",
  "Mountain View iCity",
  "Mountain View Hyde Park",
  "Uptown Cairo",
  "Mivida",
  "Eastown",
  "Palm Hills NC",
  "Villette",
  "Fifth Square",
  "SODIC East",
  "Taj City",
  "Bloomfields",
  "Sarai",
  "Katameya Heights",
  "Al Rehab",
  "Zed East",
  "La Vista City",
  "District 5",
  "Swan Lake",
  "Stone Residence",
  "The Waterway",
  "Katameya Dunes",
  "Lake View Residence",
  "Layan",
  "Azzar",
  "Galleria Moon Valley",
  // Madinaty Compounds
  "Madinaty Villas",
  "Privado Madinaty",
  "Madinaty Apartments",
  "Madinaty",
  // El Shorouk Compounds
  "Sodic East Shorouk",
  "El Shorouk Springs",
  "Al Burouj",
  "Patio Prime Shorouk",
  "Merida Shorouk",
  "El Shorouk"
];

export const NEARBY: string[] = [
  "British International School Cairo",
  "GEMS Cairo International",
  "Cairo American College",
  "AUC New Cairo",
  "Cairo Festival City Mall",
  "Point 90 Mall",
  "Waterway Restaurants",
  "New Cairo Sporting Club",
  "5th Settlement Ring Road",
  "Cairo Airport 30 min"
];
