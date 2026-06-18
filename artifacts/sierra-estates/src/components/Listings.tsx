import { useState, useEffect, useRef } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { Bed, Bath, Maximize2, MapPin, Heart, ArrowRight, RotateCcw } from "lucide-react";

interface Property {
  id: number;
  type: "villa" | "penthouse" | "apartment" | "estate";
  badge: string;
  badgeKey: string;
  name: string;
  nameAr: string;
  location: string;
  locationAr: string;
  price: string;
  priceNote: string;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  description: string;
  descriptionAr: string;
  amenities: string[];
  amenitiesAr: string[];
  tag: "for_sale" | "for_rent" | "exclusive" | "new" | "featured";
}

const PROPERTIES: Property[] = [
  {
    id: 1,
    type: "penthouse",
    badge: "Penthouse",
    badgeKey: "listings.filter.penthouse",
    name: "Azure Sky Penthouse",
    nameAr: "بنتهاوس أزور سكاي",
    location: "Downtown Dubai, UAE",
    locationAr: "وسط مدينة دبي، الإمارات",
    price: "$8,500,000",
    priceNote: "Starting from",
    beds: 5,
    baths: 6,
    sqft: 12400,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=85&auto=format&fit=crop",
    description: "A sky-high sanctuary with panoramic views of the Burj Khalifa and the Arabian Gulf. Every inch crafted for the discerning few.",
    descriptionAr: "ملاذ سماوي بإطلالات بانورامية على برج خليفة والخليج العربي. كل تفصيلة مصنوعة للنخبة.",
    amenities: ["Private Pool", "Helipad", "Smart Home", "Butler Service"],
    amenitiesAr: ["مسبح خاص", "هليباد", "منزل ذكي", "خدمة الخادم"],
    tag: "exclusive",
  },
  {
    id: 2,
    type: "villa",
    badge: "Villa",
    badgeKey: "listings.filter.villa",
    name: "Palm Vista Villa",
    nameAr: "فيلا بالم فيستا",
    location: "Palm Jumeirah, UAE",
    locationAr: "نخلة جميرا، الإمارات",
    price: "$14,200,000",
    priceNote: "Exclusive listing",
    beds: 7,
    baths: 8,
    sqft: 18900,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85&auto=format&fit=crop",
    description: "A waterfront masterpiece set on Palm Jumeirah's prestigious frond. Private beach, infinity pool, and gardens designed by world-class landscape artists.",
    descriptionAr: "تحفة فنية على الواجهة البحرية في نخلة جميرا. شاطئ خاص ومسبح لانهائي وحدائق مصممة بأيدي الفنانين.",
    amenities: ["Private Beach", "Infinity Pool", "6-Car Garage", "Cinema Room"],
    amenitiesAr: ["شاطئ خاص", "مسبح لانهائي", "كراج 6 سيارات", "غرفة سينما"],
    tag: "featured",
  },
  {
    id: 3,
    type: "apartment",
    badge: "Apartment",
    badgeKey: "listings.filter.apartment",
    name: "Marina Lux Residence",
    nameAr: "مارينا لوكس ريزيدنس",
    location: "Dubai Marina, UAE",
    locationAr: "مارينا دبي، الإمارات",
    price: "$3,800,000",
    priceNote: "For Sale",
    beds: 3,
    baths: 4,
    sqft: 5200,
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=85&auto=format&fit=crop",
    description: "A modern sanctuary in the heart of Dubai Marina, with floor-to-ceiling windows framing the shimmering waterway.",
    descriptionAr: "ملاذ عصري في قلب مارينا دبي، بنوافذ من الأرض إلى السقف تُطل على الممر المائي اللامع.",
    amenities: ["Concierge 24/7", "Gym & Spa", "Marina View", "Valet Parking"],
    amenitiesAr: ["كونسيرج ٢٤/٧", "جيم وسبا", "إطلالة مارينا", "صف السيارات"],
    tag: "new",
  },
  {
    id: 4,
    type: "estate",
    badge: "Estate",
    badgeKey: "listings.filter.estate",
    name: "Desert Rose Estate",
    nameAr: "قصر وردة الصحراء",
    location: "Emirates Hills, UAE",
    locationAr: "تلال الإمارات، الإمارات",
    price: "$22,000,000",
    priceNote: "Rare Opportunity",
    beds: 9,
    baths: 11,
    sqft: 32000,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=85&auto=format&fit=crop",
    description: "A legendary estate perched above Emirates Hills, commanding sweeping fairway and skyline views. An unrivaled standard of living.",
    descriptionAr: "قصر أسطوري يطل على تلال الإمارات بإطلالات خلابة. معيار معيشي لا مثيل له.",
    amenities: ["Golf Course View", "Tennis Court", "Wine Cellar", "Staff Quarters"],
    amenitiesAr: ["إطلالة ملعب غولف", "ملعب تنس", "قبو النبيذ", "مسكن الموظفين"],
    tag: "exclusive",
  },
  {
    id: 5,
    type: "villa",
    badge: "Villa",
    badgeKey: "listings.filter.villa",
    name: "Cerulean Beachfront Villa",
    nameAr: "فيلا سيرولين بيتشفرونت",
    location: "Bluewaters Island, UAE",
    locationAr: "جزيرة بلووترز، الإمارات",
    price: "$11,700,000",
    priceNote: "For Sale",
    beds: 6,
    baths: 7,
    sqft: 14500,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=85&auto=format&fit=crop",
    description: "Nestled on Bluewaters Island, this contemporary villa merges art deco elegance with open ocean serenity.",
    descriptionAr: "تقع في جزيرة بلووترز، تجمع هذه الفيلا الفخامة الأرت ديكو مع هدوء المحيط المفتوح.",
    amenities: ["Ocean Front", "Private Dock", "Rooftop Terrace", "Home Gym"],
    amenitiesAr: ["واجهة المحيط", "رصيف خاص", "تراس علوي", "جيم منزلي"],
    tag: "for_sale",
  },
  {
    id: 6,
    type: "penthouse",
    badge: "Penthouse",
    badgeKey: "listings.filter.penthouse",
    name: "Icon Residences Penthouse",
    nameAr: "بنتهاوس آيكون ريزيدنسز",
    location: "Business Bay, UAE",
    locationAr: "خليج الأعمال، الإمارات",
    price: "$6,100,000",
    priceNote: "For Sale",
    beds: 4,
    baths: 5,
    sqft: 8900,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=85&auto=format&fit=crop",
    description: "Perched at the apex of Business Bay, this penthouse offers a commanding canvas of Dubai's canal and skyline — a living work of art.",
    descriptionAr: "على قمة خليج الأعمال، يوفر هذا البنتهاوس مشهداً رائعاً لقناة دبي والأفق — تحفة فنية حية.",
    amenities: ["Canal Views", "Private Elevator", "Chef Kitchen", "Sky Lounge"],
    amenitiesAr: ["إطلالات القناة", "مصعد خاص", "مطبخ شيف", "لاونج سماوي"],
    tag: "featured",
  },
];

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  exclusive: { bg: "rgba(201,169,110,0.18)", color: "var(--gold)" },
  featured: { bg: "rgba(99,102,241,0.18)", color: "#a5b4fc" },
  new: { bg: "rgba(52,211,153,0.18)", color: "#6ee7b7" },
  for_sale: { bg: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)" },
  for_rent: { bg: "rgba(251,146,60,0.15)", color: "#fdba74" },
};

function PropertyCard({ p, index }: { p: Property; index: number }) {
  const { t, lang, isRTL } = useLang();
  const [flipped, setFlipped] = useState(false);
  const [liked, setLiked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const tagStyle = TAG_COLORS[p.tag] || TAG_COLORS.for_sale;
  const name = lang === "ar" ? p.nameAr : p.name;
  const location = lang === "ar" ? p.locationAr : p.location;
  const description = lang === "ar" ? p.descriptionAr : p.description;
  const amenities = lang === "ar" ? p.amenitiesAr : p.amenities;

  return (
    <div
      ref={cardRef}
      className="card-3d-container"
      style={{
        height: 460,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(50px)",
        transition: `opacity 0.7s ease ${index * 0.1}s, transform 0.7s ease ${index * 0.1}s`,
      }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className={`card-3d ${flipped ? "flipped" : ""}`}>
        {/* FRONT */}
        <div className="card-front card-hover-lift">
          <div style={{ position: "relative", height: "60%", overflow: "hidden", borderRadius: "16px 16px 0 0" }}>
            <img
              src={p.image}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            {/* Overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.5) 100%)",
            }} />
            {/* Tag */}
            <div style={{
              position: "absolute", top: 14, left: isRTL ? "auto" : 14, right: isRTL ? 14 : "auto",
              ...tagStyle, padding: "4px 12px", borderRadius: 100,
              fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              {t(`listings.${p.tag}`)}
            </div>
            {/* Like */}
            <button
              onClick={(e) => { e.stopPropagation(); setLiked((l) => !l); }}
              style={{
                position: "absolute", top: 14, right: isRTL ? "auto" : 14, left: isRTL ? 14 : "auto",
                background: liked ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.4)",
                backdropFilter: "blur(8px)", border: "none", borderRadius: "50%",
                width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "background 0.3s",
              }}
            >
              <Heart size={16} fill={liked ? "white" : "transparent"} color="white" />
            </button>
            {/* Badge */}
            <div style={{
              position: "absolute", bottom: 14, left: isRTL ? "auto" : 14, right: isRTL ? 14 : "auto",
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
              padding: "3px 10px", borderRadius: 100, fontSize: "0.68rem", letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.8)",
            }}>
              {t(p.badgeKey)}
            </div>
            {/* Flip hint */}
            <div style={{
              position: "absolute", bottom: 14, right: isRTL ? "auto" : 14, left: isRTL ? 14 : "auto",
              background: "rgba(201,169,110,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(201,169,110,0.3)",
              padding: "3px 10px", borderRadius: 100, fontSize: "0.65rem", letterSpacing: "0.05em",
              color: "var(--gold)", display: "flex", alignItems: "center", gap: 4,
            }}>
              <RotateCcw size={10} /> {t("listings.tap")}
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: "1.2rem 1.4rem", height: "40%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "var(--card-bg)", borderRadius: "0 0 16px 16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.15rem", fontWeight: 500, color: "white", lineHeight: 1.2, marginBottom: 4 }}>
                    {name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                    <MapPin size={11} />
                    {location}
                  </div>
                </div>
                <div className="price-tag" style={{ textAlign: isRTL ? "left" : "right", flexShrink: 0 }}>
                  {p.price}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1.2rem" }}>
              {[
                { icon: <Bed size={13} />, val: p.beds, key: "listings.beds" },
                { icon: <Bath size={13} />, val: p.baths, key: "listings.baths" },
                { icon: <Maximize2 size={13} />, val: p.sqft.toLocaleString(), key: "listings.sqft" },
              ].map((item) => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }}>
                  {item.icon} {item.val} <span style={{ color: "rgba(255,255,255,0.35)" }}>{t(item.key)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="card-back" style={{ display: "flex", flexDirection: "column", padding: "1.6rem", height: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.8rem" }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.15rem", fontWeight: 500, color: "white", lineHeight: 1.2 }}>
              {name}
            </h3>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
              {t("listings.flip_back")}
            </span>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div className="price-tag" style={{ fontSize: "2rem", marginBottom: 2 }}>{p.price}</div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>{p.priceNote}</div>
          </div>

          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "1rem", flex: 1 }}>
            {description}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "1.2rem" }}>
            {amenities.map((a) => (
              <span key={a} className="amenity-badge">{a}</span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-gold" style={{ flex: 1, padding: "10px", fontSize: "0.72rem", justifyContent: "center" }}
              onClick={(e) => { e.stopPropagation(); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}>
              {t("listings.inquire")}
            </button>
            <button className="btn-ghost" style={{ flex: 1, padding: "10px", fontSize: "0.72rem", justifyContent: "center" }}
              onClick={(e) => { e.stopPropagation(); document.querySelector("#tour")?.scrollIntoView({ behavior: "smooth" }); }}>
              {t("listings.schedule")} <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTER_KEYS = ["listings.filter.all", "listings.filter.villa", "listings.filter.penthouse", "listings.filter.apartment", "listings.filter.estate"];
const TYPE_MAP: Record<string, string> = {
  "listings.filter.villa": "villa",
  "listings.filter.penthouse": "penthouse",
  "listings.filter.apartment": "apartment",
  "listings.filter.estate": "estate",
};

export default function Listings() {
  const { t } = useLang();
  const [filter, setFilter] = useState("listings.filter.all");
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.querySelectorAll(".reveal,.reveal-left,.reveal-right").forEach((c) => c.classList.add("visible")); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const filtered = filter === "listings.filter.all"
    ? PROPERTIES
    : PROPERTIES.filter((p) => p.type === TYPE_MAP[filter]);

  return (
    <section id="listings" style={{ padding: "6rem 1.5rem", background: "#0A0A0A" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div ref={headerRef} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <span className="section-label reveal">{t("listings.label")}</span>
            <div className="gold-divider reveal" style={{ margin: "0.5rem 0 0.8rem" }} />
            <h2 className="section-title font-serif reveal" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: "white", whiteSpace: "pre-line" }}>
              {t("listings.title")}
            </h2>
            <p className="reveal" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
              {t("listings.sub")}
            </p>
          </div>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTER_KEYS.map((k) => (
              <button key={k} className={`filter-tab ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>
                {t(k)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {filtered.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <button className="btn-ghost" style={{ fontSize: "0.82rem" }} onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}>
            {t("listings.view_all")} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
