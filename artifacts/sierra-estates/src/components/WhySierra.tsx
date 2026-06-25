import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const WHY_CARDS = [
  { n: "01", tk: "why.c1", icon: "🏆" },
  { n: "02", tk: "why.c2", icon: "🤖" },
  { n: "03", tk: "why.c3", icon: "🌐" },
];

export default function WhySierra() {
  const { t } = useLang();

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 16 } }
  };

  const badgeContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 150, damping: 14 } }
  };

  return (
    <section style={{ background: "var(--ivory-dk)", padding: "90px 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        
        {/* Header */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={headerVariants}
          style={{ marginBottom: 56, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "end" }}
        >
          <div>
            <div className="sec-eyebrow">{t("why.eyebrow")}</div>
            <h2 className="sec-title" style={{ marginBottom: 0 }}>{t("why.title")}</h2>
          </div>
          <p className="sec-sub" style={{ marginBottom: 0, paddingBottom: 6 }}>{t("why.sub")}</p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}
        >
          {WHY_CARDS.map((c, i) => (
            <motion.div 
              key={i} 
              variants={cardVariants}
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(10,26,43,.08)", borderColor: "var(--gold)" }}
              className="why-card" 
              data-n={c.n}
              style={{ transition: "box-shadow 0.25s, border-color 0.25s" }}
            >
              <div style={{ fontSize: 32, marginBottom: 20 }}>{c.icon}</div>
              <h3>{t(`${c.tk}.title`)}</h3>
              <p>{t(`${c.tk}.desc`)}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={badgeContainerVariants}
          style={{ marginTop: 52, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}
        >
          {[
            "🏆 #1 AI Real Estate Platform",
            "✅ 3,200+ Verified Transactions",
            "🌍 Bilingual Support 24/7",
            "🔒 Secure & Confidential",
            "⚡ Instant AI Matching",
          ].map((badge, i) => (
            <motion.div 
              key={i} 
              variants={badgeVariants}
              whileHover={{ scale: 1.05, background: "rgba(211,167,71,.12)" }}
              style={{ padding: "8px 18px", borderRadius: 100, border: "1px solid rgba(211,167,71,.25)", background: "rgba(211,167,71,.06)", fontSize: 11.5, color: "var(--navy)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "default", transition: "background 0.2s" }}
            >
              {badge}
            </motion.div>
          ))}
        </motion.div>
      </div>
      <style>{`@media(max-width:900px){div[style*="gridTemplateColumns:'1fr 1fr'"]{grid-template-columns:1fr!important;}.why-card+.why-card{margin-top:0}div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}
