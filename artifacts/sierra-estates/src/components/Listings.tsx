import { useState, useEffect, useMemo, useRef } from "react";
import { useLang } from "@/contexts/LanguageContext";

import { useProperties } from "../hooks/useListings";
import type { Property } from "../hooks/useListings";

interface Props {
  mode: string;
  selCmps: string[];
  rooms: number | null;
}

export default function Listings({ mode, selCmps, rooms }: Props) {
  const { t, lang } = useLang();
  const [sort, setSort] = useState("ai");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data, total, loading } = useProperties(mode, selCmps, rooms, sort);

  return (
    <section id="listings" style={{ background: "var(--ivory-dk)", padding: "90px 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, gap: 12, flexWrap: "wrap" }}>
          <div className="rv">
            <div className="sec-eyebrow">{t("listings.eyebrow")}</div>
            <h2 className="sec-title" style={{ marginBottom: 4 }}>
              {loading ? "—" : total} {t("listings.title")}
            </h2>
            <p style={{ fontSize: 11, color: "var(--text-f)", fontFamily: "var(--font-mono)", letterSpacing: ".08em" }}>
              Sourced via Sierra Intelligence · AI-ranked
            </p>
          </div>
          <div className="l-toolbar rv" style={{ marginBottom: 0 }}>
            <select className="l-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="ai">{t("listings.sort.ai")}</option>
              <option value="priceLow">{t("listings.sort.priceLow")}</option>
              <option value="priceHigh">{t("listings.sort.priceHigh")}</option>
              <option value="area">{t("listings.sort.area")}</option>
            </select>
            {(["grid","list"] as const).map(v => (
              <button key={v} className={`vbtn${view === v ? " on" : ""}`} onClick={() => setView(v)} aria-label={v}>
                {v === "grid"
                  ? <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1zM1 7a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1zM1 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1z"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/></svg>
                }
              </button>
            ))}
          </div>
        </div>

        {/* Skeleton loader */}
        {loading && (
          <div className="l-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 18, overflow: "hidden", background: "var(--white)", boxShadow: "0 2px 12px rgba(10,26,43,.06)" }}>
                <div style={{ height: 220, background: "linear-gradient(90deg, #ece9e2 25%, #f5f2eb 50%, #ece9e2 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
                <div style={{ padding: 18 }}>
                  {[80, 120, 60].map((w, j) => (
                    <div key={j} style={{ height: 11, width: `${w}%`, background: "linear-gradient(90deg, #ece9e2 25%, #f5f2eb 50%, #ece9e2 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite", borderRadius: 5, marginBottom: 10 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cards */}
        {!loading && (
          <div className={view === "list" ? undefined : "l-grid"}
            style={view === "list" ? { display: "flex", flexDirection: "column", gap: 14 } : undefined}>
            {data.map((p, i) => (
              <ListingCard
                key={p.id}
                property={p}
                mode={mode}
                view={view}
                lang={lang}
                delay={i % 6}
                hovered={hoveredId === p.id}
                onHover={setHoveredId}
              />
            ))}
            {data.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "72px 0", opacity: .45 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--navy)" }}>No properties matched your filters</p>
                <p style={{ fontSize: 12, color: "var(--text-f)", marginTop: 6 }}>Try adjusting the compound or bedroom filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function formatPrice(price: number, currency: string, mode: string): string {
  if (currency.includes("month")) return `EGP ${(price / 1000).toFixed(0)}K/mo`;
  if (price >= 1_000_000) return `EGP ${(price / 1_000_000).toFixed(1)}M`;
  return `EGP ${price.toLocaleString()}`;
}

const CAT_ICONS: Record<string, string> = {
  villa: "🏡", penthouse: "🌇", apartment: "🏢",
  "twin-house": "🏠", townhouse: "🏘️", duplex: "🏗️",
};

const AI_COLORS: Record<string, string> = {
  "Top Pick": "#D3A747", "High Yield": "#34D399", "Capital Growth": "#60A5FA",
  "Best Value": "#A78BFA", "Expat Favorite": "#F472B6", "Ultra Luxury": "#FBBF24",
  "Smart Investment": "#34D399", "Gulf Investor Pick": "#D3A747",
  "Rental Gem": "#60A5FA", "Walkable District": "#A78BFA",
  "Entry Level": "#94A3B8", "Growing Area": "#34D399",
};

function ListingCard({
  property: p, mode, view, lang, delay, hovered, onHover
}: {
  property: Property; mode: string; view: string; lang: string;
  delay: number; hovered: boolean; onHover: (id: string | null) => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAr = lang === "ar";

  const title = isAr ? p.title_ar : p.title;
  const location = isAr ? p.location_ar : p.location;
  const priceStr = formatPrice(p.price, p.currency, mode);
  const barWidth = Math.max(0, Math.min(100, ((p.ai_score - 8) / 2) * 100));
  const labelColor = AI_COLORS[p.ai_label] ?? "var(--gold)";
  const catIcon = CAT_ICONS[p.category] ?? "🏠";

  // Cycle images on hover
  useEffect(() => {
    if (hovered && p.images.length > 1) {
      intervalRef.current = setInterval(() => {
        setImgIdx(i => (i + 1) % p.images.length);
      }, 1200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setImgIdx(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hovered, p.images.length]);

  if (view === "list") {
    return (
      <div className={`lc rv rv-d${Math.min(delay, 5)}`}
        style={{ display: "flex", flexDirection: "row", overflow: "hidden" }}
        onMouseEnter={() => onHover(p.id)}
        onMouseLeave={() => onHover(null)}>
        <div style={{ width: 220, flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <img src={p.images[imgIdx]} alt={title} loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity .5s", minHeight: 160 }} />
          <div className="lc-ai" style={{ background: `linear-gradient(135deg,${labelColor}22,${labelColor}44)`, border: `1px solid ${labelColor}55`, color: labelColor }}>
            ▲ AI {p.ai_score}
          </div>
        </div>
        <div className="lc-body" style={{ display: "flex", alignItems: "center", flex: 1, gap: 20, flexWrap: "wrap", padding: "16px 20px" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div className="lc-cmp">{p.compound}</div>
            <div className="lc-title">{title}</div>
            <div style={{ fontSize: 10, color: "var(--text-f)", marginTop: 3 }}>{location}</div>
          </div>
          <div className="lc-specs" style={{ flex: 1, minWidth: 200 }}>
            {[[p.bedrooms, "Beds"], [p.bathrooms, "Baths"], [p.area, "sqm"]].map(([v, l], i) => (
              <div key={i} className="lc-spec">
                <span className="lc-sv">{v}</span>
                <span className="lc-sl">{l}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div className="lc-price">{priceStr}</div>
            <div style={{ fontSize: 9, color: "var(--text-f)" }}>Delivery {p.delivery_year}</div>
            <button style={{ padding: "8px 18px", borderRadius: 8, background: "var(--navy)", color: "#fff", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              💬 Inquire
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`lc rv rv-d${Math.min(delay, 5)}`}
      onMouseEnter={() => onHover(p.id)}
      onMouseLeave={() => onHover(null)}>
      <div className="lc-img-wrap">
        <img src={p.images[imgIdx]} alt={title} loading="lazy"
          style={{ transition: "opacity .5s" }} />

        {/* AI badge */}
        <div className="lc-ai" style={{ background: `linear-gradient(135deg,${labelColor}22,${labelColor}44)`, border: `1px solid ${labelColor}55`, color: labelColor }}>
          ▲ AI {p.ai_score}
        </div>

        {/* Label chip */}
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 5, background: `${labelColor}22`, border: `1px solid ${labelColor}66`, borderRadius: 20, padding: "3px 9px", fontSize: 8.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: labelColor, backdropFilter: "blur(8px)" }}>
          {p.ai_label}
        </div>

        {/* Category icon */}
        <div style={{ position: "absolute", bottom: 10, left: 10, zIndex: 5, background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "4px 8px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
          <span>{catIcon}</span>
          <span style={{ fontSize: 8.5, color: "rgba(255,255,255,.8)", fontWeight: 600, textTransform: "capitalize" }}>{p.category}</span>
        </div>

        {/* Delivery year */}
        <div style={{ position: "absolute", bottom: 10, right: 10, zIndex: 5, background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "4px 8px", fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,.7)", fontFamily: "var(--font-mono)" }}>
          {p.delivery_year}
        </div>

        {/* Image dots */}
        {p.images.length > 1 && (
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4, zIndex: 5 }}>
            {p.images.map((_, i) => (
              <div key={i} style={{ width: i === imgIdx ? 14 : 5, height: 5, borderRadius: 3, background: i === imgIdx ? "var(--gold)" : "rgba(255,255,255,.4)", transition: "all .3s" }} />
            ))}
          </div>
        )}

        <div className="lc-view"><span>View Details</span></div>
      </div>

      <div className="lc-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div className="lc-cmp">{p.compound}</div>
          <div style={{ fontSize: 8, color: "var(--text-f)", fontFamily: "var(--font-mono)" }}>{location.split(",")[0]}</div>
        </div>
        <div className="lc-title">{title}</div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", margin: "8px 0" }}>
          {p.tags.slice(0, 3).map((tag, i) => (
            <span key={i} style={{ fontSize: 8, padding: "2px 7px", borderRadius: 10, background: "rgba(0,45,98,.06)", border: "1px solid rgba(211,167,71,.15)", color: "var(--text-m)", fontWeight: 600 }}>{tag}</span>
          ))}
        </div>

        <div className="lc-specs">
          {[[p.bedrooms, "Beds"], [p.bathrooms, "Baths"], [p.area, "sqm"]].map(([v, l], i) => (
            <div key={i} className="lc-spec">
              <span className="lc-sv">{v}</span>
              <span className="lc-sl">{l}</span>
            </div>
          ))}
        </div>

        <div className="lc-price">{priceStr}</div>
        <div className="lc-bar">
          <div className="lc-bar-fill" style={{ width: `${barWidth}%` }} />
        </div>

        <button style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 9, background: "var(--navy)", color: "#fff", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .25s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,var(--gold),var(--gold-lt))"; (e.currentTarget as HTMLButtonElement).style.color = "var(--navy)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--navy)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}>
          <span style={{ fontSize: 14 }}>💬</span> Request Info
        </button>
      </div>
    </div>
  );
}
