import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "@/contexts/LanguageContext";

const SCENES = [
  { bg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80", thumb: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=160&q=70", lbl: "Exterior" },
  { bg: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80", thumb: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=160&q=70", lbl: "Living" },
  { bg: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80", thumb: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=160&q=70", lbl: "Garden" },
  { bg: "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=1600&q=80", thumb: "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=160&q=70", lbl: "Pool" },
  { bg: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80", thumb: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=160&q=70", lbl: "Night" },
];

export default function Hero() {
  const { t } = useLang();
  const [scene, setScene] = useState(0);
  const [drag, setDrag] = useState(false);
  const pRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const ms = useRef({ panX: 50, panY: 50, driftTX: 52, driftTY: 48, driftT: 320, isDragging: false, scrollY: 0 });

  const applyBg = useCallback(() => {
    const b = bgRef.current; if (!b) return;
    const s = ms.current;
    b.style.backgroundPosition = `${s.panX}% ${s.panY}%`;
    b.style.transform = `translateY(${s.scrollY * 0.28}px)`;
  }, []);

  useEffect(() => {
    const onScroll = () => { ms.current.scrollY = window.scrollY; applyBg(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [applyBg]);

  useEffect(() => {
    const cv = pRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * cv.width, y: Math.random() * cv.height,
      r: Math.random() * 1.3 + .35,
      vx: (Math.random() - .5) * .22, vy: -Math.random() * .32 - .07,
      op: Math.random() * .28 + .06,
    }));
    const newTarget = () => {
      const s = ms.current;
      s.driftTX = 36 + Math.random() * 28; s.driftTY = 36 + Math.random() * 28;
      s.driftT = 300 + Math.random() * 200;
    };
    newTarget();
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, cv.width, cv.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = cv.height + 4; p.x = Math.random() * cv.width; }
        if (p.x < -4) p.x = cv.width + 4; else if (p.x > cv.width + 4) p.x = -4;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(211,167,71,${p.op})`; ctx.fill();
      });
      const s = ms.current;
      if (!s.isDragging) {
        if (--s.driftT <= 0) newTarget();
        s.panX += (s.driftTX - s.panX) * .0045;
        s.panY += (s.driftTY - s.panY) * .0045;
        applyBg();
      }
    };
    tick();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(rafRef.current); };
  }, [applyBg]);

  useEffect(() => {
    const id = setInterval(() => setScene(s => (s + 1) % SCENES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const onD = (e: React.MouseEvent) => { ms.current.isDragging = true; setDrag(true); lastRef.current = { x: e.clientX, y: e.clientY }; };
  const onM = (e: React.MouseEvent) => {
    const s = ms.current; if (!s.isDragging || !lastRef.current) return;
    s.panX = Math.max(20, Math.min(80, s.panX - (e.clientX - lastRef.current.x) * .038));
    s.panY = Math.max(20, Math.min(80, s.panY - (e.clientY - lastRef.current.y) * .038));
    lastRef.current = { x: e.clientX, y: e.clientY };
    applyBg();
  };
  const onU = () => { ms.current.isDragging = false; setDrag(false); };

  return (
    <section id="hero" className={`hero${drag ? " grabbing" : ""}`}
      onMouseDown={onD} onMouseMove={onM} onMouseUp={onU} onMouseLeave={onU}>
      <div ref={bgRef} className="hero-bg" style={{ backgroundImage: `url(${SCENES[scene].bg})`, backgroundPosition: "50% 50%" }} />
      <div className="hero-vignette" />
      <canvas ref={pRef} className="hero-particles" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

      <div className="hero-content">
        <div className="hero-eyebrow">{t("hero.eyebrow")}</div>
        <h1 className="hero-title">
          {t("hero.title1")} <em>{t("hero.titleEm")}</em><br />{t("hero.title2")}
        </h1>
        <p className="hero-sub">{t("hero.sub")}</p>
        <div className="hero-stats">
          {[["26","hero.listings"],["19","hero.compounds"],["9.8","hero.aiScore"],["24h","hero.response"]].map(([v, lk], i) => (
            <div key={i} className="hero-stat" style={{ padding: "2px 8px" }}>
              <div className="hero-stat-v">{v}</div>
              <div className="hero-stat-l">{t(lk)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="scene-thumbs">
        {SCENES.map((s, i) => (
          <div key={i} className={`scene-thumb${scene === i ? " active" : ""}`}
            onClick={e => { e.stopPropagation(); setScene(i); }}>
            <img src={s.thumb} alt={s.lbl} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}
