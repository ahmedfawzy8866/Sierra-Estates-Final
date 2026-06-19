import { useEffect, useRef, useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import "leaflet/dist/leaflet.css";

const COMPOUNDS = [
  { name: "Uptown Cairo",          lat: 29.9817, lng: 31.4326, units: 12, score: 9.4, price: "EGP 28M" },
  { name: "Hyde Park",             lat: 30.0256, lng: 31.4719, units: 26, score: 9.8, price: "EGP 35M" },
  { name: "Mountain View iCity",   lat: 30.0388, lng: 31.4843, units: 18, score: 9.6, price: "EGP 42M" },
  { name: "Mivida",                lat: 30.0210, lng: 31.4564, units: 14, score: 9.1, price: "EGP 8.5M" },
  { name: "Madinaty",              lat: 30.1015, lng: 31.5992, units: 22, score: 8.8, price: "EGP 4.8M" },
  { name: "Eastown",               lat: 30.0190, lng: 31.4620, units: 11, score: 9.1, price: "EGP 14M" },
  { name: "Palm Hills NC",         lat: 30.0330, lng: 31.4780, units: 9,  score: 9.2, price: "EGP 24M" },
  { name: "Villette",              lat: 30.0285, lng: 31.4882, units: 7,  score: 9.3, price: "EGP 31M" },
  { name: "Fifth Square",          lat: 30.0180, lng: 31.4790, units: 8,  score: 8.9, price: "EGP 18M" },
  { name: "SODIC East",            lat: 30.0620, lng: 31.6180, units: 6,  score: 9.3, price: "EGP 26M" },
  { name: "Taj City",              lat: 30.0442, lng: 31.4512, units: 10, score: 8.9, price: "EGP 6.8M" },
  { name: "Bloomfields",           lat: 30.0588, lng: 31.5640, units: 5,  score: 8.7, price: "EGP 12M" },
  { name: "Sarai",                 lat: 30.0710, lng: 31.6420, units: 8,  score: 9.1, price: "EGP 19.5M" },
  { name: "Al Rehab",              lat: 30.0600, lng: 31.4970, units: 15, score: 8.7, price: "EGP 4.2M" },
  { name: "Katameya Heights",      lat: 29.9958, lng: 31.4358, units: 6,  score: 9.5, price: "EGP 38M" },
  { name: "La Vista City",         lat: 30.0890, lng: 31.6888, units: 4,  score: 9.0, price: "EGP 16M" },
  { name: "Zed East",              lat: 30.0355, lng: 31.6025, units: 5,  score: 9.0, price: "EGP 22M" },
  { name: "New Capital Phase 1",   lat: 30.0250, lng: 31.7398, units: 3,  score: 8.6, price: "EGP 9M" },
  { name: "New Capital City Centre",lat: 30.0080, lng: 31.7820, units: 2, score: 8.5, price: "EGP 7M" },
];

export default function MapSection() {
  const { t } = useLang();
  const mapRef    = useRef<HTMLDivElement>(null);
  const leafRef   = useRef<L.Map | null>(null);
  const [sel, setSel] = useState<typeof COMPOUNDS[0] | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [zoom, setZoom] = useState(11);

  useEffect(() => {
    import("leaflet").then(mod => {
      const L = mod.default ?? mod as unknown as typeof import("leaflet");
      if (!mapRef.current || leafRef.current) return;

      const map = L.map(mapRef.current, {
        center: [30.022, 31.610],
        zoom: 11,
        zoomControl: false,        // ← disable default control
        scrollWheelZoom: false,    // ← disable scroll-to-zoom
        attributionControl: false,
      });
      leafRef.current = map;

      // Track zoom changes to sync state
      map.on("zoomend", () => setZoom(map.getZoom()));

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      COMPOUNDS.forEach(c => {
        const score = c.score;
        const isTop = score >= 9.5;
        const colorMain  = isTop ? "#D3A747" : score >= 9.0 ? "#D3A747" : "rgba(211,167,71,.7)";

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
              <div style="min-width:62px;padding:4px 10px;background:rgba(0,45,98,.93);backdrop-filter:blur(8px);border:1.5px solid ${colorMain};border-radius:22px;font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;color:${colorMain};text-align:center;white-space:nowrap;box-shadow:0 4px 18px rgba(0,0,0,.3);cursor:pointer;line-height:1.4;transition:all .22s;">
                ${c.price}
                <div style="font-size:7px;color:rgba(255,255,255,.45);font-weight:400;margin-top:1px;">${c.name}</div>
              </div>
              ${isTop ? `<div style="position:absolute;inset:-5px;border-radius:26px;border:2px solid ${colorMain};animation:cmRing 2.4s ease-out infinite;pointer-events:none;"></div>` : ""}
            </div>`,
          iconSize: [80, 44],
          iconAnchor: [40, 22],
        });

        const marker = L.marker([c.lat, c.lng], { icon });
        marker.addTo(map);
        marker.on("click", () => setSel(c));
        marker.bindTooltip(`<b>${c.name}</b><br/>AI Score ${c.score}/10 · ${c.units} units`, {
          direction: "top", offset: [0, -28],
          className: "se-tooltip",
        });
      });

      map.fitBounds([[29.97, 31.40], [30.12, 31.82]], { padding: [40, 40] });
    });

    return () => {
      leafRef.current?.remove();
      leafRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = mapRef.current?.querySelector(".leaflet-tile-pane") as HTMLElement;
    if (el) el.style.filter = darkMode ? "brightness(.68) saturate(.85) hue-rotate(185deg)" : "";
  }, [darkMode]);

  const handleZoom = (dir: "in" | "out") => {
    const map = leafRef.current;
    if (!map) return;
    if (dir === "in")  map.zoomIn();
    else               map.zoomOut();
  };

  return (
    <section id="map" style={{ background: "var(--ivory)", padding: "90px 0 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px 36px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div className="rv">
            <div className="sec-eyebrow">Map Intelligence</div>
            <h2 className="sec-title" style={{ marginBottom: 0 }}>New Cairo · New Capital</h2>
            <p className="sec-sub" style={{ marginBottom: 0, marginTop: 8, maxWidth: 480 }}>
              {COMPOUNDS.length} compounds mapped — from Uptown Cairo to the New Administrative Capital.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }} className="rv">
            <button onClick={() => setDarkMode(d => !d)} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border)", background: darkMode ? "rgba(0,45,98,.08)" : "var(--white)", fontSize: 11, fontWeight: 600, color: "var(--navy)", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 1px 8px rgba(10,26,43,.06)", transition: "all .2s" }}>
              {darkMode ? "☀️ Light" : "🌙 Dark"} Map
            </button>
            <button onClick={() => { leafRef.current?.flyTo([30.022, 31.610], 11, { duration: 1.2 }); setSel(null); }} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--white)", fontSize: 11, fontWeight: 600, color: "var(--text-m)", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 1px 8px rgba(10,26,43,.06)" }}>
              ⊙ Reset View
            </button>
          </div>
        </div>

        <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", boxShadow: "0 16px 56px rgba(10,26,43,.16), 0 0 0 1px rgba(211,167,71,.15)" }}>
          <div ref={mapRef} style={{ width: "100%", height: 540 }} />

          {/* ── Custom Zoom Buttons ── */}
          <div style={{ position: "absolute", top: 14, right: 14, zIndex: 900, display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { label: "+", dir: "in"  as const, title: "Zoom in"  },
              { label: "−", dir: "out" as const, title: "Zoom out" },
            ].map(({ label, dir, title }) => (
              <button
                key={dir}
                onClick={() => handleZoom(dir)}
                title={title}
                style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: "rgba(255,255,255,.97)",
                  border: "1.5px solid rgba(211,167,71,.3)",
                  color: "var(--navy)",
                  fontSize: 20, fontWeight: 400, lineHeight: 1,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(10,26,43,.15)",
                  transition: "all .2s",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,var(--gold),var(--gold-lt))"; (e.currentTarget as HTMLButtonElement).style.color = "var(--navy)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--gold)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.97)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--navy)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(211,167,71,.3)"; }}
              >
                {label}
              </button>
            ))}
            {/* Zoom level indicator */}
            <div style={{ width: 36, height: 26, borderRadius: 8, background: "rgba(0,45,98,.85)", border: "1px solid rgba(211,167,71,.25)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
              <span style={{ fontSize: 8.5, fontFamily: "var(--font-mono)", color: "var(--gold)", fontWeight: 600 }}>{zoom}×</span>
            </div>
          </div>

          {/* Selected compound card */}
          {sel && (
            <div style={{ position: "absolute", top: 14, left: 14, zIndex: 500, width: 260, background: "rgba(255,255,255,.97)", backdropFilter: "blur(18px)", border: "1px solid rgba(211,167,71,.28)", borderRadius: 18, padding: 18, boxShadow: "0 14px 44px rgba(10,26,43,.18)", animation: "slideDown .32s cubic-bezier(.16,1,.3,1) both" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 19, color: "var(--navy)", fontWeight: 500, lineHeight: 1.1 }}>{sel.name}</div>
                <button onClick={() => setSel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,45,98,.35)", fontSize: 20, lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[["AI " + sel.score, "Score"], [sel.units + "+", "Units"], [sel.price, "From"]].map(([v, l], i) => (
                  <div key={i} style={{ textAlign: "center", background: "rgba(0,45,98,.04)", border: "1px solid rgba(211,167,71,.14)", borderRadius: 9, padding: "8px 4px" }}>
                    <div style={{ fontWeight: 700, fontSize: i === 2 ? 9.5 : 13, color: "var(--text)", display: "block", lineHeight: 1.1 }}>{v}</div>
                    <div style={{ fontSize: 7.5, color: "var(--text-f)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={() => { leafRef.current?.flyTo([sel.lat, sel.lng], 14, { duration: 1.5 }); }} style={{ flex: 1, padding: "8px", borderRadius: 9, background: "rgba(0,45,98,.06)", border: "1px solid rgba(211,167,71,.2)", color: "var(--navy)", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  📍 Fly To
                </button>
                <a href={`https://wa.me/201092048333?text=I'm interested in ${encodeURIComponent(sel.name)}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: "8px", borderRadius: 9, background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", border: "none", color: "var(--navy)", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  💬 Inquire
                </a>
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{ position: "absolute", bottom: 14, left: 14, zIndex: 500, background: "rgba(255,255,255,.97)", backdropFilter: "blur(12px)", border: "1px solid rgba(211,167,71,.2)", borderRadius: 12, padding: "10px 14px", boxShadow: "0 4px 18px rgba(10,26,43,.12)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7.5, letterSpacing: ".18em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: 7 }}>Legend</div>
            {[["var(--gold)", "Premium (9.5+)"], ["rgba(211,167,71,.7)", "Standard (9.0+)"]].map(([clr, lbl], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: clr as string, border: "2px solid rgba(0,0,0,.12)", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "var(--text-m)" }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compound quick-list below map */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 18 }}>
          {COMPOUNDS.slice(0, 10).map((c, i) => (
            <button key={i} onClick={() => { setSel(c); leafRef.current?.flyTo([c.lat, c.lng], 13, { duration: 1.2 }); }}
              style={{ padding: "10px 12px", borderRadius: 11, border: `1px solid ${sel?.name === c.name ? "var(--gold)" : "rgba(211,167,71,.15)"}`, background: sel?.name === c.name ? "rgba(211,167,71,.08)" : "var(--white)", cursor: "pointer", textAlign: "left", transition: "all .22s", boxShadow: "0 1px 8px rgba(10,26,43,.04)", fontFamily: "inherit" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7.5, color: "var(--gold-dk)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 3 }}>AI {c.score}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--navy)", lineHeight: 1.2 }}>{c.name}</div>
              <div style={{ fontSize: 9.5, color: "var(--text-f)", marginTop: 2 }}>{c.units} units</div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .se-tooltip { background: var(--navy) !important; border: 1px solid rgba(211,167,71,.35) !important; color: #fff !important; font-family: 'Inter', sans-serif !important; font-size: 11px !important; border-radius: 9px !important; padding: 6px 10px !important; box-shadow: 0 8px 24px rgba(0,0,0,.28) !important; }
        .se-tooltip b { color: var(--gold) !important; }
        .se-tooltip::before { border-top-color: rgba(211,167,71,.35) !important; }
        .leaflet-control-attribution { display: none !important; }
        @keyframes cmRing { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.7); opacity: 0; } }
        @media(max-width:900px){ div[style*="repeat(5, 1fr)"]{ grid-template-columns:repeat(2,1fr)!important; } }
      `}</style>
    </section>
  );
}
