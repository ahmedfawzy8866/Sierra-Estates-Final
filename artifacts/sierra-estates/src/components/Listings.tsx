import { useState, useMemo } from "react";
import { useLang } from "@/contexts/LanguageContext";

const IMGS = [
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=75",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=75",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=75",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=75",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=75",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=75",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=75",
  "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=600&q=75",
  "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=600&q=75",
];

const ALL_LISTINGS = [
  { id:1,  cmp:"Hyde Park",          title:"5-Bed Grand Villa",      type:"Villa",      beds:5, bath:6, area:420, price:35000000, priceStr:"EGP 35M", rentStr:"$11,500/mo", ai:9.8, img:0, tag:"Premium" },
  { id:2,  cmp:"Hyde Park",          title:"4-Bed Twin House",       type:"Twin House", beds:4, bath:4, area:280, price:22000000, priceStr:"EGP 22M", rentStr:"$7,200/mo",  ai:9.5, img:1, tag:"Featured" },
  { id:3,  cmp:"Hyde Park",          title:"3-Bed Apartment",        type:"Apartment",  beds:3, bath:2, area:165, price:12500000, priceStr:"EGP 12.5M",rentStr:"$4,100/mo",  ai:9.2, img:2, tag:null },
  { id:4,  cmp:"Mountain View iCity",title:"6-Bed Mega Villa",       type:"Villa",      beds:6, bath:7, area:550, price:42000000, priceStr:"EGP 42M", rentStr:"$13,800/mo", ai:9.6, img:3, tag:"Flagship" },
  { id:5,  cmp:"Mountain View iCity",title:"Penthouse Suite",        type:"Penthouse",  beds:4, bath:4, area:320, price:18000000, priceStr:"EGP 18M", rentStr:"$5,900/mo",  ai:9.4, img:4, tag:"Exclusive" },
  { id:6,  cmp:"Mivida",             title:"3-Bed Garden Villa",     type:"Villa",      beds:3, bath:3, area:195, price:8500000,  priceStr:"EGP 8.5M",rentStr:"$2,800/mo",  ai:9.1, img:5, tag:"Smart Match" },
  { id:7,  cmp:"Mivida",             title:"2-Bed Apartment",        type:"Apartment",  beds:2, bath:2, area:110, price:5200000,  priceStr:"EGP 5.2M",rentStr:"$1,700/mo",  ai:8.9, img:6, tag:null },
  { id:8,  cmp:"Uptown Cairo",       title:"4-Bed Hilltop Villa",    type:"Villa",      beds:4, bath:5, area:360, price:28000000, priceStr:"EGP 28M", rentStr:"$9,200/mo",  ai:9.4, img:7, tag:"Premium" },
  { id:9,  cmp:"Uptown Cairo",       title:"3-Bed Duplex",           type:"Duplex",     beds:3, bath:3, area:220, price:16500000, priceStr:"EGP 16.5M",rentStr:"$5,400/mo",  ai:9.2, img:8, tag:null },
  { id:10, cmp:"Madinaty",           title:"3-Bed Apartment",        type:"Apartment",  beds:3, bath:2, area:165, price:4800000,  priceStr:"EGP 4.8M",rentStr:"$1,580/mo",  ai:8.8, img:0, tag:null },
  { id:11, cmp:"Eastown",            title:"4-Bed Townhouse",        type:"Townhouse",  beds:4, bath:4, area:265, price:14000000, priceStr:"EGP 14M", rentStr:"$4,600/mo",  ai:9.1, img:1, tag:"New" },
  { id:12, cmp:"Villette",           title:"5-Bed Private Villa",    type:"Villa",      beds:5, bath:5, area:380, price:31000000, priceStr:"EGP 31M", rentStr:"$10,200/mo", ai:9.3, img:2, tag:null },
  { id:13, cmp:"Palm Hills NC",      title:"4-Bed Prestige Villa",   type:"Villa",      beds:4, bath:4, area:320, price:24000000, priceStr:"EGP 24M", rentStr:"$7,900/mo",  ai:9.2, img:3, tag:"Best ROI" },
  { id:14, cmp:"Al Rehab",           title:"3-Bed Apartment",        type:"Apartment",  beds:3, bath:2, area:145, price:4200000,  priceStr:"EGP 4.2M",rentStr:"$1,380/mo",  ai:8.7, img:4, tag:null },
  { id:15, cmp:"Taj City",           title:"3-Bed Apartment",        type:"Apartment",  beds:3, bath:2, area:155, price:6800000,  priceStr:"EGP 6.8M",rentStr:"$2,230/mo",  ai:8.9, img:5, tag:"AI Pick" },
  { id:16, cmp:"Sarai",              title:"4-Bed Garden Villa",     type:"Villa",      beds:4, bath:4, area:300, price:19500000, priceStr:"EGP 19.5M",rentStr:"$6,400/mo", ai:9.1, img:6, tag:null },
  { id:17, cmp:"SODIC East",         title:"4-Bed Signature Villa",  type:"Villa",      beds:4, bath:4, area:310, price:26000000, priceStr:"EGP 26M", rentStr:"$8,500/mo",  ai:9.3, img:7, tag:null },
  { id:18, cmp:"Katameya Heights",   title:"5-Bed Prestige Villa",   type:"Villa",      beds:5, bath:6, area:450, price:38000000, priceStr:"EGP 38M", rentStr:"$12,500/mo", ai:9.5, img:8, tag:"Premium" },
];

interface Props {
  mode: string;
  selCmps: string[];
  rooms: number | null;
}

export default function Listings({ mode, selCmps, rooms }: Props) {
  const { t } = useLang();
  const [sort, setSort] = useState("ai");
  const [view, setView] = useState<"grid" | "list">("grid");

  const items = useMemo(() => {
    let list = [...ALL_LISTINGS];
    if (selCmps.length) list = list.filter(x => selCmps.includes(x.cmp));
    if (rooms) list = list.filter(x => x.beds === rooms);
    if (sort === "ai") list.sort((a, b) => b.ai - a.ai);
    else if (sort === "priceLow") list.sort((a, b) => a.price - b.price);
    else if (sort === "priceHigh") list.sort((a, b) => b.price - a.price);
    else if (sort === "area") list.sort((a, b) => b.area - a.area);
    return list;
  }, [selCmps, rooms, sort]);

  const displayedItems = items.slice(0, 12);

  return (
    <section id="listings" style={{ background: "var(--ivory-dk)", padding: "90px 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, gap: 12, flexWrap: "wrap" }}>
          <div>
            <div className="sec-eyebrow">{t("listings.eyebrow")}</div>
            <h2 className="sec-title" style={{ marginBottom: 0 }}>
              {items.length} {t("listings.title")}
            </h2>
          </div>
          <div className="l-toolbar" style={{ marginBottom: 0 }}>
            <select className="l-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="ai">{t("listings.sort.ai")}</option>
              <option value="priceLow">{t("listings.sort.priceLow")}</option>
              <option value="priceHigh">{t("listings.sort.priceHigh")}</option>
              <option value="area">{t("listings.sort.area")}</option>
            </select>
            {(["grid","list"] as const).map(v => (
              <button key={v} className={`vbtn${view === v ? " on" : ""}`} onClick={() => setView(v)}>
                {v === "grid"
                  ? <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1zM1 7a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1zM1 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1z"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/></svg>
                }
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className={view === "grid" ? "l-grid" : "l-grid"} style={{ display: "grid", gridTemplateColumns: view === "list" ? "1fr" : undefined, gap: view === "list" ? 14 : undefined }}>
          {displayedItems.map(l => (
            <ListingCard key={l.id} listing={l} mode={mode} view={view} />
          ))}
          {displayedItems.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "64px 0", opacity: .45 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <p>{t("listings.empty")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ListingCard({ listing, mode, view }: { listing: typeof ALL_LISTINGS[0]; mode: string; view: string }) {
  const { t } = useLang();
  const isPremium = listing.tag === "Premium" || listing.tag === "Flagship";
  const priceStr = mode === "rent" ? listing.rentStr : listing.priceStr;
  const aiScore = listing.ai;
  const barWidth = ((aiScore - 8) / 2) * 100;

  if (view === "list") {
    return (
      <div className="lc" style={{ display: "flex", flexDirection: "row" }}>
        <div className="lc-img-wrap" style={{ width: 200, flexShrink: 0, height: "auto" }}>
          <img src={IMGS[listing.img]} alt={listing.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="lc-ai">▲ AI {aiScore}/10</div>
        </div>
        <div className="lc-body" style={{ display: "flex", alignItems: "center", flex: 1, gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div className="lc-cmp">{listing.cmp}</div>
            <div className="lc-title">{listing.title}</div>
            <div className="lc-price">{priceStr}</div>
          </div>
          <div className="lc-specs" style={{ flex: 1, minWidth: 200 }}>
            {[[listing.beds, "Beds"], [listing.bath, "Baths"], [listing.area, "sqm"]].map(([v, l], i) => (
              <div key={i} className="lc-spec"><span className="lc-sv">{v}</span><span className="lc-sl">{l}</span></div>
            ))}
          </div>
          <button style={{ padding: "9px 18px", borderRadius: 8, background: "var(--navy)", color: "#fff", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            💬 {t("listings.cta")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lc">
      <div className="lc-img-wrap">
        <img src={IMGS[listing.img]} alt={listing.title} loading="lazy" />
        <div className="lc-ai">▲ AI {aiScore}/10</div>
        {listing.tag && (
          <div className={`lc-tag ${isPremium ? "premium" : "standard"}`}>{listing.tag}</div>
        )}
        <div className="lc-view"><span>{t("listings.view")}</span></div>
      </div>
      <div className="lc-body">
        <div className="lc-cmp">{listing.cmp}</div>
        <div className="lc-title">{listing.title}</div>
        <div className="lc-specs">
          {[[listing.beds, "Beds"], [listing.bath, "Baths"], [listing.area, "sqm"]].map(([v, l], i) => (
            <div key={i} className="lc-spec"><span className="lc-sv">{v}</span><span className="lc-sl">{l}</span></div>
          ))}
        </div>
        <div className="lc-price">{priceStr}</div>
        <div className="lc-bar"><div className="lc-bar-fill" style={{ width: `${barWidth}%` }} /></div>
        <button style={{ width: "100%", marginTop: 10, padding: "9px", borderRadius: 8, background: "var(--navy)", color: "#fff", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <span style={{ fontSize: 13 }}>💬</span>{t("listings.cta")}
        </button>
      </div>
    </div>
  );
}
