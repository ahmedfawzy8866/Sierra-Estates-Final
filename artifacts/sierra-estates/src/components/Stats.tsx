import { useEffect, useRef, useState } from "react";
import { useLang } from "@/contexts/LanguageContext";

const STATS = [
  { key: "stats.listings", value: 1500, suffix: "+", prefix: "" },
  { key: "stats.clients", value: 3200, suffix: "+", prefix: "" },
  { key: "stats.years", value: 15, suffix: "", prefix: "" },
  { key: "stats.cities", value: 28, suffix: "", prefix: "" },
  { key: "stats.value", value: 4.2, suffix: "B", prefix: "$" },
];

function CountUp({ target, duration = 2200, suffix = "", prefix = "" }: {
  target: number; duration?: number; suffix?: string; prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.4 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const startVal = 0;
    const isDecimal = target % 1 !== 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = startVal + (target - startVal) * eased;
      setCount(isDecimal ? Math.round(val * 10) / 10 : Math.round(val));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  const display = target % 1 !== 0 ? count.toFixed(1) : count.toLocaleString();

  return (
    <span ref={ref} className="stat-number">
      {prefix}{display}{suffix}
    </span>
  );
}

export default function Stats() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.querySelectorAll(".reveal,.reveal-left,.reveal-right").forEach((c) => c.classList.add("visible"));
      }),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="stats" ref={sectionRef as any} style={{ padding: "6rem 1.5rem", background: "#0D0D0D", position: "relative", overflow: "hidden" }}>
      {/* Ambient gradient */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: "60%", height: "60%",
        background: "radial-gradient(ellipse, rgba(201,169,110,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div className="reveal" style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-label">{t("stats.label")}</span>
          <div className="gold-divider" />
          <h2 className="section-title font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", whiteSpace: "pre-line" }}>
            {t("stats.title")}
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="stagger-children" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
          {STATS.map((s) => (
            <div key={s.key} className="stat-card reveal">
              <CountUp target={s.value} suffix={s.suffix} prefix={s.prefix} />
              <div style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginTop: 10, fontWeight: 500 }}>
                {t(s.key)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
