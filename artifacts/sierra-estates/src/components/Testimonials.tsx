import { useRef, useEffect, useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  { nameKey: "test.1.name", roleKey: "test.1.role", textKey: "test.1.text", avatar: "A", color: "#C9A96E" },
  { nameKey: "test.2.name", roleKey: "test.2.role", textKey: "test.2.text", avatar: "S", color: "#818CF8" },
  { nameKey: "test.3.name", roleKey: "test.3.role", textKey: "test.3.text", avatar: "O", color: "#34D399" },
];

export default function Testimonials() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); el.querySelectorAll(".reveal,.reveal-scale").forEach((c) => c.classList.add("visible")); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef as any} style={{ padding: "6rem 1.5rem", background: "#0A0A0A", position: "relative", overflow: "hidden" }}>
      {/* Ambient */}
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 400, height: 400, background: "radial-gradient(circle, rgba(201,169,110,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-label reveal">{t("test.label")}</span>
          <div className="gold-divider reveal" />
          <h2 className="section-title font-serif reveal" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", whiteSpace: "pre-line" }}>
            {t("test.title")}
          </h2>
        </div>

        {/* Cards */}
        <div className="stagger-children" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {TESTIMONIALS.map((t2, i) => (
            <div
              key={i}
              className="testimonial-card reveal-scale"
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: 3, marginBottom: "1rem" }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={14} fill="var(--gold)" color="var(--gold)" />
                ))}
              </div>

              {/* Text */}
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.92rem", lineHeight: 1.8, marginBottom: "1.5rem", fontStyle: "italic" }}>
                {t(t2.textKey)}
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t2.color}33, ${t2.color}66)`,
                  border: `2px solid ${t2.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", fontWeight: 500, color: t2.color,
                  flexShrink: 0,
                }}>
                  {t2.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "white" }}>{t(t2.nameKey)}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>{t(t2.roleKey)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
