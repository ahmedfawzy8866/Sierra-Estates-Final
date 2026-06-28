import { useEffect, useRef, useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

function useCountUp(target: number, duration = 2000, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0; const step = target / (duration / 16);
    const id = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.floor(start));
      if (start >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [active, target, duration]);
  return val;
}

function StatItem({ value, suffix, prefix, label, variants }: { value: number; suffix: string; prefix: string; label: string; variants: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const count = useCountUp(value, 2000, active);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <motion.div ref={ref} variants={variants} whileHover={{ scale: 1.05, y: -4 }} className="stat-item">
      <div className="stat-val">{prefix}{count.toLocaleString()}{suffix}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}

export default function Stats() {
  const { t } = useLang();
  const STATS = [
    { value: 4200, suffix: "M+", prefix: "$", label: t("stats.portfolio") },
    { value: 1500, suffix: "+",  prefix: "",  label: t("stats.listings") },
    { value: 3200, suffix: "+",  prefix: "",  label: t("stats.clients") },
    { value: 19,   suffix: "",   prefix: "",  label: t("stats.compounds") },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <section style={{ background: "var(--ivory)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px 16px" }}>
        <div style={{ textAlign: "center", padding: "72px 0 40px" }}>
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="sec-eyebrow" 
            style={{ justifyContent: "center" }}
          >
            {t("stats.title")}
          </motion.div>
        </div>
      </div>
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        whileInView="show" 
        viewport={{ once: true, margin: "-100px" }}
        className="stats-grid"
      >
        {STATS.map((s, i) => <StatItem key={i} {...s} variants={itemVariants} />)}
      </motion.div>
    </section>
  );
}
