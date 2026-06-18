import { useState, useEffect } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { t, toggleLang, isRTL } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { key: "nav.home", href: "#hero" },
    { key: "nav.listings", href: "#listings" },
    { key: "nav.tour", href: "#tour" },
    { key: "nav.about", href: "#about" },
    { key: "nav.contact", href: "#contact" },
  ];

  const orderedLinks = isRTL ? [...navLinks].reverse() : navLinks;

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36,
                background: "linear-gradient(135deg, #C9A96E, #A07840)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.9rem", fontWeight: 700, color: "#0A0A0A",
                flexShrink: 0,
              }}>S</div>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 500, color: "white", lineHeight: 1.1 }}>
                  Sierra Estates
                </div>
                <div style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", opacity: 0.85 }}>
                  {isRTL ? "عقارات فاخرة" : "Premium Real Estate"}
                </div>
              </div>
            </div>

            {/* Desktop Nav — hidden on mobile via CSS */}
            <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              {orderedLinks.map((l) => (
                <button key={l.key} className="nav-link" onClick={() => scrollTo(l.href)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}>
                  {t(l.key)}
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="lang-toggle" onClick={toggleLang}>
                <span style={{ fontSize: "0.85rem" }}>{isRTL ? "🇬🇧" : "🇦🇪"}</span>
                {t("nav.lang")}
              </button>
              <button
                className="btn-gold desktop-cta"
                style={{ padding: "8px 20px", fontSize: "0.72rem" }}
                onClick={() => scrollTo("#contact")}
              >
                {t("nav.cta")}
              </button>
              {/* Hamburger - mobile only */}
              <button
                onClick={() => setMenuOpen(true)}
                className="hamburger-btn"
                style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: 4 }}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button
          onClick={() => setMenuOpen(false)}
          style={{ position: "absolute", top: 20, right: isRTL ? "auto" : 24, left: isRTL ? 24 : "auto", background: "none", border: "none", color: "white", cursor: "pointer" }}
        >
          <X size={28} />
        </button>
        {navLinks.map((l) => (
          <button key={l.key} className="nav-link"
            onClick={() => scrollTo(l.href)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem" }}>
            {t(l.key)}
          </button>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="lang-toggle" onClick={() => { toggleLang(); setMenuOpen(false); }}>
            {t("nav.lang")}
          </button>
          <button className="btn-gold" style={{ padding: "10px 24px" }} onClick={() => scrollTo("#contact")}>
            {t("nav.cta")}
          </button>
        </div>
      </div>

      <style>{`
        .hamburger-btn { display: none; }
        @media (max-width: 900px) {
          .hamburger-btn { display: flex !important; }
          .desktop-nav { display: none !important; }
          .desktop-cta { display: none !important; }
        }
      `}</style>
    </>
  );
}
