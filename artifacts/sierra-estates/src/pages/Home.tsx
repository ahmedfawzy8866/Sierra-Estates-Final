import { useState, useMemo } from "react";
import AnnBar from "@/components/AnnBar";
import Navbar from "@/components/Navbar";
import SmartRequest from "@/components/SmartRequest";
import Hero from "@/components/Hero";
import Listings from "@/components/Listings";
import VirtualTour from "@/components/VirtualTour";
import IntelligenceOS from "@/components/IntelligenceOS";
import WhySierra from "@/components/WhySierra";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";

const ALL_CMP_COUNT = 18;

export default function Home() {
  const [annVisible, setAnnVisible] = useState(true);
  const [mode, setMode] = useState("all");
  const [selCmps, setSelCmps] = useState<string[]>([]);
  const [rooms, setRooms] = useState<number | null>(null);
  const [smartOpen, setSmartOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

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

      {/* Spacer for fixed header */}
      <div style={{ height: 58 }} />

      <Hero />
      <Listings mode={mode} selCmps={selCmps} rooms={rooms} />
      <VirtualTour />
      <IntelligenceOS />
      <WhySierra />
      <Stats />
      <Testimonials />

      <section id="contact" style={{ background: "var(--ivory)", padding: "90px 0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <div className="sec-eyebrow" style={{ justifyContent: "center" }}>Get In Touch</div>
          <h2 className="sec-title">Find Your Property</h2>
          <p className="sec-sub" style={{ maxWidth: 520, margin: "0 auto 36px" }}>
            Tell us what you're looking for and we'll match you with the best options in 24 hours.
          </p>
          <button
            onClick={() => setContactOpen(true)}
            style={{ padding: "16px 42px", borderRadius: 12, background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", color: "var(--navy)", fontSize: 13, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 28px rgba(211,167,71,.35)", transition: "all .28s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 36px rgba(211,167,71,.45)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(211,167,71,.35)"; }}
          >
            ✈ Submit Request — 25% OFF
          </button>

          {/* Contact cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 52, textAlign: "left" }}>
            {[
              { icon: "📞", title: "Call Us", desc: "+20 100 123 4567", sub: "Sun–Thu · 9am–9pm" },
              { icon: "💬", title: "WhatsApp", desc: "+20 110 123 4567", sub: "Available 24/7" },
              { icon: "📍", title: "Visit Us", desc: "90 South Street, 5th Settlement", sub: "New Cairo, Egypt" },
            ].map((c, i) => (
              <div key={i} style={{ background: "var(--white)", borderRadius: 14, padding: "22px 24px", border: "1px solid rgba(211,167,71,.12)", boxShadow: "0 4px 20px rgba(10,26,43,.05)" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--navy)", marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--gold-dk)", marginBottom: 4 }}>{c.desc}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-f)" }}>{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:768px){div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}}`}</style>
      </section>

      <Footer />
      <AIChat />
      <Contact open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
