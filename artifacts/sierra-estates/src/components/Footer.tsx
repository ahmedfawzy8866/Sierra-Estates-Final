import { useLang } from "@/contexts/LanguageContext";
import { Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  const { t, lang } = useLang();

  const cols = [
    {
      title: t("footer.company"),
      links: [t("footer.about"), t("footer.careers"), t("footer.press"), "Blog"],
    },
    {
      title: t("footer.properties"),
      links: [t("footer.villas"), t("footer.penthouses"), t("footer.apartments"), t("footer.estates")],
    },
    {
      title: t("footer.services"),
      links: [t("footer.consultation"), t("footer.management"), t("footer.investment"), t("footer.relocation")],
    },
  ];

  return (
    <footer style={{ background: "#060606", borderTop: "1px solid rgba(201,169,110,0.1)", padding: "4rem 1.5rem 2rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.2rem" }}>
              <div style={{
                width: 40, height: 40, background: "linear-gradient(135deg, #C9A96E, #A07840)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem", fontWeight: 700, color: "#0A0A0A", flexShrink: 0,
              }}>S</div>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", fontWeight: 500, color: "white" }}>
                  Sierra Estates
                </div>
                <div style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", opacity: 0.75 }}>
                  {t("footer.tagline")}
                </div>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.83rem", lineHeight: 1.8, maxWidth: 260, marginBottom: "1.5rem" }}>
              {lang === "ar"
                ? "نرسم معايير الفخامة العقارية لمن يرفضون التسوية."
                : "Redefining luxury real estate for those who refuse to compromise."}
            </p>
            {/* Social */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { icon: <Instagram size={16} />, label: "Instagram" },
                { icon: <Twitter size={16} />, label: "Twitter" },
                { icon: <Linkedin size={16} />, label: "LinkedIn" },
                { icon: <Youtube size={16} />, label: "YouTube" },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    border: "1px solid rgba(201,169,110,0.2)",
                    background: "rgba(201,169,110,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "rgba(255,255,255,0.5)",
                    transition: "border-color 0.3s, color 0.3s, background 0.3s",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)";
                    (e.currentTarget as HTMLElement).style.color = "var(--gold)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(201,169,110,0.08)";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.2)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(201,169,110,0.04)";
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: "1.2rem" }}>
                {col.title}
              </div>
              {col.links.map((link) => (
                <div key={link} style={{ marginBottom: "0.7rem" }}>
                  <button
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "rgba(255,255,255,0.45)", fontSize: "0.85rem",
                      transition: "color 0.3s", padding: 0,
                      fontFamily: lang === "ar" ? "'Cairo',sans-serif" : "'Inter',sans-serif",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "var(--gold)")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                  >
                    {link}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ margin: "3rem 0 1.5rem", height: 1, background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.15), transparent)" }} />

        {/* Bottom row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.78rem" }}>
            {t("footer.rights")}
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy Policy", "Terms", "Cookies"].map((item) => (
              <button
                key={item}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.25)", fontSize: "0.75rem",
                  transition: "color 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
