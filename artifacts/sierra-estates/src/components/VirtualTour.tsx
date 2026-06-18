import { useState, useRef, useEffect, useCallback } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from "lucide-react";

const ROOMS = [
  { name: "Living Area",    of: "7 of 7", img: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1400&q=85" },
  { name: "Master Suite",   of: "1 of 7", img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=85" },
  { name: "Private Garden", of: "2 of 7", img: "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=1400&q=85" },
  { name: "Pool Deck",      of: "3 of 7", img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1400&q=85" },
  { name: "Sky Terrace",    of: "4 of 7", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85" },
  { name: "Villa Exterior", of: "5 of 7", img: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1400&q=85" },
  { name: "Kitchen & Dining", of: "6 of 7", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=85" },
];

export default function VirtualTour() {
  const { t } = useLang();
  const [room, setRoom] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(50);
  const lastX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setRoom(r => (r + 1) % ROOMS.length), 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setRoom(r => (r + 1) % ROOMS.length);
      if (e.key === "ArrowLeft") setRoom(r => (r - 1 + ROOMS.length) % ROOMS.length);
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const prev = useCallback(() => setRoom(r => (r - 1 + ROOMS.length) % ROOMS.length), []);
  const next = useCallback(() => setRoom(r => (r + 1) % ROOMS.length), []);

  const onMouseDown = (e: React.MouseEvent) => { setDragging(true); lastX.current = e.clientX; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setOffsetX(x => Math.max(20, Math.min(80, x - dx * 0.05)));
  };
  const onMouseUp = (e: React.MouseEvent) => {
    const dx = e.clientX - touchStartX.current;
    if (Math.abs(dx) > 60) dx < 0 ? next() : prev();
    setDragging(false);
  };
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  };

  const content = (
    <div style={{ position: "relative", height: fullscreen ? "100vh" : "72vh", minHeight: 400, overflow: "hidden", userSelect: "none", cursor: dragging ? "grabbing" : "grab" }}
      ref={containerRef}
      onMouseDown={e => { setDragging(true); lastX.current = e.clientX; touchStartX.current = e.clientX; }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => setDragging(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div style={{
        position: "absolute", inset: "-10%", width: "120%", height: "120%",
        backgroundImage: `url(${ROOMS[room].img})`,
        backgroundSize: "cover", backgroundPosition: `${offsetX}% 50%`,
        transition: "background-image .5s ease",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.12) 0%, rgba(0,0,0,.6) 100%)" }} />

      {/* Badge */}
      <div className="tour-badge">
        <div className="rname">{ROOMS[room].name}</div>
        <div className="rof">{ROOMS[room].of} · Sierra Estates</div>
      </div>

      {/* Controls */}
      <div style={{ position: "absolute", top: 18, right: 20, display: "flex", gap: 7, zIndex: 10 }}>
        <button className="tour-btn" style={{ width: 40, height: 40 }} onClick={() => setFullscreen(f => !f)}>
          {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        {fullscreen && (
          <button className="tour-btn" style={{ width: 40, height: 40 }} onClick={() => setFullscreen(false)}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav arrows */}
      <button className="tour-btn" onClick={prev}
        style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, zIndex: 10 }}>
        <ChevronLeft size={22} />
      </button>
      <button className="tour-btn" onClick={next}
        style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, zIndex: 10 }}>
        <ChevronRight size={22} />
      </button>

      {/* Dot indicators */}
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 10 }}>
        {ROOMS.map((_, i) => (
          <div key={i} onClick={() => setRoom(i)} style={{
            width: i === room ? 24 : 8, height: 8, borderRadius: 4,
            background: i === room ? "var(--gold)" : "rgba(255,255,255,.35)",
            cursor: "pointer", transition: "all .3s",
          }} />
        ))}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 900, background: "#000" }}>
        {content}
        <div className="tour-pills" style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          {ROOMS.map((r, i) => (
            <button key={i} className={`tour-pill${room === i ? " active" : ""}`} onClick={() => setRoom(i)}>{r.name}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section id="tour" className="tour-section">
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "72px 24px 32px" }}>
        <div className="sec-eyebrow light">{t("tour.eyebrow")}</div>
        <h2 className="sec-title light">{t("tour.title")}</h2>
        <p className="sec-sub light">{t("tour.sub")}</p>
      </div>
      <div style={{ borderRadius: 20, overflow: "hidden", maxWidth: 1320, margin: "0 auto", boxShadow: "0 32px 80px rgba(0,0,0,.4)" }}>
        {content}
        <div className="tour-pills">
          {ROOMS.map((r, i) => (
            <button key={i} className={`tour-pill${room === i ? " active" : ""}`} onClick={() => setRoom(i)}>{r.name}</button>
          ))}
        </div>
      </div>
      <div style={{ height: 72 }} />
    </section>
  );
}
