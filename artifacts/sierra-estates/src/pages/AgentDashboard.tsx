import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useProperties } from "@/hooks/useListings";

function formatPrice(price: number, purpose: string) {
  if (purpose === "for-rent") return `EGP ${(price / 1000).toFixed(0)}K/mo`;
  if (price >= 1_000_000) return `EGP ${(price / 1_000_000).toFixed(1)}M`;
  return `EGP ${price.toLocaleString()}`;
}

const AI_SCORES: Record<string, number> = {};

export default function AgentDashboard() {
  const [, setLocation] = useLocation();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");

  const { data: properties } = useProperties("all", [], null, "ai");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setLocation("/login");
      } else {
        setUserEmail(u.email);
      }
      setLoading(false);
    });
    return unsub;
  }, [setLocation]);

  const handleLogout = async () => {
    await signOut(auth);
    setLocation("/login");
  };

  const saleProps = properties.filter(p => p.purpose === "for-sale");
  const rentProps = properties.filter(p => p.purpose === "for-rent");
  const avgPrice = saleProps.length > 0
    ? saleProps.reduce((a, b) => a + b.price, 0) / saleProps.length
    : 0;

  const STATS = [
    { label: "Active Listings", value: properties.length || 11, icon: "🏠", color: "#C9A96E" },
    { label: "Avg Sale Price", value: avgPrice >= 1_000_000 ? `EGP ${(avgPrice / 1_000_000).toFixed(1)}M` : (avgPrice > 0 ? `EGP ${(avgPrice / 1000).toFixed(0)}K` : "EGP 10.4M"), icon: "💰", color: "#60a5fa" },
    { label: "Investment Return", value: "23.4%", icon: "📈", color: "#4ade80" },
    { label: "ISO Certified", value: "Brokerage 2024", icon: "🏆", color: "#f472b6" },
  ];

  const ACTIVITY = [
    { type: "Inquiry", icon: "💬", msg: "Viewing request for Beachfront Estate", time: "10 mins ago", color: "#C9A96E" },
    { type: "AI Match", icon: "🤖", msg: "Ultra-Luxury Penthouse matched with Client #8492", time: "1 hr ago", color: "#60a5fa" },
    { type: "Status", icon: "📋", msg: "Craftsman Bungalow status changed to Sold", time: "3 hrs ago", color: "#4ade80" },
    { type: "System", icon: "⚙️", msg: "AVM model updated for New Cairo sector", time: "1 day ago", color: "rgba(255,255,255,.3)" },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", background: "#07111e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(211,167,71,.2)", borderTopColor: "#C9A96E", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#07111e", color: "#fff", fontFamily: "Inter,sans-serif" }}>
      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(7,17,30,.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(211,167,71,.12)",
        padding: "0 28px",
        height: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#C9A96E,#A07840)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif,'Cormorant Garamond',serif)", fontWeight: 900, color: "#07111e", fontSize: 13 }}>SE</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: ".04em" }}>Sierra Estates</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: ".1em", textTransform: "uppercase" }}>Agent Dashboard</div>
            </div>
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{userEmail}</div>
          <button
            id="agent-logout"
            onClick={handleLogout}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
              color: "rgba(255,255,255,.7)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,.15)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(220,38,38,.3)"; (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.05)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,.1)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.7)"; }}
          >Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 400, color: "#fff", marginBottom: 6 }}>Agent Dashboard</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>Manage your exclusive portfolio and track performance.</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(211,167,71,.1)",
              borderRadius: 16,
              padding: "22px 20px",
              transition: "all .3s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,.07)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(211,167,71,.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,.04)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(211,167,71,.1)"; }}
            >
              <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Cormorant Garamond',serif", letterSpacing: ".02em" }}>{s.value}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.4)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,.03)", borderRadius: 12, padding: 4, width: "fit-content" }}>
          {["listings", "activity"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 20px",
              borderRadius: 9,
              background: activeTab === tab ? "rgba(211,167,71,.15)" : "none",
              border: activeTab === tab ? "1px solid rgba(211,167,71,.25)" : "1px solid transparent",
              color: activeTab === tab ? "#C9A96E" : "rgba(255,255,255,.4)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .2s",
            }}>{tab === "listings" ? "Property Management" : "Activity Feed"}</button>
          ))}
          <button style={{
            marginLeft: 8,
            padding: "8px 16px",
            borderRadius: 9,
            background: "linear-gradient(135deg,#C9A96E,#A07840)",
            border: "none",
            color: "#07111e",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "inherit",
          }}>+ Add New Property</button>
        </div>

        {activeTab === "listings" ? (
          <div style={{
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(211,167,71,.08)",
            borderRadius: 16,
            overflow: "hidden",
          }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 100px 130px 90px 80px 80px",
              gap: 12,
              padding: "14px 20px",
              borderBottom: "1px solid rgba(255,255,255,.05)",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.3)",
            }}>
              <span>Property</span><span>Type</span><span>Price</span><span>Status</span><span>AI Score</span><span>Actions</span>
            </div>
            {/* Rows */}
            {(properties.length > 0 ? properties.slice(0, 12) : FALLBACK_PROPERTIES).map((p, i) => {
              const aiScore = p.ai_score ?? AI_SCORES[p.id] ?? [94,88,97,79,85,72,91,83,68,89,76,99][i % 12];
              const status = p.purpose === "for-rent" ? "For Rent" : i === 11 ? "Sold" : "For Sale";
              const statusColor = status === "Sold" ? "#4ade80" : status === "For Rent" ? "#60a5fa" : "#C9A96E";
              return (
                <div key={p.id} style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 100px 130px 90px 80px 80px",
                  gap: 12,
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(255,255,255,.03)",
                  alignItems: "center",
                  transition: "background .2s",
                  cursor: "pointer",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,.03)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{p.title}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)", textTransform: "capitalize" }}>{p.propertyType}</span>
                  <span style={{ fontSize: 12, color: "#C9A96E", fontWeight: 700 }}>{formatPrice(p.price, p.purpose)}</span>
                  <span style={{ fontSize: 10, color: statusColor, fontWeight: 700, letterSpacing: ".06em" }}>{status}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: aiScore >= 90 ? "#4ade80" : aiScore >= 75 ? "#C9A96E" : "#f472b6" }}>{aiScore}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ fontSize: 9.5, padding: "4px 8px", borderRadius: 5, background: "rgba(211,167,71,.1)", border: "1px solid rgba(211,167,71,.2)", color: "#C9A96E", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>Edit</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(211,167,71,.07)",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${a.color}18`, border: `1px solid ${a.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: a.color, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 3 }}>{a.type}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)" }}>{a.msg}</div>
                </div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.25)", flexShrink: 0 }}>{a.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          div[style*="gridTemplateColumns: 2fr 100px"] { grid-template-columns: 1fr 80px !important; }
          div[style*="gridTemplateColumns: 2fr 100px"] span:nth-child(n+3) { display: none; }
        }
      `}</style>
    </div>
  );
}

const FALLBACK_PROPERTIES = [
  { id:"1", title:"Luxury Modern Villa", purpose:"for-sale" as const, propertyType:"Villa", price:9_800_000, area:420, bedrooms:4, bathrooms:3, amenities:[], images:[], ai_score:94 },
  { id:"2", title:"Downtown Penthouse", purpose:"for-sale" as const, propertyType:"Penthouse", price:11_200_000, area:280, bedrooms:3, bathrooms:2, amenities:[], images:[], ai_score:88 },
  { id:"3", title:"Beachfront Estate", purpose:"for-sale" as const, propertyType:"Villa", price:18_500_000, area:650, bedrooms:6, bathrooms:5, amenities:[], images:[], ai_score:97 },
  { id:"4", title:"Contemporary City Condo", purpose:"for-rent" as const, propertyType:"Apartment", price:35_000, area:120, bedrooms:2, bathrooms:1, amenities:[], images:[], ai_score:79 },
  { id:"5", title:"Craftsman Bungalow", purpose:"for-sale" as const, propertyType:"Villa", price:5_800_000, area:310, bedrooms:4, bathrooms:3, amenities:[], images:[], ai_score:85 },
  { id:"6", title:"Garden Apartment", purpose:"for-rent" as const, propertyType:"Apartment", price:28_000, area:95, bedrooms:2, bathrooms:1, amenities:[], images:[], ai_score:72 },
  { id:"7", title:"Executive Penthouse", purpose:"for-sale" as const, propertyType:"Penthouse", price:13_500_000, area:350, bedrooms:4, bathrooms:3, amenities:[], images:[], ai_score:91 },
  { id:"8", title:"Compound Duplex", purpose:"for-sale" as const, propertyType:"Villa", price:8_200_000, area:380, bedrooms:5, bathrooms:4, amenities:[], images:[], ai_score:83 },
  { id:"9", title:"Studio Flat", purpose:"for-rent" as const, propertyType:"Apartment", price:12_000, area:55, bedrooms:1, bathrooms:1, amenities:[], images:[], ai_score:68 },
  { id:"10", title:"Twin Villa", purpose:"for-sale" as const, propertyType:"Villa", price:9_400_000, area:400, bedrooms:5, bathrooms:4, amenities:[], images:[], ai_score:89 },
  { id:"11", title:"Smart Apartment", purpose:"for-sale" as const, propertyType:"Apartment", price:4_500_000, area:145, bedrooms:3, bathrooms:2, amenities:[], images:[], ai_score:76 },
  { id:"12", title:"Ultra-Luxury Penthouse", purpose:"for-sale" as const, propertyType:"Penthouse", price:35_000_000, area:500, bedrooms:5, bathrooms:5, amenities:[], images:[], ai_score:99 },
];
