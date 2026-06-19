import { useState, useMemo, useEffect } from "react";
import AnnBar from "@/components/AnnBar";
import Navbar from "@/components/Navbar";
import SmartRequest from "@/components/SmartRequest";
import Hero from "@/components/Hero";
import Listings from "@/components/Listings";
import VirtualTour from "@/components/VirtualTour";
import MapSection from "@/components/MapSection";
import IntelligenceOS from "@/components/IntelligenceOS";
import WhySierra from "@/components/WhySierra";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";
import WaveDivider from "@/components/WaveDivider";

const ALL_CMP_COUNT = 19;

/* ── Global scroll-reveal observer ── */
function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".rv, .rv-left, .rv-right, .rv-scale").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function Home() {
  const [annVisible, setAnnVisible] = useState(true);
  const [mode, setMode] = useState("all");
  const [selCmps, setSelCmps] = useState<string[]>([]);
  const [rooms, setRooms] = useState<number | null>(null);
  const [smartOpen, setSmartOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useScrollReveal();

  const topOffset = annVisible ? 36 : 0;

  const matchCount = useMemo(() => {
    let n = ALL_CMP_COUNT;
    if (selCmps.length) n = Math.min(n, selCmps.length * 2);
    if (rooms) n = Math.max(1, Math.floor(n * 0.55));
    return n;
  }, [selCmps, rooms]);

  return (
    <div style={{ paddingTop: topOffset }}>
      <AnnBar
        visible={annVisible}
        onDismiss={() => setAnnVisible(false)}
        onClaim={() => setContactOpen(true)}
      />

      <Navbar
        mode={mode}
        setMode={setMode}
        selCmps={selCmps}
        setSelCmps={setSelCmps}
        rooms={rooms}
        setRooms={setRooms}
        matchCount={matchCount}
        onSmartRequest={() => setSmartOpen(o => !o)}
        annVisible={annVisible}
      />

      <SmartRequest
        visible={smartOpen}
        matchCount={matchCount}
        topOffset={topOffset}
        onClose={() => setSmartOpen(false)}
      />

      <div style={{ height: 58 }} />

      {/* ─ HERO ─────────────────────────────────────────────────── */}
      <Hero />

      {/* Wave: navy → ivory */}
      <WaveDivider fromColor="var(--navy2)" toColor="var(--ivory)" />

      {/* ─ LISTINGS ─────────────────────────────────────────────── */}
      <div style={{ background: "var(--ivory)" }}>
        <Listings mode={mode} selCmps={selCmps} rooms={rooms} />
      </div>

      {/* Wave: ivory → navy */}
      <WaveDivider fromColor="var(--ivory)" toColor="var(--navy2)" flip />

      {/* ─ VIRTUAL TOUR ─────────────────────────────────────────── */}
      <VirtualTour />

      {/* Wave: navy → ivory */}
      <WaveDivider fromColor="var(--navy2)" toColor="var(--ivory)" />

      {/* ─ MAP ──────────────────────────────────────────────────── */}
      <MapSection />

      {/* Wave: ivory → navy */}
      <WaveDivider fromColor="var(--ivory)" toColor="var(--navy2)" flip />

      {/* ─ INTELLIGENCE OS ──────────────────────────────────────── */}
      <IntelligenceOS />

      {/* Wave: navy → white */}
      <WaveDivider fromColor="var(--navy2)" toColor="#ffffff" />

      {/* ─ WHY SIERRA ───────────────────────────────────────────── */}
      <WhySierra />

      {/* Wave: white → navy */}
      <WaveDivider fromColor="#ffffff" toColor="var(--navy2)" flip />

      {/* ─ STATS ────────────────────────────────────────────────── */}
      <Stats />

      {/* Wave: navy → ivory */}
      <WaveDivider fromColor="var(--navy2)" toColor="var(--ivory)" />

      {/* ─ TESTIMONIALS ─────────────────────────────────────────── */}
      <Testimonials />

      {/* Wave: ivory → navy */}
      <WaveDivider fromColor="var(--ivory)" toColor="var(--navy2)" flip />

      {/* ─ CONTACT ──────────────────────────────────────────────── */}
      <section id="contact" style={{ background: "var(--navy2)", padding: "90px 0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <div className="sec-eyebrow light rv" style={{ justifyContent: "center" }}>Get In Touch</div>
          <h2 className="sec-title light rv rv-d1" style={{ marginBottom: 12 }}>Find Your Property</h2>
          <p className="sec-sub light rv rv-d2" style={{ maxWidth: 520, margin: "0 auto 36px" }}>
            Tell us what you are looking for and we will match you with the best options in 24 hours.
          </p>
          <div className="rv rv-d3">
            <button
              onClick={() => setContactOpen(true)}
              style={{ padding: "16px 48px", borderRadius: 12, background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", color: "var(--navy)", fontSize: 13, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 28px rgba(211,167,71,.35)", transition: "all .28s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px) scale(1.02)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 16px 40px rgba(211,167,71,.5)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(211,167,71,.35)"; }}
            >
              Submit Request — 25% OFF
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 52, textAlign: "left" }}>
            {[
              { icon: "📞", title: "Call Us", desc: "+20 100 123 4567", sub: "Sun–Thu · 9am–9pm" },
              { icon: "💬", title: "WhatsApp", desc: "+20 110 123 4567", sub: "Available 24/7" },
              { icon: "📍", title: "Visit Us", desc: "90 South Street, 5th Settlement", sub: "New Cairo, Egypt" },
            ].map((c, i) => (
              <div key={i} className={`rv rv-d${i + 1} hover-lift`}
                style={{ background: "rgba(255,255,255,.06)", borderRadius: 18, padding: "26px 24px", border: "1px solid rgba(211,167,71,.18)", cursor: "default" }}>
                <div style={{ fontSize: 30, marginBottom: 12 }}>{c.icon}</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#fff", marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--gold-lt)", marginBottom: 4 }}>{c.desc}</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)" }}>{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:768px){div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* Wave: navy → dark footer */}
      <WaveDivider fromColor="var(--navy2)" toColor="var(--navy2)" />

      <Footer />
      <AIChat />
      <Contact open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
