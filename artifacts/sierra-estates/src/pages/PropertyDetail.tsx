import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchListings } from "@/lib/apiClient";
import type { Property } from "@/hooks/useListings";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=85",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=85",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&q=85",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=85",
];

const AMENITY_ICONS: Record<string, string> = {
  "Swimming Pool": "🏊", "24/7 Security": "🔒", "Private Garden": "🌿",
  "Gym": "💪", "Parking": "🚗", "Clubhouse": "🏛️", "Kids Area": "🧸",
  "Concierge": "🎩", "Smart Home": "🏠", "Elevator": "🛗",
};

function formatPrice(price: number, purpose: string) {
  if (purpose === "for-rent") return `EGP ${(price / 1000).toFixed(0)}K/mo`;
  if (price >= 1_000_000) return `EGP ${(price / 1_000_000).toFixed(1)}M`;
  return `EGP ${price.toLocaleString()}`;
}

export default function PropertyDetail() {
  const [, params] = useRoute("/properties/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ?? "";
  const [imgIdx, setImgIdx] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const { data: property, isLoading } = useQuery<Property | null>({
    queryKey: ["property", id],
    queryFn: async () => {
      // Try Firestore first
      try {
        const snap = await getDoc(doc(db, "listings", id));
        if (snap.exists()) {
          const d = snap.data() as any;
          return {
            id: snap.id,
            title: d.title || "Property",
            titleAr: d.titleAr,
            compound: d.compound || d.cmp || "Sierra Estates",
            purpose: d.purpose || "for-sale",
            propertyType: (d.propertyType || d.type || "apartment").toLowerCase(),
            price: typeof d.price === "number" ? d.price : parseFloat(String(d.price).replace(/[^0-9.]/g, "")) || 0,
            area: d.area || 0,
            bedrooms: d.bedrooms || d.beds || 0,
            bathrooms: d.bathrooms || d.baths || 1,
            amenities: d.amenities || ["24/7 Security", "Private Garden", "Parking", "Clubhouse"],
            images: d.images?.length ? d.images : FALLBACK_IMAGES,
            pfReferenceNumber: d.pfReferenceNumber ?? null,
            ai_score: d.ai_score ?? d.aiScore,
          } as Property;
        }
      } catch {}
      // Fallback: find from API listings
      const res = await fetchListings({ limit: 200 });
      const found = res.listings.find(l => l.id === id);
      if (!found) return null;
      return {
        id: found.id,
        title: found.title,
        titleAr: found.titleAr,
        compound: found.compound,
        purpose: found.purpose,
        propertyType: found.propertyType,
        price: found.price,
        area: found.area,
        bedrooms: found.beds,
        bathrooms: found.baths,
        amenities: found.amenities,
        images: found.images?.length ? found.images : FALLBACK_IMAGES,
        pfReferenceNumber: found.pfReferenceNumber,
      } as Property;
    },
    enabled: !!id,
  });

  const images = property?.images?.length ? property.images : FALLBACK_IMAGES;
  const aiScore = (property as any)?.ai_score ?? 88;
  const amenities = property?.amenities?.length ? property.amenities : ["Swimming Pool", "24/7 Security", "Private Garden", "Gym", "Parking", "Clubhouse", "Kids Area", "Smart Home"];

  if (isLoading) {
    return (
      <div style={{ minHeight: "100dvh", background: "#07111e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(211,167,71,.2)", borderTopColor: "#C9A96E", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ minHeight: "100dvh", background: "#07111e", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 40 }}>🔍</div>
        <div style={{ fontSize: 18, color: "#fff" }}>Property not found</div>
        <button onClick={() => setLocation("/properties")} style={{ padding: "10px 24px", borderRadius: 9, background: "linear-gradient(135deg,#C9A96E,#A07840)", border: "none", color: "#07111e", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Back to Listings</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#07111e", color: "#fff", fontFamily: "Inter,sans-serif" }}>
      {/* Sticky nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(7,17,30,.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(211,167,71,.1)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setLocation("/properties")} style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          ← Properties
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              const msg = encodeURIComponent(`Hello! I'm interested in: ${property.title} — ${formatPrice(property.price, property.purpose)}`);
              window.open(`https://wa.me/201092048333?text=${msg}`, "_blank");
            }}
            style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.2)", color: "#25D366", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}
          >💬 WhatsApp</button>
          <button
            onClick={() => setContactOpen(true)}
            style={{ padding: "7px 16px", borderRadius: 8, background: "linear-gradient(135deg,#C9A96E,#A07840)", border: "none", color: "#07111e", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
          >Request Info</button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>
          {/* LEFT — Images + Details */}
          <div>
            {/* Main image */}
            <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 12, position: "relative", aspectRatio: "16/9" }}>
              <img src={images[imgIdx]} alt={property.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity .4s" }} />
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.15)", color: "#fff", fontSize: 16, cursor: "pointer", backdropFilter: "blur(8px)" }}>‹</button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.15)", color: "#fff", fontSize: 16, cursor: "pointer", backdropFilter: "blur(8px)" }}>›</button>
                </>
              )}
              {/* AI badge overlay */}
              <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(7,17,30,.85)", backdropFilter: "blur(10px)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)", letterSpacing: ".15em", textTransform: "uppercase" }}>AI Score</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: aiScore >= 90 ? "#4ade80" : "#C9A96E" }}>{aiScore}</div>
              </div>
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {images.slice(0, 5).map((img, i) => (
                  <div key={i} onClick={() => setImgIdx(i)} style={{ width: 72, height: 52, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: `2px solid ${imgIdx === i ? "#C9A96E" : "transparent"}`, transition: "border-color .2s", flexShrink: 0 }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Property info */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#C9A96E", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 6 }}>{property.compound}</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 32, fontWeight: 400, color: "#fff", marginBottom: 4, lineHeight: 1.2 }}>{property.title}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>📍 New Cairo, Egypt</span>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,.2)" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", textTransform: "capitalize" }}>{property.propertyType}</span>
                {property.pfReferenceNumber && (
                  <>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,.2)" }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)", fontFamily: "monospace" }}>REF: {property.pfReferenceNumber}</span>
                  </>
                )}
              </div>

              {/* Specs row */}
              <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
                {[["🛏️", property.bedrooms, "Bedrooms"], ["🛁", property.bathrooms, "Bathrooms"], ["📐", property.area, "sqm"]].map(([icon, val, lbl], i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(211,167,71,.1)", borderRadius: 12, padding: "14px 20px", textAlign: "center", flex: 1, minWidth: 80 }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{val}</div>
                    <div style={{ fontSize: 9.5, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: ".1em" }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.7)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>About This Property</h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.8 }}>
                  This premium {property.propertyType} located in {property.compound}, New Cairo, offers an exceptional living experience with state-of-the-art amenities and breathtaking design. 
                  Spanning {property.area} sqm across {property.bedrooms} bedrooms and {property.bathrooms} bathrooms, it represents the pinnacle of luxury real estate in Egypt's most sought-after compound.
                  Sierra Intelligence has scored this property <strong style={{ color: aiScore >= 90 ? "#4ade80" : "#C9A96E" }}>{aiScore}/100</strong> based on location premium, investment yield, and market demand.
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.7)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>Amenities & Features</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                  {amenities.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.03)", border: "1px solid rgba(211,167,71,.08)", borderRadius: 10, padding: "10px 14px" }}>
                      <span style={{ fontSize: 18 }}>{AMENITY_ICONS[a] ?? "✅"}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Price card */}
          <div style={{ position: "sticky", top: 76 }}>
            <div style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(211,167,71,.18)",
              borderRadius: 20,
              padding: "28px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 60px rgba(0,0,0,.35)",
            }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: "#C9A96E", fontFamily: "monospace", letterSpacing: ".02em", marginBottom: 4 }}>
                {formatPrice(property.price, property.purpose)}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 22, textTransform: "uppercase", letterSpacing: ".1em" }}>
                {property.purpose === "for-rent" ? "Monthly Rent" : "Sale Price"}
              </div>

              {/* Quick info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                {[["Property Type", property.propertyType], ["Bedrooms", property.bedrooms], ["Area", `${property.area} sqm`], ["Status", property.purpose === "for-rent" ? "For Rent" : "For Sale"]].map(([k, v], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)" }}>{k}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.8)", fontWeight: 600, textTransform: "capitalize" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  id="property-request-btn"
                  onClick={() => setContactOpen(true)}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, background: "linear-gradient(135deg,#C9A96E,#A07840)", border: "none", color: "#07111e", fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 24px rgba(211,167,71,.3)" }}
                >Request Viewing</button>
                <button
                  onClick={() => {
                    const msg = encodeURIComponent(`Hello! I'm interested in: ${property.title} — ${formatPrice(property.price, property.purpose)}`);
                    window.open(`https://wa.me/201092048333?text=${msg}`, "_blank");
                  }}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, background: "rgba(37,211,102,.08)", border: "1px solid rgba(37,211,102,.2)", color: "#25D366", fontSize: 12, fontWeight: 700, letterSpacing: ".08em", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >💬 WhatsApp Us</button>
                <a
                  href="tel:+201092048333"
                  style={{ width: "100%", padding: "12px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.6)", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center" as const }}
                >📞 +20 109 204 8333</a>
              </div>

              <p style={{ textAlign: "center", marginTop: 16, fontSize: 9.5, color: "rgba(255,255,255,.2)", letterSpacing: ".05em" }}>
                🔒 Your info is kept strictly confidential
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {contactOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.75)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#0d2035", border: "1px solid rgba(211,167,71,.2)", borderRadius: 20, padding: "32px", width: "100%", maxWidth: 440, position: "relative" }}>
            <button onClick={() => setContactOpen(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "rgba(255,255,255,.4)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
            <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 24, color: "#fff", marginBottom: 4, fontWeight: 400 }}>Request Viewing</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 22 }}>{property.title}</p>
            {sent ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, color: "#4ade80", fontWeight: 700, marginBottom: 6 }}>Request Sent!</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>We'll contact you within 2 hours.</div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { id: "rq-name", label: "Full Name", value: name, set: setName, placeholder: "Ahmed Mohamed", type: "text" },
                  { id: "rq-phone", label: "Phone / WhatsApp", value: phone, set: setPhone, placeholder: "+20 1XX XXX XXXX", type: "tel" },
                ].map(f => (
                  <div key={f.id}>
                    <label style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: ".12em", display: "block", marginBottom: 5 }}>{f.label}</label>
                    <input id={f.id} type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} required
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(211,167,71,.12)", borderRadius: 8, color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(211,167,71,.4)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "rgba(211,167,71,.12)")}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: ".12em", display: "block", marginBottom: 5 }}>Message (optional)</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="I'd like to schedule a viewing this week..."
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(211,167,71,.12)", borderRadius: 8, color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none", height: 80 }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(211,167,71,.4)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(211,167,71,.12)")}
                  />
                </div>
                <button type="submit" style={{ padding: "12px", borderRadius: 10, background: "linear-gradient(135deg,#C9A96E,#A07840)", border: "none", color: "#07111e", fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>Send Request</button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:900px){
          div[style*="gridTemplateColumns: 1fr 360px"]{grid-template-columns:1fr!important;}
          div[style*="position: sticky; top: 76px"]{position:static!important;}
        }
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
    </div>
  );
}
