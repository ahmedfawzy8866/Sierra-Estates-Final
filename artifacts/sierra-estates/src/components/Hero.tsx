import { useState, useEffect, useRef } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { ChevronDown, Search } from "lucide-react";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1920&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=85&auto=format&fit=crop",
];

const FILTERS = ["hero.filter.all", "hero.filter.villa", "hero.filter.penthouse", "hero.filter.apartment", "hero.filter.estate"];

export default function Hero() {
  const { t, isRTL } = useLang();
  const [bgIdx, setBgIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [filter, setFilter] = useState("hero.filter.all");
  const [query, setQuery] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null!);

  const advance = () => {
    setTransitioning(true);
    setTimeout(() => {
      setBgIdx((i) => (i + 1) % BG_IMAGES.length);
      setNextIdx((i) => (i + 1) % BG_IMAGES.length);
      setTransitioning(false);
    }, 800);
  };

  useEffect(() => {
    intervalRef.current = setInterval(advance, 6000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const scrollDown = () => {
    document.querySelector("#stats")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" style={{ position: "relative", height: "100svh", minHeight: 600, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "8vh" }}>
      {/* Background layers */}
      <div className="hero-bg" style={{ backgroundImage: `url(${BG_IMAGES[bgIdx]})`, opacity: transitioning ? 0 : 1, transition: "opacity 0.8s ease" }} />
      <div className="hero-bg" style={{ backgroundImage: `url(${BG_IMAGES[nextIdx]})`, opacity: transitioning ? 1 : 0, transition: "opacity 0.8s ease" }} />
      <div className="hero-gradient" />

      {/* Slide dots */}
      <div style={{ position: "absolute", top: "50%", right: 24, transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 8, zIndex: 10 }}>
        {BG_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => { clearInterval(intervalRef.current); setBgIdx(i); setNextIdx((i + 1) % BG_IMAGES.length); }}
            style={{
              width: 6, height: i === bgIdx ? 28 : 6,
              borderRadius: 10,
              background: i === bgIdx ? "var(--gold)" : "rgba(255,255,255,0.3)",
              border: "none", cursor: "pointer",
              transition: "height 0.4s ease, background 0.4s ease",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", width: "100%" }}>
        {/* Badge */}
        <div style={{ marginBottom: "1.5rem", animation: "fadeInUp 0.9s ease both" }}>
          <span className="hero-badge">{t("hero.badge")}</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif" style={{
          fontSize: "clamp(3.2rem, 8vw, 7rem)",
          fontWeight: 300,
          lineHeight: 1.0,
          color: "white",
          marginBottom: "1.5rem",
          maxWidth: 700,
          animation: "fadeInUp 1s ease 0.15s both",
        }}>
          {t("hero.headline1")}<br />
          <span className="text-gold-gradient">{t("hero.headline2")}</span>
        </h1>

        {/* Sub */}
        <p style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
          maxWidth: 500,
          lineHeight: 1.7,
          marginBottom: "2.5rem",
          animation: "fadeInUp 1s ease 0.3s both",
        }}>
          {t("hero.sub")}
        </p>

        {/* Search Box */}
        <div style={{ animation: "fadeInUp 1s ease 0.45s both", marginBottom: "1.5rem" }}>
          <div className="search-container" style={{ maxWidth: 640 }}>
            <Search size={18} color="var(--gold)" style={{ flexShrink: 0 }} />
            <input
              className="search-input"
              placeholder={t("hero.search.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              dir={isRTL ? "rtl" : "ltr"}
            />
            <button className="btn-gold" style={{ padding: "9px 22px", fontSize: "0.75rem", flexShrink: 0 }}>
              {t("hero.search.btn")}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", animation: "fadeInUp 1s ease 0.6s both", marginBottom: "2rem" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {t(f)}
            </button>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "fadeInUp 1s ease 0.75s both" }}>
          <button className="btn-gold" onClick={() => document.querySelector("#listings")?.scrollIntoView({ behavior: "smooth" })}>
            {t("hero.cta.primary")}
          </button>
          <button className="btn-ghost" onClick={() => document.querySelector("#tour")?.scrollIntoView({ behavior: "smooth" })}>
            {t("hero.cta.secondary")}
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollDown}
        style={{
          position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "none", border: "none", cursor: "pointer", zIndex: 10,
          animation: "float 3s ease-in-out infinite",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          color: "rgba(255,255,255,0.5)",
        }}
      >
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Scroll</span>
        <ChevronDown size={20} />
      </button>
    </section>
  );
}
