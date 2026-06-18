import { useState, useRef, useEffect } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";

const BUDGETS_EN = ["< $1M", "$1M – $5M", "$5M – $10M", "$10M – $25M", "$25M+"];
const BUDGETS_AR = ["أقل من مليون $", "١ – ٥ مليون $", "٥ – ١٠ مليون $", "١٠ – ٢٥ مليون $", "أكثر من ٢٥ مليون $"];

export default function Contact() {
  const { t, lang, isRTL } = useLang();
  const [form, setForm] = useState({ name: "", email: "", phone: "", budget: "", message: "" });
  const [sent, setSent] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.querySelectorAll(".reveal,.reveal-left,.reveal-right,.reveal-scale").forEach((c) => c.classList.add("visible")); },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", phone: "", budget: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,110,0.2)",
    borderRadius: 10, padding: "12px 16px", color: "white", fontSize: "0.88rem",
    outline: "none", transition: "border-color 0.3s",
    fontFamily: isRTL ? "'Cairo',sans-serif" : "'Inter',sans-serif",
    textAlign: isRTL ? "right" : "left",
  };

  const budgets = lang === "ar" ? BUDGETS_AR : BUDGETS_EN;

  return (
    <section id="contact" ref={sectionRef as any} style={{ padding: "6rem 1.5rem", background: "#0D0D0D", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "50%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)" }} />

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-label reveal">{t("contact.label")}</span>
          <div className="gold-divider reveal" />
          <h2 className="section-title font-serif reveal" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", whiteSpace: "pre-line" }}>
            {t("contact.title")}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "3rem", alignItems: "start" }}>
          {/* Info Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {[
              { icon: <MapPin size={18} color="var(--gold)" />, label: t("contact.address") },
              { icon: <Phone size={18} color="var(--gold)" />, label: t("contact.phone_val") },
              { icon: <Mail size={18} color="var(--gold)" />, label: t("contact.email_val") },
            ].map((item, i) => (
              <div key={i} className="contact-card reveal-left" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: 46, height: 46, borderRadius: "50%",
                  background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem" }}>{item.label}</div>
              </div>
            ))}

            {/* Property Types */}
            <div className="contact-card reveal-left" style={{ marginTop: "0.5rem" }}>
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "1rem", fontWeight: 600 }}>
                {lang === "ar" ? "مجالات تخصصنا" : "Our Specialties"}
              </div>
              {["Villas", "Penthouses", "Estates", "Off-Plan"].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="reveal-right">
            {sent ? (
              <div style={{
                background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)",
                borderRadius: 16, padding: "3rem", textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
              }}>
                <CheckCircle2 size={48} color="#34D399" />
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: "white" }}>
                  {lang === "ar" ? "شكراً! سنتواصل معك قريباً." : "Thank you! We'll be in touch shortly."}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }} dir={isRTL ? "rtl" : "ltr"}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
                      {t("contact.name")}
                    </label>
                    <input
                      style={inputStyle}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      onFocus={(e) => e.target.style.borderColor = "rgba(201,169,110,0.5)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(201,169,110,0.2)"}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
                      {t("contact.email")}
                    </label>
                    <input
                      type="email"
                      style={inputStyle}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      onFocus={(e) => e.target.style.borderColor = "rgba(201,169,110,0.5)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(201,169,110,0.2)"}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
                      {t("contact.phone")}
                    </label>
                    <input
                      type="tel"
                      style={inputStyle}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      onFocus={(e) => e.target.style.borderColor = "rgba(201,169,110,0.5)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(201,169,110,0.2)"}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
                      {t("contact.budget")}
                    </label>
                    <select
                      style={{ ...inputStyle, cursor: "pointer" }}
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      onFocus={(e) => e.target.style.borderColor = "rgba(201,169,110,0.5)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(201,169,110,0.2)"}
                    >
                      <option value="" style={{ background: "#141414" }}>—</option>
                      {budgets.map((b) => (
                        <option key={b} value={b} style={{ background: "#141414" }}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
                    {t("contact.message")}
                  </label>
                  <textarea
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = "rgba(201,169,110,0.5)"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(201,169,110,0.2)"}
                  />
                </div>

                <button type="submit" className="btn-gold" style={{ alignSelf: isRTL ? "flex-start" : "flex-end", gap: 10 }}>
                  {t("contact.submit")} <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #contact > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 500px) {
          form > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
