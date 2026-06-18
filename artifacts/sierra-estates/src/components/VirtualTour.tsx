import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "@/contexts/LanguageContext";
import {
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  MapPin, X, Volume2
} from "lucide-react";

interface Room {
  key: string;
  image: string;
  thumb: string;
  description: string;
  descriptionAr: string;
}

const ROOMS: Room[] = [
  {
    key: "tour.room.living",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=90&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=80&auto=format&fit=crop",
    description: "Soaring 6-meter ceilings, Italian marble flooring, and walls of glass overlooking the Arabian Gulf.",
    descriptionAr: "أسقف بارتفاع 6 أمتار، أرضيات رخام إيطالي، وجدران زجاجية تطل على الخليج العربي.",
  },
  {
    key: "tour.room.master",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=90&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80&auto=format&fit=crop",
    description: "A private retreat with walk-in wardrobe, morning terrace, and bespoke joinery by Fendi Casa.",
    descriptionAr: "ملاذ خاص مع خزانة ملابس ووكوف، شرفة صباحية وأثاث مخصص من فندي كاسا.",
  },
  {
    key: "tour.room.kitchen",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=90&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=80&auto=format&fit=crop",
    description: "Bulthaup B3 cabinetry, Sub-Zero refrigeration, La Cornue range. A professional chef's dream.",
    descriptionAr: "خزائن بولتهاب B3، تبريد سوب-زيرو، موقد لا كورنو. حلم الشيف المحترف.",
  },
  {
    key: "tour.room.bath",
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1920&q=90&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=200&q=80&auto=format&fit=crop",
    description: "Onyx stone surfaces, freestanding soaking tub, and a rainfall shower system by Dornbracht.",
    descriptionAr: "أسطح حجر العقيق، حوض نقع مستقل، ونظام دش مطري من دورنبراخت.",
  },
  {
    key: "tour.room.dining",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1920&q=90&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200&q=80&auto=format&fit=crop",
    description: "A grand dining hall for twelve, with statement chandelier and adjacent wine cellar.",
    descriptionAr: "قاعة طعام فخمة لإثني عشر شخصاً، مع ثريا مميزة وقبو نبيذ مجاور.",
  },
  {
    key: "tour.room.pool",
    image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=1920&q=90&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=200&q=80&auto=format&fit=crop",
    description: "A 25-meter infinity pool that merges visually with the Dubai Marina skyline below.",
    descriptionAr: "مسبح لانهائي بطول 25 متراً يندمج بصرياً مع أفق مارينا دبي أدناه.",
  },
  {
    key: "tour.room.office",
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1920&q=90&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&q=80&auto=format&fit=crop",
    description: "A cedar-paneled private study with integrated smart tech, library shelving, and city views.",
    descriptionAr: "مكتب خاص بألواح أرز مع تقنية ذكية متكاملة، أرفف مكتبة وإطلالة على المدينة.",
  },
];

export default function VirtualTour() {
  const { t, lang, isRTL } = useLang();
  const [current, setCurrent] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; dragging: boolean }>({ startX: 0, dragging: false });
  const headerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    setImgLoaded(false);
    setCurrent((c) => (c + 1) % ROOMS.length);
  }, []);
  const goPrev = useCallback(() => {
    setImgLoaded(false);
    setCurrent((c) => (c - 1 + ROOMS.length) % ROOMS.length);
  }, []);
  const goTo = (i: number) => { setImgLoaded(false); setCurrent(i); };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") isRTL ? goPrev() : goNext();
      if (e.key === "ArrowLeft") isRTL ? goNext() : goPrev();
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, isRTL]);

  // Touch/drag swipe
  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, dragging: true };
    containerRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.dragging = false;
    if (Math.abs(dx) > 50) {
      if (isRTL) { dx > 0 ? goPrev() : goNext(); }
      else { dx < 0 ? goNext() : goPrev(); }
    }
  };

  // Fullscreen API
  const toggleFullscreen = async () => {
    if (!fullscreen) {
      try { await containerRef.current?.requestFullscreen(); } catch {}
      setFullscreen(true);
    } else {
      try { await document.exitFullscreen(); } catch {}
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onFSChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  // Auto-advance timer
  const autoRef = useRef<ReturnType<typeof setInterval>>(null!);
  const resetAuto = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(goNext, 8000);
  }, [goNext]);
  useEffect(() => {
    autoRef.current = setInterval(goNext, 8000);
    return () => clearInterval(autoRef.current);
  }, [goNext]);

  // Scroll reveal header
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.querySelectorAll(".reveal,.reveal-left,.reveal-right,.reveal-scale").forEach((c) => c.classList.add("visible")); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const room = ROOMS[current];
  const roomName = t(room.key);
  const desc = lang === "ar" ? room.descriptionAr : room.description;

  return (
    <section id="tour" style={{ padding: "6rem 1.5rem", background: "#0D0D0D", position: "relative" }}>
      {/* Ambient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: "radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div ref={headerRef} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="section-label reveal">{t("tour.label")}</span>
          <div className="gold-divider reveal" />
          <h2 className="section-title font-serif reveal" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: "white", whiteSpace: "pre-line", marginBottom: "1rem" }}>
            {t("tour.title")}
          </h2>
          <p className="reveal" style={{ color: "rgba(255,255,255,0.5)", maxWidth: 560, margin: "0 auto 0.8rem", fontSize: "0.95rem", lineHeight: 1.7 }}>
            {t("tour.sub")}
          </p>
          <p className="reveal" style={{ color: "rgba(201,169,110,0.6)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {t("tour.keyboard")}
          </p>
        </div>

        {/* Tour Container */}
        <div
          ref={containerRef}
          className="tour-panorama"
          style={{
            height: fullscreen ? "100vh" : "clamp(380px, 55vw, 640px)",
            cursor: "grab",
            background: "#000",
            outline: "none",
          }}
          onPointerDown={onPointerDown}
          onPointerUp={(e) => { onPointerUp(e); resetAuto(); }}
          onPointerLeave={(e) => dragRef.current.dragging = false}
          tabIndex={0}
        >
          {/* Main image */}
          <img
            key={room.image}
            src={room.image}
            alt={roomName}
            className={`tour-image ${imgLoaded ? "" : "loading"}`}
            onLoad={() => setImgLoaded(true)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            draggable={false}
          />

          {/* Loading shimmer */}
          {!imgLoaded && (
            <div className="shimmer-bg" style={{ position: "absolute", inset: 0 }} />
          )}

          <div className="tour-overlay" />

          {/* Nav buttons */}
          <button className="tour-nav-btn left" onClick={(e) => { e.stopPropagation(); goPrev(); resetAuto(); }}>
            <ChevronLeft size={22} />
          </button>
          <button className="tour-nav-btn right" onClick={(e) => { e.stopPropagation(); goNext(); resetAuto(); }}>
            <ChevronRight size={22} />
          </button>

          {/* Room label + description */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "2rem 2rem 1.5rem",
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <MapPin size={13} color="var(--gold)" />
                  <span style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)" }}>
                    {`${current + 1} / ${ROOMS.length}`}
                  </span>
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontWeight: 400, color: "white", marginBottom: 6 }}>
                  {roomName}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem", maxWidth: 420, lineHeight: 1.6 }}>
                  {desc}
                </p>
              </div>

              {/* Controls */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {/* Fullscreen */}
                <button
                  className="tour-nav-btn"
                  style={{ position: "static", transform: "none", width: 44, height: 44 }}
                  onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                  title={t("tour.fullscreen")}
                >
                  {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                {fullscreen && (
                  <button
                    className="tour-nav-btn"
                    style={{ position: "static", transform: "none", width: 44, height: 44 }}
                    onClick={(e) => { e.stopPropagation(); setFullscreen(false); document.exitFullscreen().catch(() => {}); }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress dots (top center) */}
          <div style={{
            position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 6,
          }}>
            {ROOMS.map((_, i) => (
              <button
                key={i}
                className={`tour-dot ${i === current ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation(); goTo(i); resetAuto(); }}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div style={{
          display: "flex", gap: 10, marginTop: 16, overflowX: "auto", paddingBottom: 6,
          scrollbarWidth: "none",
        }}>
          {ROOMS.map((r, i) => (
            <div key={i} style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={r.thumb}
                alt={t(r.key)}
                className={`tour-thumb ${i === current ? "active" : ""}`}
                onClick={() => { goTo(i); resetAuto(); }}
              />
              {i === current && (
                <div style={{
                  position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)",
                  width: "70%", height: 2, borderRadius: 2, background: "var(--gold)",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Room label strip */}
        <div style={{ display: "flex", gap: 10, marginTop: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {ROOMS.map((r, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); resetAuto(); }}
              style={{
                flexShrink: 0, background: "none", border: "none", cursor: "pointer",
                fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase",
                color: i === current ? "var(--gold)" : "rgba(255,255,255,0.35)",
                transition: "color 0.3s", paddingBottom: 2, whiteSpace: "nowrap",
              }}
            >
              {t(r.key)}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <button className="btn-gold" onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}>
            {t("tour.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
