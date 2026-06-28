import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useProperties } from "@/hooks/useListings";
import type { Property } from "@/hooks/useListings";

const COMPOUNDS = ["Hyde Park","Mountain View iCity","Mivida","Madinaty","Villette","Palm Hills NC","Fifth Square","Eastown","SODIC East","Taj City"];
const TYPES = ["all","villa","apartment","penthouse","twin-house","duplex"];

function formatPrice(price: number, purpose: string) {
  if (purpose === "for-rent") return `EGP ${(price / 1000).toFixed(0)}K/mo`;
  if (price >= 1_000_000) return `EGP ${(price / 1_000_000).toFixed(1)}M`;
  return `EGP ${price.toLocaleString()}`;
}

const CAT_COLORS: Record<string, string> = {
  villa: "#C9A96E", penthouse: "#60a5fa", apartment: "#4ade80",
  "twin-house": "#f472b6", duplex: "#a78bfa", townhouse: "#fb923c",
};

export default function Properties() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [compound, setCompound] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rooms, setRooms] = useState<number | null>(null);
  const [sort, setSort] = useState("ai");
  const [view, setView] = useState<"grid" | "list">("grid");

  const { data: allProps, loading, isError, refetch } = useProperties(mode, compound ? [compound] : [], rooms, sort);

  const filtered = useMemo(() => {
    let res = [...allProps];
    if (typeFilter !== "all") res = res.filter(p => p.propertyType === typeFilter);
    if (minPrice) res = res.filter(p => p.price >= Number(minPrice));
    if (maxPrice) res = res.filter(p => p.price <= Number(maxPrice));
    return res;
  }, [allProps, typeFilter, minPrice, maxPrice]);

  return (
    <div style={{ minHeight: "100dvh", background: "#07111e", color: "#fff", fontFamily: "Inter,sans-serif" }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(7,17,30,.97)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(211,167,71,.1)",
        padding: "0 28px",
        height: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#C9A96E,#A07840)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontWeight: 900, color: "#07111e", fontSize: 13 }}>SE</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: ".04em" }}>Sierra Estates</span>
        </a>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setLocation("/")} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>← Home</button>
          <button onClick={() => setLocation("/login")} style={{ padding: "7px 16px", borderRadius: 8, background: "linear-gradient(135deg,#C9A96E,#A07840)", border: "none", color: "#07111e", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Agent Login</button>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "36px 24px" }}>
        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: ".25em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 8, fontFamily: "monospace" }}>— New Cairo · All Compounds</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 38, fontWeight: 400, color: "#fff", marginBottom: 6 }}>
            {loading ? "Loading…" : `${filtered.length} Properties`}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>AI-ranked · Updated live from Sierra Intelligence</p>
        </div>

        {/* Filter bar */}
        <div style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(211,167,71,.1)",
          borderRadius: 16,
          padding: "16px 20px",
          marginBottom: 28,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}>
          {/* Purpose */}
          <div style={{ display: "flex", background: "rgba(255,255,255,.04)", borderRadius: 8, padding: 2, gap: 2 }}>
            {["all","rent","resale"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: "6px 14px", borderRadius: 7,
                background: mode === m ? "rgba(211,167,71,.2)" : "none",
                border: mode === m ? "1px solid rgba(211,167,71,.3)" : "1px solid transparent",
                color: mode === m ? "#C9A96E" : "rgba(255,255,255,.4)",
                fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
              }}>{m === "all" ? "All" : m === "rent" ? "Rent" : "Buy"}</button>
            ))}
          </div>

          {/* Type filter */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{
            padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(211,167,71,.12)",
            color: "rgba(255,255,255,.7)", fontSize: 11.5, fontFamily: "inherit", cursor: "pointer", outline: "none",
          }}>
            {TYPES.map(t => <option key={t} value={t} style={{ background: "#0d2035" }}>{t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>

          {/* Compound */}
          <select value={compound} onChange={e => setCompound(e.target.value)} style={{
            padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(211,167,71,.12)",
            color: "rgba(255,255,255,.7)", fontSize: 11.5, fontFamily: "inherit", cursor: "pointer", outline: "none",
          }}>
            <option value="" style={{ background: "#0d2035" }}>All Compounds</option>
            {COMPOUNDS.map(c => <option key={c} value={c} style={{ background: "#0d2035" }}>{c}</option>)}
          </select>

          {/* Rooms */}
          <select value={rooms ?? ""} onChange={e => setRooms(e.target.value ? Number(e.target.value) : null)} style={{
            padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(211,167,71,.12)",
            color: "rgba(255,255,255,.7)", fontSize: 11.5, fontFamily: "inherit", cursor: "pointer", outline: "none",
          }}>
            <option value="" style={{ background: "#0d2035" }}>Any Beds</option>
            {[1,2,3,4,5,6].map(r => <option key={r} value={r} style={{ background: "#0d2035" }}>{r} Bed{r > 1 ? "s" : ""}</option>)}
          </select>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(211,167,71,.12)",
            color: "rgba(255,255,255,.7)", fontSize: 11.5, fontFamily: "inherit", cursor: "pointer", outline: "none",
          }}>
            <option value="ai" style={{ background: "#0d2035" }}>AI Score</option>
            <option value="priceLow" style={{ background: "#0d2035" }}>Price: Low to High</option>
            <option value="priceHigh" style={{ background: "#0d2035" }}>Price: High to Low</option>
            <option value="area" style={{ background: "#0d2035" }}>Largest Area</option>
          </select>

          {/* View toggle */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {(["grid","list"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                width: 32, height: 32, borderRadius: 7,
                background: view === v ? "rgba(211,167,71,.15)" : "rgba(255,255,255,.04)",
                border: view === v ? "1px solid rgba(211,167,71,.25)" : "1px solid transparent",
                color: view === v ? "#C9A96E" : "rgba(255,255,255,.35)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {v === "grid" ? "⊞" : "≡"}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {isError ? (
          <div style={{
            textAlign: "center",
            padding: "80px 0",
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(211,167,71,.1)",
            borderRadius: 18,
            maxWidth: 460,
            margin: "0 auto",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 20 }}>We couldn't load the properties. Please try again.</div>
            <button
              onClick={() => refetch()}
              style={{
                padding: "10px 28px",
                borderRadius: 9,
                background: "linear-gradient(135deg,#C9A96E,#A07840)",
                border: "none",
                color: "#07111e",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: ".08em",
              }}
            >Try again</button>
          </div>
        ) : loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 380, borderRadius: 18, background: "rgba(255,255,255,.04)", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg, rgba(255,255,255,.03) 25%, rgba(255,255,255,.06) 50%, rgba(255,255,255,.03) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,.3)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16 }}>No properties match your filters.</div>
            <button onClick={() => { setMode("all"); setTypeFilter("all"); setCompound(""); setRooms(null); }} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 9, background: "rgba(211,167,71,.1)", border: "1px solid rgba(211,167,71,.2)", color: "#C9A96E", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Clear Filters</button>
          </div>
        ) : view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {filtered.map((p, i) => <PropertyCard key={p.id} property={p} index={i} onClick={() => setLocation(`/properties/${p.id}`)} />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((p, i) => <PropertyListRow key={p.id} property={p} onClick={() => setLocation(`/properties/${p.id}`)} />)}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%,100%{background-position:200% 0;} 50%{background-position:-200% 0;} }
        @media(max-width:600px){ div[style*="repeat(auto-fill, minmax(300px"]{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}

function PropertyCard({ property: p, index: i, onClick }: { property: Property; index: number; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const img = p.images?.[0] || `https://images.unsplash.com/photo-${["1600596542815-ffad4c1539a9","1613977257363-707ba9348227","1564013799919-ab600027ffc6","1600210492493-0946911123ea","1500534314209-a25ddb2bd429"][i % 5]}?w=800&q=80`;
  const aiScore = p.ai_score ?? Math.floor(68 + (i % 5) * 7);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 18,
        overflow: "hidden",
        background: "rgba(255,255,255,.04)",
        border: `1px solid ${hover ? "rgba(211,167,71,.3)" : "rgba(211,167,71,.08)"}`,
        cursor: "pointer",
        transform: hover ? "translateY(-6px)" : "none",
        boxShadow: hover ? "0 20px 48px rgba(0,0,0,.4)" : "0 4px 12px rgba(0,0,0,.2)",
        transition: "all .3s cubic-bezier(.2,.8,.2,1)",
      }}
    >
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <img src={img} alt={p.title} loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: hover ? "scale(1.06)" : "scale(1)", transition: "transform .5s" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(7,17,30,.7))" }} />
        {/* AI Score badge */}
        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(7,17,30,.8)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,.5)", letterSpacing: ".1em", textTransform: "uppercase" }}>AI</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: aiScore >= 90 ? "#4ade80" : aiScore >= 75 ? "#C9A96E" : "#f472b6" }}>{aiScore}</span>
        </div>
        {/* Purpose badge */}
        <div style={{ position: "absolute", top: 12, left: 12, background: p.purpose === "for-rent" ? "rgba(96,165,250,.2)" : "rgba(211,167,71,.2)", border: `1px solid ${p.purpose === "for-rent" ? "rgba(96,165,250,.4)" : "rgba(211,167,71,.4)"}`, borderRadius: 6, padding: "3px 9px", fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: p.purpose === "for-rent" ? "#93c5fd" : "#C9A96E", textTransform: "uppercase" }}>
          {p.purpose === "for-rent" ? "For Rent" : "For Sale"}
        </div>
        {/* Type */}
        <div style={{ position: "absolute", bottom: 10, left: 12, fontSize: 10, color: "rgba(255,255,255,.6)", background: "rgba(0,0,0,.4)", backdropFilter: "blur(6px)", borderRadius: 5, padding: "3px 8px", textTransform: "capitalize" }}>
          {p.propertyType}
        </div>
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ fontSize: 10, color: "rgba(211,167,71,.7)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>{p.compound}</div>
        <div style={{ fontSize: 15, color: "#fff", fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>{p.title}</div>
        <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
          {[["🛏", p.bedrooms, "Beds"], ["🛁", p.bathrooms, "Baths"], ["📐", p.area, "sqm"]].map(([icon, val, lbl], j) => (
            <div key={j} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,.45)" }}>
              <span>{icon}</span><span style={{ fontWeight: 600, color: "rgba(255,255,255,.7)" }}>{val}</span><span>{lbl}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#C9A96E", fontFamily: "monospace", letterSpacing: ".02em" }}>{formatPrice(p.price, p.purpose)}</div>
          <button onClick={e => { e.stopPropagation(); onClick(); }} style={{ padding: "8px 16px", borderRadius: 8, background: "linear-gradient(135deg,#C9A96E,#A07840)", border: "none", color: "#07111e", fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>View →</button>
        </div>
      </div>
    </div>
  );
}

function PropertyListRow({ property: p, onClick }: { property: Property; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const img = p.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80";
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", gap: 0, borderRadius: 14, overflow: "hidden",
        background: hover ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.03)",
        border: `1px solid ${hover ? "rgba(211,167,71,.25)" : "rgba(211,167,71,.07)"}`,
        cursor: "pointer", transition: "all .25s",
      }}>
      <div style={{ width: 180, flexShrink: 0, overflow: "hidden" }}>
        <img src={img} alt={p.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 120, transform: hover ? "scale(1.05)" : "scale(1)", transition: "transform .4s" }} />
      </div>
      <div style={{ flex: 1, padding: "16px 20px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontSize: 10, color: "rgba(211,167,71,.7)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 3 }}>{p.compound}</div>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{p.title}</div>
        </div>
        <div style={{ display: "flex", gap: 16, flex: 1, minWidth: 200 }}>
          {[[p.bedrooms, "Beds"], [p.bathrooms, "Baths"], [p.area, "sqm"]].map(([v, l], j) => (
            <div key={j} style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}><span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{v}</span> {l}</div>
          ))}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#C9A96E", fontFamily: "monospace" }}>{formatPrice(p.price, p.purpose)}</div>
        <button onClick={e => { e.stopPropagation(); onClick(); }} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(211,167,71,.1)", border: "1px solid rgba(211,167,71,.2)", color: "#C9A96E", fontSize: 10.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: ".08em" }}>View →</button>
      </div>
    </div>
  );
}
